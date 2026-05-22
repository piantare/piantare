# Piantare — Backlog

Source: `docs/smoke-test-runs/2026-05-21-run1.md`.

Princípio filtro de tudo daqui pra frente:
**"isso ajuda usuários reais a usarem o sistema nos próximos dias?"** Se não ajuda, fica fora.

---

## 🔴 Bloqueantes para testes com parceiros — ✅ DONE (commit pendente)

Sem isso resolvido, parceiro real terá experiência quebrada ou bloqueada.

| # | Item | Origem | Status |
|---|---|---|---|
| B1 | **Lab name + Brand name visíveis cross-side**. Solução: novo módulo `modules/organizations/get-org-names-by-ids.ts` usa admin client (display-only, returna apenas `id, name`). Refatorado em `list-orders.ts`, `get-order.ts`, `list-products.ts`. | Smoke #5, #7, #8 | ✅ |
| B2 | **Bug do link "Criar conta"**. Rebaixado: link já é `<a>` plain (não `<Link>`), provável artefato do click MCP, não bug real. Aguardar passada manual do Nathan. | Smoke #1 | ⏸ aguarda validação manual |
| B3 | **Esconder seletor de Moeda**. Hardcoded USD via hidden input em `/onboarding`. | Smoke #4 | ✅ |
| B4 | **"Esqueci minha senha"**. 3 módulos novos (`send-password-reset`, `update-password`, `exchange-code`) + 3 rotas (`/forgot-password`, `/auth/callback`, `/auth/reset-password`) + link no `/login`. | Gap óbvio | ✅ |
| B5 | **Documentar pré-requisito auth config** em DEPLOY.md §1.2. Email confirmation OFF + Site URL + Redirect URLs (`/auth/callback`, `/auth/reset-password`, `/`). | Smoke #2 | ✅ |

---

## 🟡 Melhorias pós-go-live (semana 1 com parceiros)

Não bloqueia, mas afeta confiança e recorrência. Fazer logo após smoke aprovado por parceiro real.

| # | Item | Origem | Status |
|---|---|---|---|
| P1 | **Total do pedido ao vivo** + resumo "Pedido para X: N× $Y = $Z" em `/brand/orders/new`. Client island `OrderForm`. | Smoke — leitura subjetiva | ✅ |
| P2 | **Confirmação visual antes de criar pedido**. Resolvido junto com P1 — bloco de resumo serve de confirmação implícita. | Smoke — leitura subjetiva | ✅ |
| P3 | **Timestamps em cada transição de status**. | Smoke — leitura subjetiva | pendente |
| P4 | **Label "Condições de pagamento"** + placeholder. | Smoke #6 | ✅ (junto com P1) |
| P5 | **Edit / desativar produto** no card. | Smoke — leitura subjetiva | pendente |
| P6 | **Loading state nos botões de submit**. `<SubmitButton>` client (useFormStatus) substitui `<Button type="submit">` em 7 forms. | Smoke — leitura subjetiva | ✅ |
| P7 | **Validação de preço > 0**. | Gap óbvio | pendente |
| P8 | **Mensagem humana na confirmação do primeiro pedido**. | Smoke — leitura subjetiva | pendente |
| P9 | **Home com indicador "X novos pedidos"**. | Smoke — recorrência | pendente |
| P10 | **Reduzir frieza da landing**: tagline + logo. | Smoke — leitura subjetiva | pendente |

---

## 🔵 Débitos técnicos adiáveis

Sabemos que existem. Não pagam ROI hoje. Reabrir quando o loop estiver vivo com 3+ parceiros.

| # | Item | Origem |
|---|---|---|
| D1 | `admin_profiles_view` expõe `auth.users` (ERROR no Supabase advisor). Pré-existente do baseline v1.3. | Step 9 audit |
| D2 | RLS policies vazias em tabelas `perfis_*`, `anamneses_*`, `comunidade_*` (legacy, intencionalmente fechadas). | Step 9 audit |
| D3 | SECURITY DEFINER functions callable por `anon`/`authenticated` (6 funções). Pré-existente. | Step 9 audit |
| D4 | Form submit via click vs Enter — validar se é bug real ou só artefato MCP. | Smoke #3 |
| D5 | Page-level loading.tsx ainda não existe para nenhuma rota. | Não exercitado |
| D6 | Sem error boundary global — server action crash exibe `Application error: a client-side exception has occurred`. | Não exercitado |

---

## Sequência sugerida (próximos 2 dias)

1. **Hoje (~4h):** B1, B2, B3, B5 — destrava parceiro real
2. **Hoje (~1h):** B4 — desbloqueia "esqueci senha"
3. **Amanhã (~3h):** P1, P2, P6, P7 — eleva confiança no fluxo de pedido
4. **Amanhã (~2h):** P3, P4 — histórico + clareza
5. **Quando o loop estiver vivo com 1 parceiro real:** Item 4 do plano (observabilidade mínima — error boundary + log estruturado server-side), depois P8–P10.

Após esse bloco, abrimos discussão sobre o que entra na próxima sprint de produto vivo.
