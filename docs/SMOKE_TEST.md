# Piantare — Production smoke test (Step 9)

This is the **only** validation contract for declaring the MVP "live".
Every box must be ticked against the public Vercel URL — not localhost.

The test exercises one loop: signup → onboarding → product → order →
status transitions → invoice. Two distinct accounts are required (one
lab, one brand) because the MVP rule is "one org per kind per user".

If anything below fails, capture the symptom in section 7 and stop. We do
not paper over failures in Step 9 — that is the point of running this.

---

## 0. Inputs

- Two real email addresses you control (or one inbox + email aliases).
- The live URL: `https://<vercel-domain>`.

---

## 1. Lab account — signup + onboarding

- [ ] Open `https://<vercel-domain>` in a clean browser (no prior cookies).
- [ ] You land on `/login`.
- [ ] Click "Criar conta". Submit with `lab1@<your-domain>` and a password ≥ 6 chars.
- [ ] If email confirmation is enabled: confirm via inbox link, return to `/`.
- [ ] You land on `/onboarding`.
- [ ] Select "Lab", name "Piantare Lab Demo", country "BR", currency "USD". Submit.
- [ ] You land on `/lab/products` (empty state visible).

## 2. Create a product

- [ ] Click "Novo produto".
- [ ] Submit:
  - Name: "Extrato CBD 100mg"
  - Description: "Demo product for smoke test"
  - Unit: "frasco"
  - Price (USD): 50.00
- [ ] Redirected to `/lab/products`.
- [ ] The product card is visible, marked `ativo`.

## 3. Brand account — signup + onboarding

- [ ] Open a private/incognito window.
- [ ] Signup with `brand1@<your-domain>`.
- [ ] On `/onboarding`, select "Brand", name "Piantare Brand Demo", country "BR", currency "USD". Submit.
- [ ] You land on `/brand/catalog`.
- [ ] The Lab Demo product is visible, with lab name "Piantare Lab Demo".

## 4. Create an order

- [ ] On the product card, click "Criar pedido".
- [ ] `/brand/orders/new` opens with the product pre-selected.
- [ ] Quantity = 2, payment terms = "50/50" (default). Submit.
- [ ] You land on `/orders/<id>`.
- [ ] Detail shows: brand, lab, unit price (US$ 50.00), total (US$ 100.00), status "Criado".
- [ ] Invoice section says invoice opens after approval.
- [ ] The progress bar shows only "Criado" highlighted.

## 5. Lab advances the order

- [ ] In the lab browser, navigate to `/orders`.
- [ ] The new order is listed with status "Criado".
- [ ] Click into the order.
- [ ] Click "Avançar para Aprovado".
- [ ] Status updates to "Aprovado".
- [ ] Invoice section now shows: pending invoice for US$ 100.00.
- [ ] Click "Marcar como pago (mock)". Status flips to "pago".
- [ ] Click "Avançar para Em produção" → status updates.
- [ ] Click "Avançar para Pronto" → status updates.
- [ ] Click "Avançar para Enviado" → status updates, "Avançar" button disappears.
- [ ] Progress bar shows all five steps highlighted.

## 6. Brand sees the cycle end-to-end

- [ ] Back in the brand browser, refresh `/orders/<id>`.
- [ ] Status: "Enviado".
- [ ] Invoice: "pago".
- [ ] The "Avançar" button is NOT visible to the brand (text: "Apenas o lab pode avançar o status.").

## 7. RLS spot-checks

Open Supabase Studio → SQL editor.

- [ ] `select count(*) from public.orders;` → returns 1.
- [ ] `set role anon; select count(*) from public.products; reset role;` → returns 0 (anon cannot read).
- [ ] As the brand user (use a generated JWT or the brand session cookies),
      `select count(*) from public.products;` → returns at least 1 (catalog visibility).
- [ ] As the lab user, `select count(*) from public.orders;` → returns 1.
- [ ] As an unrelated anonymous user, the same query returns 0.

## 8. Negative path checks (must NOT succeed)

- [ ] Logged out, visit `/orders` → redirected to `/login`.
- [ ] Brand account, manually navigate to `/lab/products` → redirected to `/` (kind mismatch).
- [ ] Lab account, manually navigate to `/brand/catalog` → redirected to `/`.
- [ ] As brand, attempt the "advance status" form via curl with brand cookies — must return `NotAMemberError` (only lab side can transition).

---

## Failure capture template

For every box that did NOT pass, record:

```
Step: <e.g. "5. Lab advances the order">
Sub-check: <which checkbox>
Symptom: <what you saw — message, redirect, HTTP code>
Browser console / Vercel log: <if relevant>
Reproducible? yes / no
Severity: blocker / annoyance / cosmetic
```

After the test, surface the list to triage what blocks the next step.

---

## Definition of done

- All boxes in sections 1–8 ticked, OR
- Every failed box has a triage entry in the failure capture, AND
- The decision recorded: "ship anyway with known gap" vs "fix before
  declaring live".

Either way, the result is the input to Step 10.
