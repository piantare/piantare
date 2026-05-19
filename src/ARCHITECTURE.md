# Piantare — `src/` Architecture (operational guide)

> Formal decision: **`docs/adrs/0002-architecture-dependency-rules.md`**.
> This file is the day-to-day cheat sheet. If the two ever disagree, the ADR wins.

---

## The blocks

```
src/
├── app/              Next 16 App Router — routes, layouts, Server Actions, route handlers
├── components/       Product-specific composed UI
├── config/           Constants, env contracts, feature flags
├── design-system/    Tokens + presentational primitives (button, input, card)
├── domains/          Pure business invariants. The model of the world. No I/O.
│   ├── family/         Longitudinal axis — Member, Profile, TimelineEvent, MyMap
│   ├── identity/       User, Auth primitives, claim flow
│   ├── organization/   Operational axis — Org, Role, Membership
│   └── vertical/
│       ├── _base/        Vertical-as-Protocol abstraction
│       └── cannabis-br/  Vertical #0 (Agente↔Paciente)
├── lib/              Generic utilities. No domain knowledge.
├── modules/          Use-case orchestration. Composes domains + services + lib.
├── services/         External-system adapters (Supabase, Stark, email, …)
└── types/            Type contracts (incl. generated database.ts)
```

## The one diagram

```
        app/  ─────►  components/, modules/, design-system/, lib/, config/
                                │
                                ▼
       components/  ─────►  design-system/, modules/, lib/, types/, config/
                                │
                                ▼
       modules/   ─────►  domains/, services/, lib/, types/, config/
                                │
                                ▼
       services/  ─────►  domains/ (types only), lib/, types/, config/
                                │
                                ▼
       domains/   ─────►  types/ (declarations only)         ◀── apex of the model
```

## Quick decision table — "where does this code go?"

| What you're writing | Where it goes |
|---|---|
| "A Member with an unclaimed Profile becomes claimed when…" | `domains/family/` |
| Supabase query that creates a row in `profiles` | `services/supabase/` |
| "Claim a profile" use case that ties auth + DB + audit | `modules/` |
| The `<Button>` primitive | `design-system/` |
| `<MemberHeader>` that knows the data shape | `components/` |
| The route `/(member)/timeline` | `app/(member)/timeline/page.tsx` |
| Server Action `claimProfileAction()` | `app/.../actions.ts` → calls `modules/` |
| Formatter `formatBRDate()` | `lib/` |
| `env.SUPABASE_URL` schema | `config/env.ts` |
| Supabase row types (generated) | `types/database.ts` (do not hand-edit) |

## The hard rules (enforced by ESLint, build fails on violation)

1. `domains/**` **cannot** import from `modules/`, `services/`, `app/`, `components/`, `design-system/`, `config/`, or `lib/`.
2. `domains/family/**` and `domains/organization/**` **cannot** import from `domains/vertical/**`.
3. `domains/vertical/_base/**` **cannot** import from any concrete vertical (`domains/vertical/cannabis-br/**`, etc.).
4. `design-system/**` **cannot** import from `domains/`, `modules/`, `services/`, `components/`, `app/`, or `config/`.

Cross-domain imports that ARE allowed:

- `domains/family/**` → `domains/identity/**`
- `domains/organization/**` → `domains/identity/**`
- `domains/vertical/cannabis-br/**` → `domains/vertical/_base/**`, `domains/family/**`, `domains/organization/**`, `domains/identity/**`

## Common mistakes to flag in PR review

- Importing `@/types/database` from anywhere inside `domains/**` → translate in `services/supabase/*` instead.
- React `useState`/JSX inside `domains/**` → wrong block; move to `components/`.
- A Supabase call inside `domains/**` → move to `services/supabase/*`; the domain function should be pure.
- A business rule ("only Agentes can create Pacientes") inside `services/supabase/*` → move to `domains/**` or `modules/**`.
- A cannabis-specific field inside `domains/family/**` → move to `domains/vertical/cannabis-br/**`.

## When the rule is wrong

Sometimes the rule is wrong. If you hit a case where it seems like an `eslint-disable` is justified:

1. Stop. Re-read the relevant block descriptions above.
2. If you still think the rule is wrong, that's an ADR-level conversation, not an `eslint-disable`.
3. Open a discussion. Update ADR 0002. Update this file. Then change the lint rule.

Never silently `eslint-disable` layering rules.
