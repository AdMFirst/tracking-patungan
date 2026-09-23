-- ============================================================
-- MASTER REFERENCE SCHEMA
-- ============================================================
--
-- WARNING: For context only. Do not run as a single script.
-- Last updated: 15 Sept 2026
--
-- ============================================================
-- NOTES & SUGGESTIONS
-- ============================================================
--
-- [N1] `rooms.status` includes 'locked' but it is unused.
--      - Kept for potential future use (freeze room during settlement).
--      - Behavior today: RPCs treat 'locked' the same as 'closed' for
--        writes (they require status = 'open'), but the trigger
--        `finalize_room` does NOT fire on 'locked', so the runner
--        is not marked paid and order_time is not stamped.
--      - If used later, decide:
--          a) Allow 'locked' -> 'open' (currently allowed)
--          b) Allow 'locked' -> 'closed' (currently allowed)
--          c) Block all writes when 'locked' (currently blocked
--             only by RPC-level checks, not DB triggers).
--
-- [N2] `create_payment_method` and `list_payment_methods` are
--      SECURITY INVOKER (not DEFINER). They will BREAK if RLS is
--      enabled on `payment_methods` without policies.
--      - Before enabling RLS, either:
--          a) ALTER FUNCTION ... SECURITY DEFINER
--          b) Add policies: INSERT/SELECT WITH CHECK/USING
--             (user_id = auth.uid())
--
-- [N3] Trigger fire order on `rooms` is alphabetical:
--        trg_finalize_room  (f) -> fires first
--        trg_protect_closed_rooms (p) -> fires second
--      Do NOT rename either trigger. Order is load-bearing: the
--      finalize trigger sets NEW.status = 'closed' in memory; the
--      protect trigger reads status from the table (still 'open'
--      during BEFORE), so it doesn't block its own close.
--
-- [N4] `block_closed_room_mutation` intentionally does NOT guard
--      `room_participants`. Participants must still be able to set
--      paid_at / paid_via after close to settle debts.
--
-- [N5] Two DB backfills are one-time and already applied:
--        - rooms.status backfill from final_total
--        - guest -> user promotion for existing rows
--      Both are no-ops on a fresh DB.
--
-- [N6] RLS is not enabled by default. Enabling requires an audit
--      of every SECURITY INVOKER function (see [N2]).
--
-- [N7] `invoice_sent_at` is present but not read or written by any
--      RPC. It is scaffolding for future automated invoicing.
--
-- [N8] `final_total` is the all-inclusive payable amount
--      (tax, fees, delivery, discounts included). There is no
--      separate tax column by design. The split math is:
--        share = (participant_subtotal / room_subtotal) * final_total
--      which guarantees sum(shares) = final_total.
--
-- [N9] `receipt_url` is present on rooms but not read or written by
--      any RPC. It is scaffolding for post-invoice receipt uploads.
--
-- [N10] Removed columns (do not re-add without discussion):
--        - rooms.room_type   (no behavior)
--        - rooms.tax_and_fees (no behavior)
--        - status value 'locked' is kept but has no behavior.
--
-- [N11] Authorization summary for order item CRUD:
--        Runner      -> may target any participant in the room.
--        Participant -> may target only themselves.
--        Guest       -> cannot call RPCs (no session).
--
-- [N12] Authorization summary for add_room_participant:
--        Only the runner can add participants.
--        Room must be status = 'open'.
--
-- [N13] Idempotency key for add_room_participant matches on:
--        - user_id, OR
--        - lower(guest_email), OR
--        - lower(trim(guest_name)) when no email is provided.
--      If a match is a guest row and the new call resolves to a
--      registered user, the row is promoted in-place.
--
-- [N14] Supabase SQL editor runs as `postgres` with no JWT. To
--      test RPCs that call auth.uid(), you must set claims:
--        SELECT set_config(
--          'request.jwt.claims',
--          json_build_object('sub', '<uuid>')::text,
--          true);
--
-- [N15] Tables not touched by this feature:
--        - notification: not touched by guest support. Future RLS
--          consideration if it becomes user-facing.
--        - ping_logs:    backend-only, not user-facing.
--
-- [N16] Section 8 (`get_user_profiles`) is unchanged by this
--      feature. Kept for reference.
--
-- ============================================================


-- ============================================================
-- SECTION 1: TABLES
-- ============================================================

-- 1.1  notification
CREATE TABLE public.notification (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying DEFAULT ''::character varying,
  tittle character varying DEFAULT 'Notification'::character varying,
  message character varying,
  CONSTRAINT notification_pkey PRIMARY KEY (id)
);

-- 1.2  ping_logs
CREATE TABLE public.ping_logs (
  id integer NOT NULL DEFAULT nextval('ping_logs_id_seq'::regclass),
  host character varying NOT NULL,
  ip_address character varying,
  latency_ms numeric,
  status_code integer,
  is_reachable boolean DEFAULT false,
  error_message text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ping_logs_pkey PRIMARY KEY (id)
);

-- 1.3  rooms
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  platform text,
  restaurant text,
  runner_id uuid,
  final_total numeric,
  created_at timestamp with time zone DEFAULT now(),
  order_time timestamp with time zone,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'locked', 'closed')),
  receipt_url text,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_runner_id_fkey FOREIGN KEY (runner_id)
    REFERENCES auth.users(id)
);

-- 1.4  payment_methods
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tipe character varying,
  norek character varying,
  user_id uuid NOT NULL,
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
);

-- 1.5  room_participants
CREATE TABLE public.room_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  paid_via uuid,
  guest_name text,
  guest_email text,
  invoice_sent_at timestamptz,
  CONSTRAINT room_participants_pkey PRIMARY KEY (id),
  CONSTRAINT room_participants_room_id_fkey FOREIGN KEY (room_id)
    REFERENCES public.rooms(id),
  CONSTRAINT room_participants_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id),
  CONSTRAINT room_participants_paid_via_fkey FOREIGN KEY (paid_via)
    REFERENCES public.payment_methods(id),
  CONSTRAINT chk_participant_identity CHECK (
    user_id IS NOT NULL
    OR guest_name IS NOT NULL
    OR (guest_email IS NOT NULL AND guest_email <> '')
  )
);

CREATE UNIQUE INDEX room_participants_room_user_unique
    ON public.room_participants (room_id, user_id)
    WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX room_participants_room_guest_email_unique
    ON public.room_participants (room_id, lower(guest_email))
    WHERE guest_email IS NOT NULL AND guest_email <> '';

-- 1.6  order_items
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_participant_id_fkey FOREIGN KEY (participant_id)
    REFERENCES public.room_participants(id)
);


-- ============================================================
-- SECTION 2: ENCRYPTION HELPERS
-- ============================================================

CREATE OR REPLACE FUNCTION encrypt_norek(value text)
RETURNS text
LANGUAGE sql
AS $$
  SELECT encode(
    pgp_sym_encrypt(
      value,
      (SELECT decrypted_secret
       FROM vault.decrypted_secrets
       WHERE name = 'ENCRYPTION_KEY'),
       'cipher-algo=aes256, compress-algo=0'
    ),
    'base64'
  );
$$;

CREATE OR REPLACE FUNCTION decrypt_norek(value text)
RETURNS text
LANGUAGE sql
AS $$
  SELECT pgp_sym_decrypt(
    decode(value, 'base64'),
    (SELECT decrypted_secret
     FROM vault.decrypted_secrets
     WHERE name = 'ENCRYPTION_KEY')
  );
$$;

ALTER FUNCTION encrypt_norek(text) SECURITY DEFINER;
ALTER FUNCTION decrypt_norek(text) SECURITY DEFINER;

ALTER FUNCTION encrypt_norek(text)
SET search_path = pg_catalog, extensions, vault;

ALTER FUNCTION decrypt_norek(text)
SET search_path = pg_catalog, extensions, vault;


-- ============================================================
-- SECTION 3: PAYMENT METHOD RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION create_payment_method(
  p_tipe text,
  p_norek text
)
RETURNS payment_methods
LANGUAGE plpgsql
AS $$
DECLARE
  result payment_methods;
BEGIN
  INSERT INTO payment_methods (user_id, tipe, norek)
  VALUES (
    auth.uid(),
    p_tipe,
    encrypt_norek(p_norek)
  )
  RETURNING * INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION list_payment_methods()
RETURNS TABLE (
  id uuid,
  tipe text,
  norek text,
  user_id uuid,
  created_at timestamptz
)
LANGUAGE sql
AS $$
  SELECT
    id,
    tipe,
    decrypt_norek(norek) AS norek,
    user_id,
    created_at
  FROM payment_methods
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;


-- ============================================================
-- SECTION 4: TRIGGERS
-- ============================================================

-- 4.1  finalize_room
CREATE OR REPLACE FUNCTION public.finalize_room()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF OLD.status = 'closed' AND NEW.status <> 'closed' THEN
        RAISE EXCEPTION 'Once a room is closed, it cannot be reopened';
    END IF;

    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'closed' THEN
        IF NEW.final_total IS NULL OR NEW.final_total <= 0 THEN
            RAISE EXCEPTION 'Cannot close room without a valid final_total';
        END IF;

        IF NEW.order_time IS NULL THEN
            NEW.order_time := now();
        END IF;

        UPDATE public.room_participants rp
        SET paid_at = now(), paid_via = NULL
        WHERE rp.room_id = NEW.id
          AND rp.user_id = NEW.runner_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_finalize_room
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.finalize_room();

-- 4.2  block_closed_room_mutation
CREATE OR REPLACE FUNCTION public.block_closed_room_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_room_id uuid;
    v_status text;
BEGIN
    IF TG_TABLE_NAME = 'rooms' THEN
        v_room_id := COALESCE(NEW.id, OLD.id);
    ELSIF TG_TABLE_NAME = 'order_items' THEN
        SELECT room_id INTO v_room_id
        FROM public.room_participants
        WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
    ELSE
        RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id;

    IF v_status = 'closed' THEN
        IF TG_TABLE_NAME = 'rooms' AND TG_OP = 'UPDATE' THEN
            IF NEW.final_total IS DISTINCT FROM OLD.final_total
               OR NEW.runner_id  IS DISTINCT FROM OLD.runner_id THEN
                RAISE EXCEPTION 'Forbidden: Cannot modify financial fields of a closed room';
            END IF;
            RETURN NEW;
        END IF;

        IF TG_TABLE_NAME = 'order_items' THEN
            RAISE EXCEPTION 'Forbidden: Cannot modify order items in a closed room';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

CREATE TRIGGER trg_protect_closed_rooms
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.block_closed_room_mutation();

CREATE TRIGGER trg_protect_closed_order_items
    BEFORE INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.block_closed_room_mutation();

-- 4.3  claim_guest_participants
CREATE OR REPLACE FUNCTION public.claim_guest_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF NEW.email IS NULL OR TRIM(NEW.email) = '' THEN
        RETURN NEW;
    END IF;

    UPDATE public.room_participants rp
    SET user_id = NEW.id,
        guest_email = NULL,
        guest_name  = NULL
    WHERE LOWER(rp.guest_email) = LOWER(NEW.email)
      AND rp.user_id IS NULL
      AND NOT EXISTS (
          SELECT 1 FROM public.room_participants rp2
          WHERE rp2.room_id = rp.room_id
            AND rp2.user_id = NEW.id
      );

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_claim_guest_participants
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.claim_guest_participants();


-- ============================================================
-- SECTION 5: PARTICIPANT MANAGEMENT RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.add_room_participant(
    p_room_id uuid,
    p_email text DEFAULT NULL,
    p_guest_name text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_room_status text;
    v_runner_id uuid;
    v_user_id uuid;
    v_participant_id uuid;
    v_clean_email text;
    v_clean_name text;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    v_clean_email := NULLIF(LOWER(TRIM(p_email)), '');
    v_clean_name  := NULLIF(TRIM(p_guest_name), '');

    IF v_clean_email IS NULL AND v_clean_name IS NULL THEN
        RAISE EXCEPTION 'Invalid parameters: Either email or guest_name must be provided';
    END IF;

    SELECT runner_id, status INTO v_runner_id, v_room_status
    FROM public.rooms WHERE id = p_room_id;

    IF v_runner_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Room does not exist';
    END IF;

    IF v_room_status IS DISTINCT FROM 'open' THEN
        RAISE EXCEPTION 'Forbidden: Cannot add participants to a non-open room';
    END IF;

    IF v_runner_id <> v_caller_id THEN
        RAISE EXCEPTION 'Forbidden: Only the room host can add participants';
    END IF;

    IF v_clean_email IS NOT NULL THEN
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE LOWER(email) = v_clean_email;
    END IF;

    SELECT id INTO v_participant_id
    FROM public.room_participants
    WHERE room_id = p_room_id
      AND (
        (v_user_id IS NOT NULL AND user_id = v_user_id)
        OR (v_clean_email IS NOT NULL AND LOWER(guest_email) = v_clean_email)
        OR (
            v_user_id IS NULL
            AND v_clean_email IS NULL
            AND v_clean_name IS NOT NULL
            AND user_id IS NULL
            AND LOWER(TRIM(guest_name)) = LOWER(v_clean_name)
        )
      );

    IF v_participant_id IS NOT NULL THEN
        IF v_user_id IS NOT NULL THEN
            UPDATE public.room_participants
            SET user_id = v_user_id, guest_email = NULL, guest_name = NULL
            WHERE id = v_participant_id AND user_id IS NULL;
        END IF;
        RETURN v_participant_id;
    END IF;

    INSERT INTO public.room_participants
        (room_id, user_id, guest_name, guest_email)
    VALUES (
        p_room_id,
        v_user_id,
        CASE WHEN v_user_id IS NULL THEN v_clean_name ELSE NULL END,
        CASE WHEN v_user_id IS NULL THEN v_clean_email ELSE NULL END
    )
    RETURNING id INTO v_participant_id;

    RETURN v_participant_id;
END;
$$;


-- ============================================================
-- SECTION 6: ORDER ITEM RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.add_order_item(
    p_room_id uuid,
    p_participant_id uuid,
    p_item_name text,
    p_quantity integer,
    p_unit_price numeric,
    p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_runner_id uuid;
    v_status text;
    v_target_user_id uuid;
    v_item_id uuid;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT runner_id, status INTO v_runner_id, v_status
    FROM public.rooms WHERE id = p_room_id;

    IF v_runner_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Room does not exist';
    END IF;

    IF v_status IS DISTINCT FROM 'open' THEN
        RAISE EXCEPTION 'Forbidden: Cannot add items to a non-open room';
    END IF;

    SELECT user_id INTO v_target_user_id
    FROM public.room_participants
    WHERE id = p_participant_id AND room_id = p_room_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not Found: Participant does not belong to this room';
    END IF;

    IF v_caller_id <> v_runner_id
       AND (v_target_user_id IS NULL OR v_target_user_id <> v_caller_id) THEN
        RAISE EXCEPTION 'Forbidden: You can only add items for yourself';
    END IF;

    INSERT INTO public.order_items
        (participant_id, item_name, quantity, unit_price, notes)
    VALUES
        (p_participant_id, p_item_name, p_quantity, p_unit_price, p_notes)
    RETURNING id INTO v_item_id;

    RETURN v_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_order_item(
    p_item_id uuid,
    p_item_name text,
    p_quantity integer,
    p_unit_price numeric,
    p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_runner_id uuid;
    v_status text;
    v_target_user_id uuid;
    v_room_id uuid;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT rp.room_id, rp.user_id
    INTO v_room_id, v_target_user_id
    FROM public.order_items oi
    JOIN public.room_participants rp ON rp.id = oi.participant_id
    WHERE oi.id = p_item_id;

    IF v_room_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Item does not exist';
    END IF;

    SELECT runner_id, status INTO v_runner_id, v_status
    FROM public.rooms WHERE id = v_room_id;

    IF v_status IS DISTINCT FROM 'open' THEN
        RAISE EXCEPTION 'Forbidden: Cannot modify items in a non-open room';
    END IF;

    IF v_caller_id <> v_runner_id
       AND (v_target_user_id IS NULL OR v_target_user_id <> v_caller_id) THEN
        RAISE EXCEPTION 'Forbidden: You can only modify your own items';
    END IF;

    UPDATE public.order_items
    SET item_name  = p_item_name,
        quantity   = p_quantity,
        unit_price = p_unit_price,
        notes      = p_notes
    WHERE id = p_item_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_order_item(p_item_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_runner_id uuid;
    v_status text;
    v_target_user_id uuid;
    v_room_id uuid;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT rp.room_id, rp.user_id
    INTO v_room_id, v_target_user_id
    FROM public.order_items oi
    JOIN public.room_participants rp ON rp.id = oi.participant_id
    WHERE oi.id = p_item_id;

    IF v_room_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Item does not exist';
    END IF;

    SELECT runner_id, status INTO v_runner_id, v_status
    FROM public.rooms WHERE id = v_room_id;

    IF v_status IS DISTINCT FROM 'open' THEN
        RAISE EXCEPTION 'Forbidden: Cannot modify items in a non-open room';
    END IF;

    IF v_caller_id <> v_runner_id
       AND (v_target_user_id IS NULL OR v_target_user_id <> v_caller_id) THEN
        RAISE EXCEPTION 'Forbidden: You can only delete your own items';
    END IF;

    DELETE FROM public.order_items WHERE id = p_item_id;
END;
$$;


-- ============================================================
-- SECTION 7: READ / REPORTING RPCs
-- ============================================================

-- 7.1  get_room_with_participants
CREATE OR REPLACE FUNCTION public.get_room_with_participants(p_room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_id uuid := auth.uid();
    v_is_authorized boolean;
    v_result jsonb;
BEGIN
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.rooms r
        LEFT JOIN public.room_participants rp
               ON rp.room_id = r.id AND rp.user_id = v_caller_id
        WHERE r.id = p_room_id
          AND (r.runner_id = v_caller_id OR rp.id IS NOT NULL)
    ) INTO v_is_authorized;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Forbidden: Access denied to room details';
    END IF;

    WITH participant_subtotals AS (
        SELECT rp.id AS participant_id,
               COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS subtotal
        FROM public.room_participants rp
        LEFT JOIN public.order_items oi ON oi.participant_id = rp.id
        WHERE rp.room_id = p_room_id
        GROUP BY rp.id
    ),
    room_math AS (
        SELECT
            COALESCE(SUM(ps.subtotal), 0) AS subtotal_sum,
            r.final_total,
            r.status,
            r.runner_id
        FROM participant_subtotals ps
        CROSS JOIN public.rooms r
        WHERE r.id = p_room_id
        GROUP BY r.final_total, r.status, r.runner_id
    )
    SELECT jsonb_set(
        row_to_json(r)::jsonb,
        '{room_participants}',
        COALESCE((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', rp.id,
                    'room_id', rp.room_id,
                    'user_id', rp.user_id,
                    'guest_name', rp.guest_name,
                    'guest_email', CASE WHEN rm.runner_id = v_caller_id
                                        THEN rp.guest_email ELSE NULL END,
                    'joined_at', rp.joined_at,
                    'paid_at', rp.paid_at,
                    'display_name', COALESCE(
                        u.raw_user_meta_data->>'full_name',
                        u.raw_user_meta_data->>'name',
                        rp.guest_name,
                        'Guest'
                    ),
                    'paid_via', CASE
                        WHEN pm.id IS NULL THEN NULL
                        ELSE jsonb_build_object('id', pm.id, 'tipe', pm.tipe)
                    END,
                    'raw_subtotal', ps.subtotal,
                    'total_after_discount', CASE
                        WHEN rm.subtotal_sum = 0 THEN 0
                        WHEN rm.status <> 'closed' THEN ps.subtotal
                        ELSE (ps.subtotal / rm.subtotal_sum) * rm.final_total
                    END
                )
            )
            FROM public.room_participants rp
            LEFT JOIN auth.users u ON u.id = rp.user_id
            LEFT JOIN public.payment_methods pm ON pm.id = rp.paid_via
            LEFT JOIN participant_subtotals ps ON ps.participant_id = rp.id
            CROSS JOIN room_math rm
            WHERE rp.room_id = r.id
        ), '[]'::jsonb),
        true
    ) INTO v_result
    FROM public.rooms r
    WHERE r.id = p_room_id;

    RETURN v_result;
END;
$$;

-- 7.2  get_my_monthly_spending
CREATE OR REPLACE FUNCTION public.get_my_monthly_spending()
RETURNS TABLE (
  month date,
  total_spent numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
WITH my_items AS (
  SELECT
    oi.id,
    oi.quantity,
    oi.unit_price,
    rp.room_id,
    r.final_total,
    date_trunc('month', r.created_at)::date AS month
  FROM public.order_items oi
  JOIN public.room_participants rp ON rp.id = oi.participant_id
  JOIN public.rooms r ON r.id = rp.room_id
  WHERE rp.user_id = auth.uid()
    AND r.status = 'closed'
),
room_totals AS (
  SELECT room_id, SUM(unit_price * quantity) AS room_items_total
  FROM public.order_items oi
  JOIN public.room_participants rp ON rp.id = oi.participant_id
  GROUP BY room_id
),
my_costs AS (
  SELECT
    mi.month,
    (mi.unit_price * mi.quantity)
    * (mi.final_total / rt.room_items_total) AS adjusted_cost
  FROM my_items mi
  JOIN room_totals rt ON rt.room_id = mi.room_id
  WHERE rt.room_items_total > 0
)
SELECT month, SUM(adjusted_cost) AS total_spent
FROM my_costs
GROUP BY month
ORDER BY month DESC;
$$;

-- 7.3  get_my_room_order_details
CREATE OR REPLACE FUNCTION public.get_my_room_order_details()
RETURNS TABLE (
  room_id uuid,
  room_title text,
  platform text,
  restaurant text,
  room_status text,
  room_created_at timestamptz,
  runner_id uuid,
  runner_name text,
  item_id uuid,
  item_name text,
  quantity integer,
  unit_price numeric,
  notes text,
  raw_item_total numeric,
  proportional_item_total numeric,
  paid_at timestamptz,
  paid_via text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
WITH my_items AS (
  SELECT
    r.id AS room_id,
    r.title AS room_title,
    r.platform,
    r.restaurant,
    r.final_total,
    r.runner_id,
    r.status AS room_status,
    r.created_at AS room_created_at,
    COALESCE(r.order_time, r.created_at) AS room_date,
    oi.id AS item_id,
    oi.item_name,
    oi.quantity,
    oi.unit_price,
    oi.notes,
    (oi.unit_price * oi.quantity) AS raw_item_total,
    rp.paid_at,
    pm.tipe AS paid_via
  FROM public.order_items oi
  JOIN public.room_participants rp ON rp.id = oi.participant_id
  JOIN public.rooms r ON r.id = rp.room_id
  LEFT JOIN public.payment_methods pm ON pm.id = rp.paid_via
  WHERE rp.user_id = auth.uid()
),
runner_info AS (
  SELECT u.id AS runner_id,
         COALESCE(
           u.raw_user_meta_data->>'full_name',
           u.raw_user_meta_data->>'name',
           u.email
         ) AS runner_name
  FROM auth.users u
),
room_totals AS (
  SELECT r.id AS room_id,
         SUM(oi.unit_price * oi.quantity) AS room_items_total
  FROM public.order_items oi
  JOIN public.room_participants rp ON rp.id = oi.participant_id
  JOIN public.rooms r ON r.id = rp.room_id
  WHERE r.status = 'closed'
  GROUP BY r.id
)
SELECT
  mi.room_id,
  mi.room_title,
  mi.platform,
  mi.restaurant,
  mi.room_status,
  mi.room_created_at,
  mi.runner_id,
  ri.runner_name,
  mi.item_id,
  mi.item_name,
  mi.quantity,
  mi.unit_price,
  mi.notes,
  mi.raw_item_total,
  CASE
    WHEN mi.room_status <> 'closed'
         OR rt.room_items_total IS NULL
         OR rt.room_items_total = 0 THEN NULL
    ELSE mi.raw_item_total * (mi.final_total / rt.room_items_total)
  END AS proportional_item_total,
  mi.paid_at,
  mi.paid_via
FROM my_items mi
LEFT JOIN runner_info ri ON ri.runner_id = mi.runner_id
LEFT JOIN room_totals rt ON rt.room_id = mi.room_id
ORDER BY
  (mi.room_status = 'closed') ASC,
  mi.room_date DESC,
  mi.item_name;
$$;

-- 7.4  get_runner_payment_methods
CREATE OR REPLACE FUNCTION public.get_runner_payment_methods(p_room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_runner_id uuid;
    v_room_status text;
    v_is_participant boolean;
    v_payment_methods jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT runner_id, status INTO v_runner_id, v_room_status
    FROM public.rooms WHERE id = p_room_id;

    IF v_runner_id IS NULL THEN
        RAISE EXCEPTION 'Not Found: Room does not exist';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.room_participants
        WHERE room_id = p_room_id AND user_id = v_user_id
    ) INTO v_is_participant;

    IF v_runner_id <> v_user_id AND NOT v_is_participant THEN
        RAISE EXCEPTION 'Forbidden: Not authorized to view payment details';
    END IF;

    IF v_room_status IS DISTINCT FROM 'closed' THEN
        RAISE EXCEPTION 'Forbidden: Payment methods available only for closed rooms';
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', id,
            'tipe', tipe,
            'norek', decrypt_norek(norek)
        )
    ), '[]'::jsonb) INTO v_payment_methods
    FROM public.payment_methods
    WHERE user_id = v_runner_id;

    RETURN v_payment_methods;
END;
$$;


-- ============================================================
-- SECTION 8: UNCHANGED UTILITY RPCs
-- ============================================================

-- 8.1  get_user_profiles
CREATE OR REPLACE FUNCTION public.get_user_profiles(user_ids uuid[])
RETURNS TABLE (
    id uuid,
    display_name text,
    picture text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        COALESCE(
            u.raw_user_meta_data->>'name',
            u.raw_user_meta_data->>'full_name',
            'Anonymous'
        )::text AS display_name,
        (u.raw_user_meta_data->>'picture')::text
    FROM auth.users u
    WHERE u.id = ANY(user_ids);
END;
$$;

-- ============================================================
-- END OF MASTER REFERENCE
-- ============================================================