# ADR 0001 — Supabase Baseline & Migration Discipline

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2 (production-first foundation)
- **Related:** project_phase1_decisions, project_next16_spike, feedback_middleware_auth_rls_coherence

---

## 1. Context

Piantare's data layer runs on Supabase Cloud (project `Piantare`, id `ydmcyituvsjnfagxjgka`, region `us-east-2`, Postgres 17.6.1.121). At the moment this ADR is written, the project already contains the **PT-BR schema v1.3** fully deployed: 28 base tables, 1 view (`admin_profiles_view`), 2 enums (`aprovacao_status`, `ator_tipo`), 3 functions, 1 trigger, 18 RLS policies. All tables are empty — no production data exists anywhere.

The schema was originally applied via the Supabase SQL editor, with no migration history persisted (`supabase_migrations.schema_migrations` did not exist). This created an implicit risk: any future schema change applied through the same SQL editor would drift the cloud away from the source repo, with no audit trail and no way to reproduce the schema in a fresh environment (CI, branch DBs, local Docker if ever adopted).

Phase 2 makes Supabase the production substrate of the system. Before any application code is written against it (auth, RLS, Server Actions, types), the schema lifecycle must be put on firm ground.

This ADR also has to be read alongside `feedback_middleware_auth_rls_coherence`: middleware, auth, and RLS evolve as one coherent system. Migration discipline is the foundation under the RLS leg of that triangle — without versioned schema, RLS reviews are impossible.

## 2. Decision

### 2.1 Schema v1.3 is the frozen baseline of the system

The current cloud schema is adopted as **the baseline**. Its verbatim DDL is committed to the repo as:

```
supabase/migrations/0001_baseline.sql
```

This file is **append-only history**, not editable. It is the snapshot that every future migration starts from.

### 2.2 Migration history is initialized retroactively

`supabase_migrations.schema_migrations` is created in the cloud with a single row marking `0001_baseline` as already applied. The migration is **never re-run** — the schema is already deployed. This row exists so that `supabase db push` and `supabase db diff` see a consistent starting state.

### 2.3 The Supabase CLI is the only path to schema change

From this ADR forward:

- **No more SQL editor changes.** The Supabase web SQL editor is read-only territory for the team. Any DDL written there is considered drift and must be reverted or reverse-engineered into a migration.
- **All schema changes go through `supabase/migrations/*.sql`.**
- Flow: write migration file → `supabase db push --linked` → regenerate types with `npm run db:types` → commit.

### 2.4 Migrations are append-only and versioned

- Once a migration is merged to `main`, it is immutable. Fixes happen in a new migration, never by editing history.
- A migration file represents a unit of forward intent. Down-migrations are not part of the discipline — recovery is via point-in-time restore plus a forward-correcting migration.

### 2.5 Naming convention

- **`0001_baseline.sql`** is preserved as the historical marker of the system. Sequential numeric prefix is an explicit exception, justified by being the system's zero point.
- **All migrations from `0002` onward use the Supabase CLI timestamp convention: `YYYYMMDDHHMMSS_<name>.sql`.** This aligns with `supabase migration new <name>` defaults and avoids merge conflicts on sequential numbers across parallel branches.

Example future filenames:

```
supabase/migrations/0001_baseline.sql                          # exception, marco zero
supabase/migrations/20260520143000_member_shadow_profile.sql
supabase/migrations/20260522091500_timeline_event_indexes.sql
```

### 2.6 Generated types are derived, never hand-edited

`src/types/database.ts` is generated from the cloud schema via the Supabase CLI / MCP. It is committed (so diffs are reviewable in PRs) but never edited by hand. Regenerate after every applied migration:

```
npm run db:types
```

### 2.7 RLS belongs in migrations

RLS policies, helper functions, triggers, and any schema-level enforcement are migration content like any other DDL — not configuration. They must never be modified through the dashboard or the SQL editor.

## 3. Consequences

### Positive

- Schema state is fully reproducible from `main` + Supabase CLI alone.
- PRs touching schema are reviewable: the migration file *is* the proposal.
- RLS evolution is auditable and pairs naturally with middleware/auth reviews (per `feedback_middleware_auth_rls_coherence`).
- Future environments (CI ephemeral branches, eventual local Docker, second region) can be bootstrapped from the same migration chain.
- Generated types stay in lockstep with the database — no silent drift between TS and Postgres.

### Negative / tradeoffs accepted

- The baseline is one large file rather than a series of small intentful migrations. We lose the history of *how* v1.3 was reached. This is accepted because v1.3 predates Phase 2 and no team time should be spent reconstructing its history.
- The team must internalize the "no SQL editor" rule. Until tooling enforces this (e.g. revoking write grants on the dashboard role for non-emergency accounts), the discipline is social.
- The numeric-prefix exception for `0001_baseline.sql` is a minor inconsistency. Accepted to preserve the symbolic marker of the system's zero point.

### Risks

- A team member running ad-hoc DDL in the SQL editor will silently drift the cloud from the migration chain. Mitigation: periodic `supabase db diff --linked` as a sanity check; eventually enforce via role permissions.
- Migration history was initialized retroactively. If the recorded row is ever lost, `supabase db push` will attempt to re-run `0001_baseline.sql` against a populated schema and fail. Mitigation: backup of `supabase_migrations.schema_migrations` rows alongside DB backups.

## 4. Implementation snapshot (state at 2026-05-18)

```
Repo:
  supabase/
    migrations/
      0001_baseline.sql        # schema v1.3 verbatim (21 KB, 618 lines)
  src/
    types/
      database.ts              # generated from cloud (1729 lines, 53 KB)
  docs/
    adrs/
      0001-supabase-baseline-and-migration-discipline.md   # this file

Cloud (project ydmcyituvsjnfagxjgka):
  schema public: 28 base tables, 1 view, 2 enums, 3 functions, 1 trigger, 18 RLS policies (all from v1.3)
  schema supabase_migrations:
    schema_migrations: 1 row → version='0001', name='baseline'

package.json scripts:
  db:types  → regenerate src/types/database.ts from cloud
  db:diff   → diff local migrations vs linked cloud
  db:push   → apply unmerged migrations to linked cloud
```

## 5. Followups (not part of this ADR)

- ADR on auth/session shape (Supabase SSR client per-request factory) — pairs with the middleware/RLS coherence rule.
- ADR on RLS deny-by-default policy model (helper functions, claims, family vs organization scopes).
- Eventually: revoke direct SQL-editor write permissions for human accounts in production; keep break-glass account separately.
- Eventually: CI step that runs `supabase db diff --linked` and fails on drift.
