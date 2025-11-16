# Tracking Patungan – Product Specification

## Purpose
- Keep a shared record of every group delivery run so nobody loses track of who ordered, who fronted the payment, or which app was used.
- Replace ad-hoc chat logs and spreadsheets with a lightweight tool that surfaces balances in real time.

## Primary Users
- **Runner** – person placing the group order and paying the delivery platform or restaurant.
- **Joiner** – anyone adding their own meal(s) to an open order and settling their debt afterwards.
- **Treasurer** (optional) – friend that audits the history of orders to ensure everyone is square.

## Key Concepts & Data
- **Group Order Session**: title, restaurant/platform, order date/time, delivery fee, promo/voucher data, payment method, currency.
- **Participant**: name, nick/emoji, preferred payment channel, default share for common fees (delivery, tax, tips).
- **Order Item**: dish name, quantity, base price, add-ons, per-item notes, assigned participant(s).
- **Shared Fees**: delivery, service, tax, tip, miscellaneous; split equally, by percentage, by item price, or custom overrides.
- **Payment Record**: payer, payee, amount, payment method, proof/reference, status (pending/confirmed).
- **Reference Attachments**: screenshots/links to GrabFood/GoFood/ShopeeFood orders, receipts, or spreadsheet exports.

## Functional Requirements
1. **Order Session Lifecycle**
   - Create/open a session with metadata.
   - Auto-generate a shareable invite link/QR for friends to join.
   - Lock session once the runner submits the order; allow edits only via manual override/audit trail.
2. **Participant & Item Management**
   - Joiners add themselves (name + payment handle) without creating full accounts.
   - Add/edit/delete items; support splitting one item across multiple participants.
   - Auto-calc per-person totals including proportional fees.
   - Flag items that are still “unconfirmed” so the runner knows who hasn’t finalized.
3. **Fee & Adjustment Handling**
   - Specify delivery/tax/tip per session; choose split strategy (equal, by subtotal, manual percentages).
   - Allow manual adjustments (e.g., runner applied voucher) and show how the discount propagates.
4. **Payment Tracking**
   - Runner records who has paid; joiners can mark “I’ve transferred” for the runner to confirm.
   - Support multiple payment channels (cash, bank transfer, GoPay, Dana, ShopeePay, etc.).
   - Reminder flow: automatically surface overdue balances and optionally send templated nudges via WhatsApp/Telegram copy.
5. **History & Reporting**
   - Session list with filters (by runner, by month, by app).
   - Per-person ledger summarizing “owed” vs “paid” totals over time.
   - Export options: CSV/Google Sheets and shareable summary (including screenshots/receipts).
6. **Collaboration & Transparency**
7. **Access Control**
   - Simple username/password auth for all users.
   - Registration requires a valid invitation code shared by existing members/admins.
   - Admin view to generate/revoke invitation codes and audit account activity.
   - Activity log (who added/edited items, confirmed payments, applied discounts).
   - Comment thread per session for clarifications.
   - Read-only “public summary” mode for sharing with people who don’t participate.

## Non-Functional Requirements
- **Device Support**: responsive web (mobile-first), PWA installable for quick access during ordering.
- **Realtime Feel**: leverage live updates (e.g., WebSockets/Pusher/Supabase) so edits propagate instantly between friends.
- **Offline Tolerance**: cache the most recent session so the runner can keep editing while in transit and sync later.
- **Data Privacy**: keep sessions private to invited users; protect payment handles; optional passcode for sensitive orders.
- **Auditability**: immutable record of finalized sessions; edits post-lock create new revision entries.
- **Localization**: start with Bahasa Indonesia + English; currency formatting for IDR, SGD, MYR.

## Deployment & Storage Strategy
- **Primary Option**: Supabase (PostgreSQL + Auth + Realtime) aligns with Vercel deployments, offers invitation-code based auth logic via edge functions, and handles row-level security for per-session access control.
- **Alternative**: Planetscale/MySQL with Vercel KV or Neon Postgres; requires custom auth wiring, so only pick if Supabase limits are hit.
- **Static Assets & Hosting**: Deploy the Vue frontend on Vercel; use Supabase storage buckets for receipts/screenshots if needed.

## Current Implementation Status
- Focused on the Vue frontend specification/UI; backend integrations (Supabase/Postgres) are postponed.
- Placeholder services or environment variables that reference Supabase are unused until a backend is chosen.
- When ready to add a backend, revisit the earlier Supabase-oriented plan or adapt it to the selected service.

## Success Metrics
- Runner can create and share a session in under 30 seconds.
- Joiner can add their meal and mark payment in under 5 taps.
- All participants have zero outstanding payments within 24 hours in at least 80% of sessions.

## Future Enhancements
- Smart OCR of delivery app receipts to auto-import items.
- Automatic exchange-rate handling for cross-border payments.
- Loyalty/incentive tracking (e.g., who ran most orders, gamified badges).
- Integration with WhatsApp bots or Slack commands to open/close sessions.

This specification should guide the next iterations of the Vue app, replacing the starter Vite content with features that serve real shared-order tracking needs.
