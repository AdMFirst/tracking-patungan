-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid,
  item_name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric NOT NULL CHECK (unit_price >= 0::numeric),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_user_id_fkey FOREIGN KEY (participant_id) REFERENCES auth.users(id)
);
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tipe character varying,
  norek character varying,
  user_id uuid NOT NULL,
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.room_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  user_id uuid,
  joined_at timestamp with time zone DEFAULT now(),
  paid_at timestamp with time zone,
  paid_via uuid,
  CONSTRAINT room_participants_pkey PRIMARY KEY (id),
  CONSTRAINT room_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT room_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT room_participants_paid_via_fkey FOREIGN KEY (paid_via) REFERENCES public.payment_methods(id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text,
  platform text,
  restaurant text,
  runner_id uuid,
  final_total numeric,
  created_at timestamp with time zone DEFAULT now(),
  order_time timestamp with time zone,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_runner_id_fkey FOREIGN KEY (runner_id) REFERENCES auth.users(id)
);