# ADR 0005 — i18n Shell (cookie-based, no URL routing)

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2, Step 7
- **Related:** ADR 0003 (auth + RLS baseline — middleware coherence), ADR 0004 (design system), `project_next16_spike`, `project_operating_principles`

---

## 1. Context

Phase 2 Step 7 is the i18n infrastructure layer. The product is pt-BR-first with English as the secondary locale. Before any feature lands, four questions had to be answered:

1. Which i18n library?
2. How does locale travel — URL path, cookie, header?
3. Where does locale negotiation live — middleware, request config, page boundary?
4. What is the minimal viable catalog on day one?

The product is **early Phase 2**, greenfield, with no real product pages yet and no SEO requirement. Adding URL-based locale routing now would force a `src/app/[locale]/` reorganization that is structurally wasted until there are real surfaces to localize.

## 2. Decision

### 2.1 Library — `next-intl@^4.12`

- Peer range officially supports `next ^16` and `react ^19`.
- App Router-first; works with both Server Components (`getTranslations`, `getLocale`) and Client Components (`useTranslations`).
- Standard plugin (`createNextIntlPlugin`) wires message loading at build time.

**Why:** It is the current ecosystem default for App Router + RSC. `next-i18next` is Pages-Router-rooted and heavier; rolling our own would mean rebuilding ICU + plural rules + locale negotiation.

### 2.2 Locale lives in a cookie, not in the URL

- Cookie name: `NEXT_LOCALE` (max-age 1 year, `sameSite: 'lax'`, `path: '/'`).
- No `[locale]` segment in the App Router. All routes stay at `/...`.
- No locale-driven redirect or rewrite.

The cookie name (`NEXT_LOCALE`) is the same one next-intl's URL-based middleware would write later, which keeps the migration path open: if/when we move to `/en/...` paths, the cookie keeps preserving user preference and the same negotiation logic applies.

**Why:** No real product pages yet → no SEO benefit from path-prefixed locales today. Avoiding `[locale]/` keeps the App Router tree stable until product surfaces justify the move.

### 2.3 Negotiation order — cookie → Accept-Language → default

`resolveLocale()` (in `src/i18n/locale.ts`) is a pure function:

1. If `NEXT_LOCALE` cookie is present and valid → use it.
2. Else, parse `Accept-Language`, sort by `q`, accept the first tag that matches a supported locale either exactly (`pt-BR`) or by primary subtag (`pt` → `pt-BR`, `en-US` → `en`).
3. Else, fall back to `DEFAULT_LOCALE = "pt-BR"`.

This function is reused from two places:
- `middleware.ts` — writes the cookie on first visit (the negotiation result becomes the persisted preference).
- `src/i18n/request.ts` — `getRequestConfig` reads the cookie on every request and resolves locale; it ignores `requestLocale` (which is `[locale]`-segment-derived and N/A here).

### 2.4 Middleware composition

`middleware.ts` now runs two ordered concerns:

1. **i18n cookie negotiation.** If the cookie is missing or invalid, decide a locale and mirror onto `request.cookies` (so the same request can read it via `cookies()`). Persist the value to the **final** response after the Supabase step, since Supabase's `setAll` callback rebuilds the response and would discard a pre-set cookie. This subtle ordering issue is documented inline.
2. **Supabase session refresh.** Unchanged from ADR 0003.

We deliberately did **not** introduce a `src/proxy/compose.ts` orchestration layer or pre-allocate slots for `organization` / `billing` hooks. Per operating principles, adding empty seams now is speculative abstraction. When Step 8 introduces the organization context, it adds itself to `middleware.ts` explicitly as a third numbered step.

**Why this ordering:** locale negotiation must precede the Supabase block so that the request seen by Supabase already carries the locale cookie (in case future RLS or audit hooks want to read it). Persisting the cookie onto the response happens last so we survive the Supabase response rebuild.

### 2.5 Catalog scope — only what the showcase needs

`src/i18n/messages/pt-BR.json` and `en.json` contain **only** the strings used by `src/app/page.tsx` (showcase title, subtitle, design-system card labels, button variant names, button sizes, footer pointing to `/_health`). No error catalogs, no domain vocabulary, no marketing copy.

**Why:** Step 7 is infrastructure, not content. Translation strings grow with real product surfaces, not before.

### 2.6 Architecture layer — `src/i18n/` is a Next-adapter peer to `config/`

`src/i18n/` is a thin Next-framework adapter. It depends on `next/headers`, `next-intl/server`, and our own `config`. ESLint enforces:

- `i18n/` cannot import from `domains/`, `modules/`, `services/`, `app/`, `components/`, `design-system/`.
- Conversely, `domains/`, `design-system/`, and `lib/` cannot import from `i18n/`. (Translations belong at the page / module composition layer, never inside pure or presentational code.)
- `services/` and `modules/` are *allowed* to import from `i18n/` (e.g. an email module needing translated subject lines) — but no concrete need exists in Step 7.

See `eslint.config.mjs` (`I18N_FORBIDDEN`) and `src/ARCHITECTURE.md`.

### 2.7 Showcase uses Server Components

`src/app/page.tsx` was migrated to `async` + `getTranslations("home")`. No `"use client"` boundary was added for translation. Rationale: keep the page as RSC to avoid shipping the translation runtime to the browser for what is still a static-looking showcase. `NextIntlClientProvider` is still wired in `layout.tsx` so that any future Client Component subtree gets translations for free.

## 3. Consequences

### Positive
- One-file decision points: changing locales, changing default, changing negotiation are all confined to `src/i18n/`.
- No App Router reorganization — `src/app/` tree stayed flat as instructed.
- Middleware stayed in a single file, two clear numbered steps, ready to absorb a third (org context) in Step 8 without restructuring.
- Cookie name aligns with next-intl URL-routing convention → low-cost migration to `/en/...` later.
- Catalog stayed at the minimum surface required to prove the wiring works.

### Negative / Trade-offs
- **Route `/` is now dynamic, not static** (`ƒ Dynamic` in build output). Reading `cookies()` for locale forces per-request rendering. Acceptable: no real landing page yet, no traffic, no CDN concern.
- **No browser-side language switcher exists.** A switcher will, when added, just `Set-Cookie: NEXT_LOCALE=...` and `router.refresh()`. Deferred until a real product UI needs it.
- **Accept-Language negotiation is minimal.** No q-weighted multi-tag matching beyond first-match, no region fallback chains (e.g. `pt-PT` → `pt-BR`). Add when a user reports needing it.
- **No SEO `hreflang`** — there are no localized URLs to point at. When path-based routing lands, `hreflang` lands with it.
- **`page.tsx` is a Server Component.** Any future surface that needs client-side reactive translation must wrap in a client subtree (already supported by `NextIntlClientProvider` in `layout.tsx`).

### Migration path to URL-based routing (future ADR, not blocking)
When a real product justifies `/en/...`:
1. Add `src/app/[locale]/layout.tsx` and move the current `src/app/layout.tsx` body into it (keep root layout minimal, just `<html>` shell).
2. Move `src/app/page.tsx` to `src/app/[locale]/page.tsx`.
3. Add `defineRouting` + `createNavigation` in `src/i18n/`.
4. Replace the cookie write in `middleware.ts` with `createMiddleware(routing)` (cookie persistence is included).
5. `request.ts` switches from cookie reads to `requestLocale` segment.
6. Existing `pt-BR.json` / `en.json` catalogs are unchanged.

`NEXT_LOCALE` cookie continues to function as preference memory across modes.

## 4. Rejected alternatives

- **URL-based routing now (`/en/...`)** — would force `[locale]/` reorganization before any real product surface needs it. Decision recorded as Q2(b ajustado) in the deciding conversation.
- **`proxy.ts` rename + composition layer** — Next 16 deprecates `middleware.ts` in favor of `proxy.ts`, but the rename was deferred (Q1: b) to avoid two simultaneous structural changes in the same step. To be revisited when org/billing contexts join the composition.
- **`next-i18next`** — Pages-Router-rooted, heavier, no Server Component story.
- **Custom in-house i18n** — would force re-implementing ICU, plurals, fallback chains.
- **Reading `Accept-Language` only (no cookie)** — would re-negotiate on every request, ignoring user preference and breaking the "user picked English once" expectation.

## 5. References

- `src/i18n/config.ts` — `LOCALES`, `DEFAULT_LOCALE`, `LOCALE_COOKIE`, `isLocale()`.
- `src/i18n/locale.ts` — pure `resolveLocale()` (cookie → Accept-Language → default).
- `src/i18n/request.ts` — `getRequestConfig` reading from cookies + headers.
- `src/i18n/messages/{pt-BR,en}.json` — minimal showcase catalog.
- `middleware.ts` — composed: i18n cookie write + Supabase session refresh.
- `next.config.ts` — wraps config with `createNextIntlPlugin('./src/i18n/request.ts')`.
- `src/app/layout.tsx` — `NextIntlClientProvider` wraps children; `<html lang={locale}>`.
- `src/app/page.tsx` — Server Component using `getTranslations("home")`.
- `eslint.config.mjs` — `I18N_FORBIDDEN` + `NO_IO`/`DESIGN_SYSTEM_FORBIDDEN`/`LIB_FORBIDDEN` updates.
- next-intl docs — https://next-intl.dev/
