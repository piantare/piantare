# ADR 0007 — Ecosystem actors, stages and verticals

- **Status:** Accepted
- **Date:** 2026-05-22
- **Deciders:** Nathan Candido Silva
- **Phase:** 3, Wave A (preparation)
- **Related:** ADR 0001 (migration discipline), ADR 0002 (architecture layering), ADR 0003 (auth + RLS), ADR 0006 (first live loop)
- **Supersedes:** ADR 0006 §2.1 (the two-actor `lab | brand` model is now a special case)

---

## 1. Context

ADR 0006 modeled Piantare as a 2-actor marketplace (`lab ↔ brand`). The first live loop validated that the coordination spine works end-to-end. The real ecosystem is broader: indústria, marca, escritório de importação, agente, farmácia magistral — and, on later phases, laboratório de exames, clínicas, médicos, paciente.

**Piantare is not an ERP for cannabis.** It is operational longitudinal infrastructure for the longevity market — preventive health, performance, regulated coordination. Cannabis medicinal is the first operational vertical that validates the model. Other verticals (suplemento de longevidade, farmácia magistral standalone, exame diagnóstico, etc.) will share the same spine.

This ADR establishes the conceptual model **before** ramping implementation, so each wave that follows lands on a stable substrate.

## 2. Canonical principles

These constrain every later decision:

1. **Modular core, vertical parametrization, specialization only when necessary.** Org / person / order / attachment / payout are vertical-agnostic. Each vertical declares its actor kinds, required documents, stages, gates and split rules in code (typed const), not in branching schemas.
2. **Human-in-the-loop stays canonical.** Even when documents, splits, stages and operational flow get automated, the human relationship is central — particularly: agente ↔ cliente, escritório ↔ cliente, marca ↔ escritório, protocolo ↔ acompanhamento. The platform records, accelerates and gives visibility to that relationship; it does not replace it.
3. **Longitudinality of the person is a long-term asset.** Even though the patient/client has no direct login in this phase, the `people` modeling must already support cross-vertical history. A person attended in cannabis today, in exames tomorrow, in suplemento next year, is one continuous record.
4. **Internal communication stays out of the platform for now.** WhatsApp and human relationship continue external. No chat, no notifications-as-product in this phase.
5. **The core loop is and remains clear:** `agente → cotação → documentação → pagamento → operação → entrega → liquidação`. Everything entering the platform must reinforce this loop, not compete with it.
6. **No premature complexity.** Each wave is incrementally commitable and does not force the next.
7. **Patient has no direct login in this phase.** Patient acts via public link with signed token (read + upload), originated by an agente. No auth user is created for the patient.

## 3. Actors

| Actor | Role | Today | Plugged in |
|---|---|---|---|
| **Indústria** | Produces / manufactures (white/private label) | `organizations.kind = lab` (rename to `industria`) | Wave A |
| **Marca** | Holds the commercial SKU, operates via an escritório | `organizations.kind = brand` | Today (rename to `marca` deferred) |
| **Escritório** | Imports, handles regulatory, owns or holds consignment stock, runs marca's commercial operations | New `kind = escritorio` | Wave C |
| **Agente** | Person with portfolio of doctors/clients; originates quotes; runs the human side of the sale | `memberships.role = agente` (not an org) | Wave B |
| **Farmácia magistral** | Manipulates and dispenses; parallel/complementary actor | New `kind = farmacia_magistral` | Wave E |
| Laboratório de exames | Diagnostic, longitudinal clinical data | New `kind = laboratorio` | Future |
| Clínica / Médico | Prescription, longitudinal follow-up | New `kind = clinica` | Future |
| Paciente / Cliente | Final consumer — no direct login in this phase | `people` row referenced by `orders.for_person_id` | Wave B |

## 4. Responsibilities (brief)

- **Indústria** — cadastra produto, define preço-fábrica, aprova pedido de produção, expede.
- **Marca** — define identidade comercial, contratos com indústria e escritório, define preço-marca (markup).
- **Escritório** — importação, paga indústria, gerencia estoque (próprio ou consignado), valida documentação regulatória, libera entrega.
- **Agente** — identifica cliente, gera orçamento, acompanha pagamento, intermedeia documentação, ponto de contato humano.
- **Farmácia magistral** — recebe prescrição direta ou via agente, manipula, dispensa.
- **Cliente** — recebe link de pagamento e checklist de docs; faz upload via formulário público com token assinado.

## 5. Entity model (conceptual)

```
organizations
 ─ id, kind (industria|marca|escritorio|farmacia_magistral|...)
 ─ vertical (cannabis_medicinal|suplemento_longevidade|...)
 ─ parent_org_id (nullable, e.g. escritório de uma marca)

memberships
 ─ org_id, user_id, role (owner|operator|agente|financeiro|visualizador)

partnerships                   # NEW
 ─ buyer_org_id, seller_org_id, status, contract_doc_id

people                         # NEW — patient/client, no auth user
 ─ id, created_by_membership_id (the agente who registered)
 ─ name, contact info (encrypted), doctor_id (nullable)

orders   (evolved from ADR 0006)
 ─ vertical
 ─ buyer_org_id, seller_org_id
 ─ originating_agent_membership_id (NEW, nullable for backfill)
 ─ for_person_id (NEW, nullable when buying stock not for a specific person)
 ─ stage (replaces status — see §6)
 ─ amounts_jsonb (segmented amounts — see §8)

attachments                    # NEW — polymorphic
 ─ subject_type, subject_id (order|person|partnership|product)
 ─ kind (prescricao|anvisa|identidade|comprovante|nota_fiscal|di|laudo|contrato)
 ─ uploaded_by_membership_id, url, mime, sha256
 ─ verified_by_membership_id, verified_at, expires_at

commission_rules               # NEW
 ─ scope_type (product|partnership|vertical), scope_id
 ─ payee_role (industria|marca|escritorio|agente|farmacia|piantare)
 ─ method (percent|fixed|residual), value

order_payouts                  # NEW — ledger of split per order
 ─ order_id
 ─ payee_org_id OR payee_membership_id (for agente)
 ─ amount, currency, status (pending|released|paid|reversed)
 ─ rule_snapshot_jsonb (snapshot of the rule that produced this payout)
```

Org is the commercial unit, membership is the person unit, agente is a membership with a special role. An agente working for two escritórios has two memberships — the model already supports it without a new entity.

## 6. Stages (replaces linear status)

Linear status (created → approved → ... → shipped) is insufficient because the real flow has parallelism and conditional gates. New shape: **stage** + **gates**.

```
stage (one at a time):
  rascunho
  cotacao_aberta
  documentacao
  pagamento
  producao_ou_importacao
  logistica
  entregue
  liquidado
  cancelado

gates (parallel booleans, some block transition):
  docs_paciente_ok
  pagamento_ok
  estoque_alocado OR pedido_industria_ok
  nf_emitida
```

Each vertical declares which stages apply, which gates are required, and who can trigger each transition.

**The current ADR 0006 flow (`created → ... → shipped`) is a degenerate case** with no `documentacao` stage and `agente = null`. Existing orders are migrated to `stage = liquidado` if invoice paid, or to the closest stage matching their current status, with `originating_agent_membership_id = null`.

## 7. Cannabis medicinal canonical flow

```
1. Agente cria pessoa (cliente) + abre cotação                  → rascunho
2. Agente seleciona produto da marca, envia link de cotação     → cotacao_aberta
3. Cliente envia documentos (prescrição/ANVISA/identidade/etc.) → documentacao
4. Escritório valida documentos                                  → pagamento
5. Cliente paga (mock por enquanto)                              → producao_ou_importacao
6. Escritório aloca estoque OU compra na indústria + NF          → logistica
7. Logística (importação se houver, despacho)                    → entregue
8. Sistema calcula split a partir de commission_rules            → liquidado
```

Variants:
- Marca sem escritório: escritório nulo, marca assume.
- Farmácia magistral standalone: indústria sai do fluxo, farmácia é seller.
- Exame longitudinal (futuro): stages = `agendamento → coleta → analise → laudo_disponivel → integrado_no_perfil`.

## 8. Documentary layer

- **Polymorphic `attachments`** keyed by `(subject_type, subject_id)`. Documents belong to the subject (person, partnership, product), not to the order. The order references documents of the subjects it touches.
- **Validity**: `expires_at` per document. `docs_paciente_ok` considers only verified docs whose expiry has not lapsed.
- **Storage**: Supabase Storage, private bucket, signed URL with short TTL. Never direct URL.

## 9. Financial split

- Not computed at payment — computed at **liquidação** (stage transition), recorded as ledger entries (`order_payouts`).
- Resolution order: `product > partnership > vertical > default`. First match wins. Snapshot of resolved rule is stored on the payout row.
- Without real money rails: payouts generated with `status = pending` indefinitely. Already gives the agente visibility into "minha carteira a receber" — this is the recurrence hook.
- Real payment rails (Stripe Connect / StarkBank) plug into `released → paid` later.

## 10. Manual vs automated in this phase

**Continues manual:**
- Document validation (escritório opens and marks `verified_by`).
- Real payment (mock continues).
- Payout settlement (status `pending`, no money moves).
- Communication with client (WhatsApp out of platform — principle #4).
- Fiscal conciliation.

**Already automated now:**
- Quote generation with total + preview to client.
- Public quote link with signed token (client without login).
- Stage machine with gates (every transition is a manual click, but recorded).
- Transition history with timestamp + actor.
- Split calculation (generates `order_payouts` rows even without real money).
- "Minha carteira" for the agente (sum of pending + released payouts).

## 11. Vertical modularity

Spine is generic: `org + person + order + attachment + payout`. Each vertical is a typed config declared in code:

```ts
// src/modules/verticals/cannabis-medicinal.ts (Wave B+)
export const cannabisMedicinal: VerticalConfig = {
  id: "cannabis_medicinal",
  actorKinds: ["industria", "marca", "escritorio", "agente", "farmacia_magistral"],
  requiredDocsForPerson: ["prescricao", "anvisa", "identidade"],
  stages: ["rascunho", "cotacao_aberta", "documentacao", "pagamento",
           "producao_ou_importacao", "logistica", "entregue", "liquidado"],
  gatesByStage: { /* … */ },
};
```

The vertical is a column on `organizations` and `orders`. Decisions at runtime read this config. When a vertical earns specialization, it gets its own module under `src/modules/verticals/<id>/` — but the core data model stays single.

A person's record is shared across verticals. Pedidos em cannabis + exames + suplemento atendendo a mesma pessoa formam a história longitudinal — princípio #3.

## 12. Evolution plan — five waves

Each wave is independently commitable. Subsequent waves are not forced.

**Wave A — rename + vertical (this commit)**
- Migration: rename enum value `lab → industria` in `organization_kind`.
- Migration: add `vertical_kind` enum and `vertical` columns on `organizations` and `orders`, default `cannabis_medicinal`, backfill all existing rows.
- Refactor `/lab/*` paths → `/industria/*`.
- Domain `OrganizationKind` and DB types updated.
- UI strings updated (`Lab` → `Indústria`).
- No new feature. No behavior change for the user. Brand stays brand for now (rename to "marca" is hygiene deferred — lower urgency, no semantic collision with future actors yet).

**Wave B — people + agente + cotação aberta**
- `people` table (no auth user — agente owns the record).
- `memberships.role` enum gains `agente`.
- `stage` column on `orders` plus first two stages (`rascunho`, `cotacao_aberta`).
- `/agente/cotacoes` (list) and `/agente/cotacoes/new`.
- Public route `/cotacao/[token]` for the client to view/upload (no auth, signed token).
- Onboarding gains an "Agente independente" path.

**Wave C — escritório + documentação**
- `kind = escritorio` enabled.
- `partnerships` table.
- `attachments` polymorphic table + Storage bucket.
- Stage `documentacao` with gate `docs_paciente_ok`.
- `/escritorio/validacoes`.

**Wave D — split + carteira do agente**
- `commission_rules` and `order_payouts` tables.
- Resolution function with snapshot.
- `/agente/carteira` (sum of pending + released, no transfer).

**Wave E — farmácia magistral + vertical variants**
- `kind = farmacia_magistral` enabled.
- Vertical configs declared in code under `src/modules/verticals/`.
- Suplemento de longevidade vertical bootstrapped as proof of modularity.

Each wave produces ≥ 1 commitable unit and does not entrain the next.

## 13. Consequences

**Positive:**
- ADR 0006's loop continues to work unchanged for the cannabis_medicinal vertical with `agente = null`. No data loss, no UX regression.
- Person becomes a first-class noun ahead of multi-vertical entry. Longitudinal record starts accruing on day 1 of Wave B.
- Split ledger generates visibility for the agente even before any real money rails — this is the recurrence engine.
- Modular spine (core + vertical config) lets new verticals enter without forking schemas.

**Negative / cost:**
- Wave A touches almost every file mentioning `lab`. Mechanical refactor, but real review surface.
- Stage model is richer than status — error surface in transition logic grows. Mitigation: every transition routed through a single function with explicit `canTransition(stage, gates, role, vertical)`.
- Polymorphic `attachments` loses referential integrity at DB level (`subject_id` can't have a FK). Mitigation: schema check + module-level invariants on every insert, plus a periodic integrity job.

## 14. Open questions (deferred)

- When does `brand → marca` rename happen? Likely Wave C alongside `escritorio` introduction, when "marca" framing becomes operationally necessary.
- Should `people.contact_info` use PGP-style row-level encryption from day 1? Decision deferred to Wave B planning.
- How does the agente authenticate when working for multiple escritórios — explicit "switch org" in shell, or implicit by route? Decision deferred to Wave B planning.

## 15. Acceptance criteria for Wave A (this ADR)

- `organizations.kind` enum has value `industria` (and no value `lab`).
- All existing organization rows previously `lab` now read `industria`.
- All existing organization and order rows have `vertical = 'cannabis_medicinal'`.
- `/industria/products` and `/industria/products/new` routes exist and work.
- `/lab/*` no longer exists (or 308-redirects, our choice).
- UI nowhere shows `(lab)` or `LAB`; shows `(indústria)` or `INDÚSTRIA`.
- `next build` passes with no type errors.
- Smoke test (manual or automated) for the current loop still passes — agente=null, vertical=cannabis_medicinal.
