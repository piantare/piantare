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

### 2a. Operational ergonomics — anti-enterprise principles (2026-05-22)

The product must continue to feel like **"simple operational coordination"** and not **"heavy enterprise ERP"**. These six guardrails ratify the spirit of Waves B–E, added after Wave A landed:

- **A1 — Human-in-the-loop is structural, not transitional.** The platform coordinates and records; the relationship stays human. Even when automations get added later, the relationship does not move into the platform in this phase.
- **A2 — No premature automation.** Specifically excluded for now: real payment rails, internal messaging, intra-platform communication, deep financial automation. Mock + ledger + human action remain the default.
- **A3 — Flow-oriented, not registration-oriented.** Tables and forms exist only insofar as they unblock a step in the core loop. We do not pre-cadastrar fields "for the future" — a field enters when the flow needs it, not before.
- **A4 — The core loop is the primary metric.** Everything entering must strengthen `agente → cotação → documentação → pagamento → operação → entrega → liquidação`. Anything that does not is deferred.
- **A5 — Validate operational ergonomics before expanding the domain.** Each wave is followed by a real-use checkpoint (manual pass, partner walkthrough, smoke run). We do not stack waves on top of unverified ones.
- **A6 — Wave B is the next structural step, but not the next mandatory step.** We pace by sinal de uso real, not by waterfall plan. A wave only triggers when its predecessor has been operationally observed.

Concrete consequences for Wave B planning:
- The `people` form starts with the **minimum fields the agente needs to open a quote**: name + contact (one channel). Doctor, address, ID, etc. only enter when the gate that consumes them is being built.
- The `agente` role enters at the membership layer only — no separate "Agente" page tree until a real flow demands it.
- The public quote link is the simplest token-signed read+upload page possible. No client-side state, no SPA-feel, no chat.
- Avaliação de Wave B é "um agente real consegue abrir e enviar uma cotação para um cliente real em menos de 2 minutos sem ajuda" — não checklist de campos. Este é o **teste dos 2 minutos** e fica como filtro permanente: se um caminho não passa nele, voltamos ao desenho.

### 2b. Linguagem interna (2026-05-22)

Pequena nota de tom que afeta como pensamos a construção:

- **Não usar "travado" / "trancado"** para descrever decisões ou alinhamentos. A palavra carrega rigidez incompatível com a forma incremental e adaptativa do projeto.
- **Usar:** alinhado, registrado, consolidado, canonizado, definido, incorporado ao ADR, estabelecido como princípio, direcionado.
- Decisões aqui são **incorporadas**, não imobilizadas. Tudo neste ADR pode ser revisado por sinal de uso real — ele é referência viva, não contrato.

### 2c. Atores prioritários — escritório e agente são a ponta viva (2026-05-23)

Dos 5 atores comerciais (indústria, marca, escritório, agente, paciente), **escritório e agente são prioridade absoluta de ergonomia**. Indústria e marca existem porque sustentam o ecossistema, mas quem opera o dia a dia é o escritório com seus agentes.

Consequências práticas:

- Toda decisão de Wave B–E carrega o filtro: **"isso facilita um escritório ou um agente operando agora?"** Se a resposta é "isso ajuda só a indústria ou só a marca", desce na fila.
- O **agente não pode sentir que está preenchendo ERP**. Tem que sentir que está conduzindo uma relação: menos densidade, menos tabelão, menos linguagem operacional fria — mais contexto, clareza, fluxo, continuidade, histórico vivo, sensação de acompanhamento. Mesmo quando houver complexidade regulatória.
- O **escritório é o centro operacional do MVP**. Catálogo, validações documentais, liberação de despacho, conciliação — tudo passa por ele.
- Indústria e marca ganham UI suficiente para o ecossistema sustentar a operação do escritório/agente, sem mais.

### 2d. Paciente sem login (2026-05-23)

Reafirma e detalha o princípio #7. O paciente:

- **Não tem login.** Não nesta fase, não como primeiro fluxo.
- Participa via **link público com token assinado** em quatro momentos: orçamento, upload documental, pagamento, assinatura, acompanhamento.
- O token tem expiração curta no orçamento (60 min) e mais longa no link de pagamento (72h) — sem tornar a plataforma um portal.
- **Não construir portal de paciente.** Cada vez que pensarmos "vamos dar uma área pro paciente", o reflexo é: "não, isso é uma tela pública de uma ação específica".

Razão estrutural: a longitudinalidade da `person` (princípio #3) é registrada **pelo agente**, não pelo paciente. O paciente é sujeito, não usuário. Quando virar usuário, é decisão deliberada, não emergente.

### 2e. Fluxo comercial canônico (2026-05-23)

O fluxo de transação no ecossistema Piantare é unidirecional:

```
Indústria → Marca → Escritório → Agente → Paciente
   (produz)  (estrutura) (opera)   (vende)  (consome)
```

Significados estruturais:

- **Marca compra da indústria.** Pedido `seller=indústria, buyer=marca`.
- **Escritório opera ou consigna da marca.** Pedido `seller=marca, buyer=escritório`.
- **Agente representa o escritório** ao paciente. Agente é membership do escritório, não um elo comercial próprio.
- **Paciente compra do escritório** (via agente). Pedido `seller=escritório, buyer=paciente` (modelado como `for_person_id`, sem buyer org).

Esses pares (seller, buyer) definem o modelo de `partnerships` em Wave C: cada link `actor_links` é um vínculo entre seller-org e buyer-org com `supply_model` (purchase | consignment | dropship). Catálogo (`catalog_listings`) é publicado por um seller para um buyer (ou para qualquer um vinculado), seguindo a regra RN-009 do doc canônico (visibilidade em camadas).

### 2f. Arquitetura pronta, dinheiro ainda não (2026-05-23)

Princípio operacional que substitui as ambições financeiras do doc canônico (RN-012, RN-013) **na ordem de execução, sem reduzir o destino final**:

- A **estrutura toda** existe desde já: `order_payouts` ledger, `commission_rules`, `billing_cycles` schema, `fx_rates` schema, `payment_gateway` enum, `consignment_balances`, splits por evento, statuses.
- O **dinheiro não se move**. Splits vão para `status = pending` indefinidamente. Billing fica como projeção em `billing_cycles` sem cobrança. Stripe Connect / PagarMe / 1% Piantare entram **sob sinal explícito de demanda**, não no MVP.
- **Por quê:** o ledger sem dinheiro já entrega 80% do valor — visibilidade operacional pro escritório, sensação de carteira pro agente, transparência. Construir os 20% finais (gateway real, conciliação, inadimplência, suspensão automática) é o trabalho mais caro e o último gating de demanda.
- **Multi-currency:** `preferred_currency` por org + `fx_rate` snapshot existem desde já. AwesomeAPI não — quando precisar, a taxa entra **manualmente** no momento da liquidação. Estrutura preparada, automação deferida.

### 2g. Onboarding active direto, integrações humanas (2026-05-23)

Duas decisões operacionais para a Sprint 1A:

- **Signup vira `active` direto.** Sem `pending_docs`, sem `pending_approval`, sem fila admin. O documento canônico (RN-001) descreve a forma final; nesta fase qualquer signup é imediatamente operável. O admin Piantare entra observando, auditando, ajudando onboarding manualmente, corrigindo exceções — governança pesada vem com volume.
- **Integrações externas ficam fora.** Anvisa, Docusign, Mile, WhatsApp Business — **tudo humano nesta fase**. O escritório anexa o PDF da autorização ANVISA manualmente. O agente envia o link de cotação por WhatsApp pessoal (copy-paste do link público). O escritório cola o tracking number do despacho. A plataforma registra, não automatiza. Os **campos, estados e attachments nascem prontos** para receber automação depois.

Isso não é "menos produto" — é **mais operação real, menos integração frágil**. Cada integração adicionada antes de demanda gera dependência e ponto de falha. Cada integração adicionada sob demanda real entrega valor proporcional ao esforço.

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
