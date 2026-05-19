# ADR 0002 — Architecture Dependency Rules

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2 (production-first foundation)
- **Related:** ADR 0001 (Supabase baseline & migrations), `feedback_middleware_auth_rls_coherence`, `project_phase1_decisions`

---

## 1. Context

Phase 1 fixed the top-level repo blocks: `src/{domains, modules, services, lib, components, design-system, app, types, config}`. What was *not* fixed was the dependency contract between them — which block can import from which, and what each block is *for* in operational terms.

Piantare is a modular monolith with a two-axis tenancy model (Family / Organization), a Vertical-as-Protocol pattern, and explicit coherence requirements between middleware, auth, and RLS. Without an enforced layering rule, two failure modes are very likely:

- **Domain leakage:** business invariants (e.g. "an Agente can only see Pacientes within their Clínica") start being expressed inside Supabase queries or React components, scattered across files. RLS reviews become impossible, and the cannabis-br vertical becomes the only vertical we can ever ship.
- **Vertical entanglement:** the cannabis-br protocol's specifics (Agente↔Paciente flow, ANVISA-shaped fields) seep into `domains/family` or `domains/identity`, breaking the Vertical-as-Protocol abstraction before Vertical #1 even exists.

This ADR locks the layering and the enforcement.

## 2. Decision

### 2.1 The blocks and what each is *for*

| Block | Role | I/O allowed? | Examples |
|---|---|---|---|
| `domains/` | Pure business invariants, types, value objects, pure functions. The model of the world. | **No I/O.** No fetch, no DB, no env reads, no React. | `Family`, `Organization`, `Member`, `TimelineEvent`, `Vertical`, claim-flow state machine |
| `modules/` | Use-case orchestration. Composes domains + services + lib into a single intent. | Yes — but only via services/lib. | `claimMembership`, `recordAgendamento`, `registerVerticalEvent` |
| `services/` | External-system adapters. Translate domain intents ↔ external interfaces. No business rules. | Yes — this is *where* I/O lives. | `services/supabase/*`, `services/stark/*`, `services/email/*` |
| `lib/` | Generic utilities, no domain knowledge, no external state. | Pure-ish: helpers, formatters, parsers. | `formatDate`, `assertNever`, `Result<T,E>` |
| `components/` | Composed UI building blocks specific to the product. | React side-effects only. May call modules via Server Actions. | `MemberHeader`, `TimelineList` |
| `design-system/` | Tokens + presentational primitives. No domain knowledge. | React side-effects only. | `Button`, `Input`, `Card` |
| `app/` | Next 16 App Router surface — routes, layouts, Server Actions, route handlers. | Yes. Composes everything below. | `app/(member)/page.tsx`, `app/api/...` |
| `types/` | Generated or shared type contracts. | None — declarations only. | `types/database.ts` (generated from Supabase) |
| `config/` | Constants, env contracts, feature flags. | Reads env at boundaries; no logic. | `config/env.ts`, `config/features.ts` |

### 2.2 Dependency rules (allowed → arrow direction)

```
                 ┌──────────────┐
                 │     app/     │
                 └──────┬───────┘
            ┌──────┬────┴────┬─────────┐
            ▼      ▼         ▼         ▼
       components/  modules/  design-system/
            │           │
            ▼           ▼
       design-system/  services/
                        │
                        ▼
                    domains/  ◀───  types/ (declarations only)
                        ▲
                        │
                        └──── (nothing depends downward into domains except via type imports)
```

Allowed imports:

- `app/` → anything
- `components/` → `design-system/`, `modules/`, `lib/`, `types/`, `config/`
- `modules/` → `domains/`, `services/`, `lib/`, `types/`, `config/`
- `services/` → `domains/` (for types only), `lib/`, `types/`, `config/`
- `domains/` → **`types/` only** (and other `domains/` subfolders, except across vertical boundaries — see §2.4)
- `design-system/` → `lib/` (only pure helpers), `types/` (only ambient/shared types)
- `lib/` → `types/` only
- `config/` → `types/` only

### 2.3 Hard prohibitions (enforced by ESLint)

- `domains/` **must not** import from `modules/`, `services/`, `app/`, `components/`, `design-system/`, or `config/`.
- `domains/` **must not** import from `lib/`. If a utility is genuinely domain-relevant, it belongs *in* a domain.
- `domains/<X>/` **must not** import from `domains/<Y>/` arbitrarily — see §2.4.
- `services/` **must not** contain business rules. Detection is social/review, not lint-enforced.
- `design-system/` **must not** import from `domains/`, `modules/`, `services/`, `components/`, `app/`, or `config/`.

### 2.4 Cross-domain imports

Domains may reference each other only along the model's seams:

- `domains/family/` and `domains/organization/` may both import from `domains/identity/` (User/Auth primitives).
- `domains/vertical/cannabis-br/` may import from `domains/vertical/_base/` (Vertical protocol) and from `domains/family/`, `domains/organization/`, `domains/identity/` (the substrate).
- `domains/vertical/_base/` **must not** import from any concrete vertical.
- `domains/family/` and `domains/organization/` **must not** import from any `domains/vertical/*` (the model survives without verticals; verticals plug into the model, not the other way).

### 2.5 Enforcement is automatic from day 1

ESLint flat config enables `import/no-restricted-paths` (or equivalent) with the rules above. `next build` and `npm run lint` fail on violations. No social discipline — this is build-blocking.

### 2.6 The generated `src/types/database.ts` is exempt

`types/database.ts` is a Supabase-shaped contract, not a domain artifact. Importing it directly from `services/supabase/*` and `modules/*` is expected. `domains/*` should *not* import it — domains speak their own vocabulary, services translate.

## 3. Consequences

### Positive

- The model survives independently of any vertical, any UI framework, and any infra choice.
- RLS reviews (per `feedback_middleware_auth_rls_coherence`) have a clear partner in `domains/*` — the same invariants exist in code and in Postgres.
- Future verticals (Vertical #1, #2, …) plug into a stable seam (`domains/vertical/_base/`) instead of grafting onto cannabis-br.
- Tests for `domains/*` can be pure unit tests; no DB, no React.
- New contributors can read the dependency diagram and know where to add code.

### Negative / tradeoffs accepted

- Some duplication between `types/database.ts` (Supabase row shapes) and `domains/*` types (business shapes). Accepted: translation lives in `services/supabase/*`. This is the point.
- Initial ergonomic friction: writing a "small feature" requires touching 3 layers. Accepted: the alternative is fast initial velocity that decays as the system grows.
- ESLint config gets non-trivial. Accepted as one-time cost.

### Risks

- Developers may bypass the rule via `eslint-disable` comments. Mitigation: PR template includes a checkbox for any `eslint-disable` near layering rules; reviews flag them.
- The cannabis-br vertical is the first and only vertical at MVP. The Vertical-as-Protocol seam is therefore *theoretical* until Vertical #1 lands. Mitigation: write `domains/vertical/_base/` as soon as cannabis-br has any non-trivial shape, even if it has one consumer.

## 4. Implementation

- `docs/adrs/0002-architecture-dependency-rules.md` — this file (formal record).
- `src/ARCHITECTURE.md` — operational guide for developers; restates the rules, shows the diagram, points back here.
- `eslint.config.mjs` — flat config with `no-restricted-imports` (or `import/no-restricted-paths` via plugin) enforcing §2.3 and §2.4.
- `npm run lint` is part of CI (later step) but already runs locally.

## 5. Followups

- ADR on Vertical-as-Protocol shape once cannabis-br has concrete state machines.
- ADR on Server Action authorship — Server Actions live in `app/`, but call into `modules/`. Document the seam.
- Once `services/supabase/*` exists (Step 5), document the translation pattern (database row → domain entity) explicitly.
