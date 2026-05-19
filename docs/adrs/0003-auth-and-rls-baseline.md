# ADR 0003 — Auth + RLS Baseline

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2, Step 5
- **Related:** ADR 0001 (migration discipline), ADR 0002 (layering), `feedback_middleware_auth_rls_coherence`, `project_next16_spike`

---

## 1. Context

Phase 1 fixed the trio principle: middleware, auth, and RLS evolve as one coherent system. Phase 2 Step 5 is the first concrete materialization of that trio. Before any feature lands, the foundation must answer four questions:

1. Where does the user identity come from on the server, in Next 16 (async cookies)?
2. Who can talk to Postgres, with what key, in what shape of client?
3. What is the default RLS posture for the 28 v1.3 tables when there are no business policies yet?
4. How are admin paths handled — through RLS policy or out-of-band?

The cloud project already had a non-trivial pre-state when this ADR was written:
- RLS was enabled on all 28 tables (from `0001_baseline`).
- 18 policies shipped with v1.3 (per-table, per-cmd, mostly `auth.uid() = owner_id`).
- 14 tables had no policy → effectively deny-by-default to everyone (including `perfis_*` for 11 of the 14 actor types).
- No helper functions, no `force row level security`, no admin policy.
- Zero rows in every table.

This ADR records the four decisions and the additive migration that materializes them.

## 2. Decision

### 2.1 Server identity uses `@supabase/ssr` with async cookies

- The browser client is `services/supabase/client.ts` — `createBrowserClient` with the anon key.
- The server client is `services/supabase/server.ts` — a **per-request async factory** that calls `await cookies()` (Next 16 sync APIs are removed) and wires `getAll`/`setAll` callbacks.
- The admin client is `services/supabase/admin.ts` — `createClient` from `@supabase/supabase-js` with the service-role key. Guards: throws if `NEXT_RUNTIME === 'edge'` and throws if `SUPABASE_SERVICE_ROLE_KEY` is absent.
- No module-level caching of any client. Each Server Component / Server Action / Route Handler creates its own.

### 2.2 Middleware runs on nodejs and only refreshes the session

- File: `middleware.ts` (kept; `proxy.ts` rename remains deferred — `feedback_middleware_auth_rls_coherence`).
- Runtime: `runtime: 'nodejs'` (not edge). Tradeoff accepted: slightly higher cold start in exchange for one runtime model across middleware + future `proxy.ts` + admin paths.
- Single responsibility: read the user via `supabase.auth.getUser()` to trigger token refresh; mirror cookies onto the response via `setAll`. **No locale routing, no role gating, no redirects.** Locale belongs to Step 7. Role gating belongs to Server Components / Server Actions via `requireRole`.

### 2.3 Env contract is zod-validated and fail-fast

- `src/config/env.ts` parses `process.env` against a Zod schema on module load. A missing or invalid env crashes boot with a readable error.
- `SUPABASE_SERVICE_ROLE_KEY` is **optional**: if absent, the admin client throws on use (not on import). This keeps local dev frictionless and the prod boundary explicit.

### 2.4 Auth use-cases live in `modules/auth/`

- `getCurrentUser()` reads the Supabase user + joins `profiles.tipo`/`status` and returns a domain `CurrentUser` (`@/domains/identity`).
- `requireUser()` throws `UnauthorizedError` if anonymous.
- `requireRole(roles)` throws `ForbiddenError` if role does not match. Role `admin` always satisfies.
- Errors are domain types in `@/domains/identity` so callers (route handlers, Server Actions) can translate to HTTP / UI states without coupling to a framework.

### 2.5 RLS baseline migration is additive, not redefinitive

Migration: `supabase/migrations/20260518115920_rls_baseline.sql`.

What it does:
- `ALTER TABLE ... FORCE ROW LEVEL SECURITY` on all 28 public tables. This closes the owner-bypass — even a connection authenticated as `postgres` is gated. Service-role still bypasses via the JWT `service_role` claim.
- Creates three `SECURITY DEFINER STABLE` helper functions, search_path locked to `public`:
  - `is_admin()` → reads `profiles.tipo = 'admin'` for `auth.uid()`.
  - `auth_user_role()` → returns the caller's `ator_tipo` (or null).
  - `is_approved()` → reads `profiles.status = 'aprovado'` for `auth.uid()`.
- Grants execute on the three helpers to `anon, authenticated`. Helpers only ever return the caller's own status, so exposure is acceptable.

What it does **not** do:
- Does not modify or drop any of the 18 inherited policies (they are part of the baseline; see §3 for the inherited-policy contract).
- Does not add new policies to the 14 unpoliced tables (`anamneses_templates`, `comunidade_likes`, `comunidade_reportes`, and the 11 `perfis_*` tables). Each gets a policy in the migration that activates its feature — per the vertical-as-protocol principle.
- Does not add admin-bypass policies anywhere. Admin paths use `services/supabase/admin.ts` (service-role) — see §2.6.

### 2.6 Admin paths use service-role, not RLS policies (Q3=b)

- Admin code lives in explicit paths and explicitly imports `createAdminClient`.
- No policy granting blanket access to role `admin` exists on any table.
- Pros: explicit, auditable, fewer policies to reason about. Cons: an admin path bug bypasses RLS — so admin paths must be the smallest possible surface and reviewed accordingly.

### 2.7 `profiles_public_approved` is open and accepted as tech-debt (Q1=c)

- The inherited policy allows **any authenticated user** to `SELECT` any `profiles` row with `status = 'aprovado'`.
- This is more open than a strict deny-by-default model. It is preserved unchanged at this stage because the product decision (open directory vs same-org-only vs gated by consentimento) is a UX/go-to-market call, not infra.
- **Followup:** Open question for Phase 3 product review. Tracked here in §6.

### 2.8 The 14 unpoliced tables stay closed (Q2=a)

- `anamneses_templates`, `comunidade_likes`, `comunidade_reportes`, `perfis_*` (11) are RLS-on, FORCE-on, policy-empty. Result: nobody can read or write them through the API.
- Each becomes operational only when a future migration adds the policies needed by the feature that uses it. For `perfis_*`, that is the feature where the actor onboards.

## 3. Inherited policy contract (informative)

The 18 policies from `0001_baseline` are part of the system's effective security model. They are listed here so future ADRs can reason about deltas. They are **not** redefined in this migration.

| Table | Policy | Cmd | Predicate (summary) |
|---|---|---|---|
| profiles | profiles_self | ALL | `auth.uid() = id` |
| profiles | profiles_public_approved | SELECT | `status = 'aprovado'` (any auth user) |
| familias | familias_admin | ALL | `auth.uid() = admin_id` |
| familia_membros | familia_membros_self | ALL | `auth.uid() = profile_id OR family admin` |
| vinculos | vinculos_self | ALL | `auth.uid() IN (solicitante_id, destinatario_id)` |
| exames | exames_cliente | ALL | `auth.uid() = cliente_id` |
| biomarcadores | biomarcadores_cliente | ALL | `auth.uid() = cliente_id` |
| anamneses_respostas | anamneses_cliente | ALL | `auth.uid() = cliente_id` |
| consentimentos | consentimentos_cliente | ALL | `auth.uid() = cliente_id` |
| consentimentos | consentimentos_autorizado | SELECT | `auth.uid() = autorizado_id AND ativo` |
| notificacoes | notif_self | ALL | `auth.uid() = destinatario_id` |
| base_cientifica | ciencia_read | SELECT | `status='publicado' AND auth.uid() NOT NULL` |
| base_cientifica | ciencia_submit | INSERT | `auth.uid() = submetido_por` |
| comunidade_posts | comunidade_read | SELECT | `removido = false AND auth.uid() NOT NULL` |
| comunidade_posts | comunidade_write | INSERT | `auth.uid() = autor_id` |
| comunidade_posts | comunidade_own | UPDATE | `auth.uid() = autor_id` |
| creator_publicacoes | creator_read | SELECT | `publicado AND NOT removido` |
| creator_publicacoes | creator_write | ALL | `auth.uid() = autor_id` |

## 4. Consequences

### Positive

- One coherent auth stack: env → middleware → server client → modules/auth → domain types.
- Defense in depth: even `postgres` can't read rows without going through the service-role boundary.
- Admin paths are explicit and few — easy to audit.
- Helper functions are tiny, well-scoped, and ready for future policies (e.g. `using (is_member_of_org(org_id))` once Org tables land).
- Smoke endpoint `/_health` proves the wiring without exposing data.

### Negative / tradeoffs accepted

- **Open directory tech-debt**: `profiles_public_approved` lets any authenticated user list all approved profiles. Accepted until product decides.
- **Per-table policy backlog**: each new feature in `cannabis-br`, future verticals, or `perfis_*` flow must ship its own policy migration. That is the work, not the cost.
- **No admin RLS policy**: an admin-path bug bypasses RLS. Mitigation: keep admin code minimal and reviewed; add CI checks (later ADR) that flag `createAdminClient` imports outside an explicit allowlist.

### Risks

- `getCurrentUser` issues 2 DB calls per server render (auth + profiles join). With heavy traffic and unauthenticated peeks, this can show up. Mitigation if needed: JWT custom claims for role (deferred per Q2 of Step 5 risk decisions; not now).
- Locking helper `search_path = public` is the right default but means functions can't be moved to another schema later without a migration update. Accepted.
- The MCP-applied migration was recorded with version `20260518115920` while the file was originally named `20260518120000`. File was renamed to match the DB version to avoid `supabase db push` drift. Future migrations: pass the same timestamp into `apply_migration` and the filename to keep them identical.

## 5. Implementation snapshot (state at 2026-05-18)

```
Repo:
  .env.local.example                            NEW
  middleware.ts                                 NEW
  src/config/{env,index}.ts                     NEW
  src/domains/identity/{types,errors,index}.ts  NEW
  src/services/supabase/{client,server,admin}.ts NEW
  src/modules/auth/{get-current-user,require,index}.ts NEW
  src/app/_health/route.ts                      NEW
  supabase/migrations/20260518115920_rls_baseline.sql NEW
  src/types/database.ts                         REGENERATED

Cloud:
  All 28 public tables: relrowsecurity=true, relforcerowsecurity=true
  Functions added: public.is_admin(), public.auth_user_role(), public.is_approved()
  Existing 18 policies: untouched
  supabase_migrations.schema_migrations:
    version=0001                name=baseline
    version=20260518115920      name=20260518120000_rls_baseline
```

## 6. Followups (not in this ADR)

- Product decision on `profiles_public_approved` shape (open directory vs same-org vs gated).
- ADR on Server Action authorship and the `requireRole` / Server Action / RLS interaction (Step 6 or 7).
- ADR on Org-based RLS (`is_member_of_org`) once organization tables stabilize.
- Per-vertical policy migrations for `perfis_*` (each lands with the feature that uses it).
- CI guard: detect `createAdminClient` imports outside an allowlist.
- Eventually: JWT custom claims for `role` and `approval_status` to remove the profiles join per RLS check.
