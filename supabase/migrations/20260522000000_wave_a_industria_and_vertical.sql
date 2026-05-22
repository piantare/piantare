-- ============================================================
-- Wave A — rename lab → industria and add vertical parametrization
--
-- This migration is hygiene + future-proofing only. No new feature, no
-- behavior change for end users. See docs/adrs/0007-ecosystem-actors-
-- and-verticals.md §12 Wave A and §15 acceptance criteria.
--
-- Two changes:
--   1. Rename the enum value `lab` → `industria` on `organization_kind`.
--      `lab` is being reserved for diagnostic labs in a future vertical;
--      keeping it for "who produces" would collide.
--   2. Introduce a `vertical_kind` enum with the first value
--      `cannabis_medicinal`, and add a non-nullable `vertical` column on
--      `organizations` and `orders`, defaulted + backfilled to
--      `cannabis_medicinal` for every existing row.
--
-- Deferred (Wave C):
--   - The physical column `products.lab_id` and `orders.lab_id` keep their
--     names for now. Renaming them to `producer_org_id` / `seller_org_id`
--     waits until the buyer/seller model is generalized for escritórios.
--   - Policy names `products_select_for_lab` / `orders_select_for_lab`
--     also kept verbatim — purely identifier strings, no behavioral coupling.
-- ============================================================

-- 1. Rename the enum value. Postgres 10+ supports this without rewriting
--    tables; it updates the catalog only. No row data changes.
alter type public.organization_kind rename value 'lab' to 'industria';

-- 2. New enum for verticals. Starts with the one validated by the first
--    live loop.
create type public.vertical_kind as enum (
  'cannabis_medicinal'
);

-- 3. Add `vertical` to organizations. Default + not null + backfill in
--    a single statement — safe because every existing row gets the default.
alter table public.organizations
  add column vertical public.vertical_kind not null
  default 'cannabis_medicinal';

-- 4. Add `vertical` to orders, same shape. Orders are denormalized so a
--    downstream report doesn't need to join organizations to know the
--    vertical of a transaction.
alter table public.orders
  add column vertical public.vertical_kind not null
  default 'cannabis_medicinal';
