# ADR 0006 — First Live Loop (Lab ↔ Brand MVP)

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2, Step 8
- **Related:** ADR 0001 (migration discipline), ADR 0002 (architecture layering), ADR 0003 (auth + RLS), ADR 0004 (design system), ADR 0005 (i18n shell), `feedback_product_first_mvp`

---

## 1. Context

Step 8 is the first step under the **product-first / MVP-first** directive registered in `feedback_product_first_mvp`: every architectural decision must support a real user flow short-term, infra is only valid if it touches real use.

The target acceptance test is single-sentence:

> A user can create a brand → pick a product from a lab → place an order → see the full cycle through to `shipped`.

That cycle must run end-to-end through the UI, with no manual DB writes and no CLI assistance.

## 2. Decision

### 2.1 Domain model — minimal nouns only

Five tables, no shadow profiles, no v1.3 `perfis_*` legacy:

- `organizations` — `kind = lab | brand`, USD storage, owner_id denormalized.
- `memberships` — `(organization_id, user_id, role)`, with `org_kind` synced by trigger. Unique index on `(user_id, org_kind)` enforces the MVP rule "one org per kind per user".
- `products` — owned by a lab, USD-priced, `is_active` toggle.
- `orders` — brand→lab, snapshots `unit_price_usd` at insert; `total_usd` is `generated always as (quantity * unit_price_usd) stored`.
- `invoices` — one per order, status `pending | paid`, no real money movement.

Status machine for `orders`:

```
created → approved → in_production → ready → shipped
```

No sub-states, no cancel state, no backwards transitions. Enforced in the module layer (`canTransition` in `domains/order`), not in DB CHECK constraints — we keep schema flexible while the workflow is young.

### 2.2 Auth + RLS posture

- Writes go through the service-role admin client (per ADR 0003 Q3=b). Business invariants are checked in code, not in RLS write policies.
- RLS exists only for SELECTs, and is `force row level security` on all five tables.
- Brand-side product catalog is OR-readable across all labs via `products_select_for_brands`; lab-side sees its own (active or not) via `products_select_for_lab`.
- All five tables have `SECURITY DEFINER STABLE` helper `public.is_member_of(org uuid)` to keep policies short.

### 2.3 Status transitions — only the lab drives them

The brand creates the order (`status = created`). From then on, only a lab-side member can advance status. This intentionally encodes the supplier relationship: the brand requests, the lab confirms, the lab produces, the lab ships.

Side effect: transitioning to `approved` calls `generateInvoiceForOrder` idempotently. The invoice opens automatically, no separate billing action required.

### 2.4 Billing — provider interface + mock

`modules/billing` exposes a `PaymentProvider` interface (`createCharge`, `markPaid`) and a `MockPaymentProvider` that returns a synthetic reference and stores nothing of its own. The invoices table is the source of truth. Stripe / StarkBank will plug in by implementing the same interface — no call-site changes required.

`markInvoicePaid` is admin-client today (mock confirm). Real implementations will gate by webhook auth or admin role.

### 2.5 UI — minimal routes, no design system increment

```
/login                  email/password sign-in + sign-up
/onboarding             create first org (kind selector)
/lab/products           lab inbox: my products
/lab/products/new       create product form
/brand/catalog          all active products across labs
/brand/orders/new       create order from a catalog product
/orders                 unified inbox (lab or brand view)
/orders/[id]            detail + status advance + invoice mock
/                       pure router (login → onboarding → kind-specific landing)
```

Hardcoded pt-BR strings — i18n catalog deferred until the flow is alive and the surface stabilizes. Per the operating principles, we do not pay the abstraction cost for translations before there are real translation needs.

### 2.6 Auth gating — `requireSession()` helper

A single helper (`src/app/_lib/gating.ts`) consolidates the redirect rules. No middleware-level redirect: gating happens at the page level so each route owns its preconditions. Overloads narrow the return type:

- `requireSession()` → guarantees `membership` non-null.
- `requireSession({ allowNoOrg: true })` → membership may be null (used only by `/onboarding`).
- `requireSession({ requiredKind: "lab" | "brand" })` → forces a side; if no membership of that kind exists, redirect home.

### 2.7 MVP simplifications

- One org per kind per user (DB index, not just code).
- USD only at storage; org `currency` is display metadata.
- No chat, no uploads, no multi-currency conversion, no audit log, no agents.
- Single primary membership picked as "most recently created" for the landing page.

## 3. Consequences

### Positive

- End-to-end flow runs without CLI or admin tooling.
- Schema and code reflect product reality, not speculative vertical features.
- Status machine + invoice generation collocated in `transitionOrderStatus` makes the loop trivially observable.
- `PaymentProvider` boundary keeps the path open for real billing without invasive refactors.

### Negative / deferred

- No optimistic UI, no client-side validation beyond HTML attributes.
- No backwards transitions, no cancel — once you click `approved`, the invoice is open.
- `markInvoicePaid` is unauthenticated beyond admin-client gating; needs real auth before any real billing provider plugs in.
- Single-membership-per-kind is a hard floor; multi-org users will require schema relaxation later.
- Status transitions could (later) be enforced at the DB layer with a trigger; we accept module-only enforcement at MVP.

## 4. Out of scope (Step 8)

- Real money movement (Stripe / StarkBank integration).
- Cancel / refund flows.
- Multi-currency display.
- Agent / patient flow from the cannabis vertical (vertical #0 layered on top later).
- Chat between brand and lab on an order.
- Audit log of status transitions.

## 5. References

- Migration: `supabase/migrations/20260518212431_step8_first_live_loop.sql`
- Domain: `src/domains/{organization,product,order}/`
- Modules: `src/modules/{onboarding,products,orders,billing,auth}/`
- UI: `src/app/{login,onboarding,lab,brand,orders}/`
- Gating: `src/app/_lib/gating.ts`
