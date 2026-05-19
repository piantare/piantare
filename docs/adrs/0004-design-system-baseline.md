# ADR 0004 — Design System Baseline

- **Status:** Accepted
- **Date:** 2026-05-18
- **Deciders:** Nathan Candido Silva
- **Phase:** 2, Step 6
- **Related:** ADR 0002 (layering — `design-system/` is presentational, cannot import from domains/modules/services), `project_operating_principles` (calm, invisible complexity)

---

## 1. Context

Phase 2 needs a minimum design system before any product surface is built. The trio (middleware/auth/RLS) from Step 5 is in place; the next foundation is the visual layer. Three questions had to be answered before writing a single component:

1. What is the lineage — bespoke from scratch, or fork a known baseline?
2. What is the styling primitive — plain Tailwind classes per call site, or a variants-based abstraction?
3. What is the brand palette and typography on day one — final tokens or placeholders?

The product itself spans multiple verticals (cannabis-br is #0, more to come) and two-axis tenancy (Family + Organization). The visual system needs to feel calm and clinical, not consumer-flashy. But on **Day 1 of Step 6** there is no approved brand palette yet, no logo, no design partner output to consume. We need a system that lets us build product surfaces *now* without committing to a final visual identity.

## 2. Decision

### 2.1 Lineage — shadcn/ui patterns, not the CLI registry

We adopt **shadcn/ui patterns and code style** as the baseline for our primitives:

- `React.forwardRef` for every primitive.
- `cva` (class-variance-authority) for variant + size APIs.
- Radix Primitives where accessibility matters (`@radix-ui/react-label`, `@radix-ui/react-slot`).
- `cn()` helper combining `clsx` + `tailwind-merge` at `src/lib/cn.ts`.
- Token names follow shadcn taxonomy: `background`, `foreground`, `card`, `popover`, `muted`, `border`, `input`, `ring`, `primary`, `secondary`, `accent`, `destructive`, `--radius`.

We do **not** install the shadcn CLI or treat the upstream registry as a vendored dependency. Components live under `src/design-system/primitives/` and we own them. Upstream patterns are a starting point, not a dependency.

**Why:** shadcn patterns are battle-tested, copy-paste-friendly, and already match the React 19 + Tailwind v4 conventions. Owning the files (rather than `npx shadcn add`) keeps our diff history honest and lets us diverge whenever brand guidelines arrive.

### 2.2 Styling primitive — `cva` + `tailwind-merge`

Every primitive with more than one visual mode uses `cva` for variants. Class composition at call sites uses `cn(...)`. Plain string concatenation of class names is forbidden in the design system layer.

**Why:** the cost of `cva` is small (one file each), the gain is consistent variant APIs across primitives, type-checked variant names, and free `defaultVariants` ergonomics. `tailwind-merge` resolves Tailwind conflicts at runtime (last-write-wins per utility group), which is necessary because every primitive accepts an external `className` override.

### 2.3 Brand palette — placeholder, oklch, ready to be swapped

The tokens in `src/app/globals.css` are **placeholder values**, not the final Piantare palette. Specifically:

- All colors are expressed in `oklch(...)` (perceptual color space, Tailwind v4 native).
- Light mode (`:root`) uses near-white neutrals with a moss-green primary `oklch(0.45 0.08 150)`.
- Dark mode (`.dark`) mirrors the same tokens with inverted lightness.
- `--radius: 0.625rem` (10px) sets a soft, calm corner radius.

These tokens are **swappable in a single file** without touching any primitive or page. When the brand palette lands, only `src/app/globals.css` changes; all primitives and product surfaces automatically pick up the new values.

**Why moss green as a placeholder:** the product is about longevity, bridges, and care. A muted green is a defensible neutral that won't read as "wrong" while we wait for the final brand. It is explicitly *not* a brand decision — see §5 for what makes it final.

### 2.4 Typography — Inter + JetBrains Mono, via `next/font/google`

- `Inter` → `--font-sans` (UI text)
- `JetBrains Mono` → `--font-mono` (code, monospaced data)

Loaded once in `src/app/layout.tsx` via `next/font/google` with `variable` + `subsets: ["latin"]`. Exposed to Tailwind v4 via `@theme inline { --font-sans: var(--font-sans); --font-mono: var(--font-mono); }`.

**Why:** Inter is industry-standard, free, accessible. JetBrains Mono is a calm monospace with strong i18n support. Both are placeholders until brand typography is decided, but they are **good enough placeholders** — switching them later costs one PR.

### 2.5 Scope of Step 6 — four primitives, nothing else

The Step 6 baseline ships exactly four primitives:

| Primitive | File                                          | Notes                                    |
|-----------|-----------------------------------------------|------------------------------------------|
| `Button`  | `src/design-system/primitives/button.tsx`    | 6 variants × 4 sizes, `asChild` via Slot |
| `Input`   | `src/design-system/primitives/input.tsx`     | forwardRef, focus-visible ring           |
| `Label`   | `src/design-system/primitives/label.tsx`     | `"use client"`, Radix LabelPrimitive    |
| `Card`    | `src/design-system/primitives/card.tsx`      | Card + Header/Title/Description/Content/Footer |

Barrels:
- `src/design-system/primitives/index.ts` re-exports the four.
- `src/design-system/index.ts` re-exports primitives.

`src/app/page.tsx` becomes a primitives showcase: it renders all variants and sizes so we can visually verify token coherence (light + dark via OS preference).

### 2.6 Non-scope of Step 6 — explicit

The following are **deliberately not part of Step 6**:

- Dialog, Tooltip, DropdownMenu, Toast, Tabs, Select, Checkbox, Radio, Switch, Form (these come when a product surface needs them, not before).
- Layout shell (header, nav, sidebar).
- Login / auth UI (`/login`, `/register`).
- Locale switcher (Step 7 — i18n shell).
- Empty states, loading skeletons, error boundaries with branded copy.

Each of these requires its own product context. Adding them speculatively here would be exactly the "speculative abstraction" the operating principles forbid.

## 3. Consequences

### Positive
- Product surfaces can be built today against stable primitives.
- Swapping tokens (brand palette, fonts, radius) is a one-file change.
- shadcn lineage means new contributors find familiar code shapes.
- The ESLint `design-system/**` block (ADR 0002) keeps the layer pure-presentational.

### Negative / Tech-debt
- The moss-green placeholder palette **will** end up screenshotted somewhere before brand lands. Comms team should be warned.
- `cn()` runs `tailwind-merge` on every render; for primitives this is negligible, but if we ever wrap it inside tight loops we'll need to memo.
- We're carrying both `clsx` and `tailwind-merge` (~3kb gzipped together). Accepted.

### Migration path when brand lands (ADR 0004-future, not blocking)
1. Update `:root` and `.dark` in `src/app/globals.css` with final oklch values.
2. Swap `Inter` / `JetBrains_Mono` imports in `src/app/layout.tsx` for chosen brand fonts.
3. Optionally adjust `--radius`.
4. No primitive file changes expected. If a primitive *does* change, it's a sign the new brand needs a richer token taxonomy — extend tokens, don't bake hex into the primitive.

## 4. Rejected alternatives

- **Build primitives from scratch.** Slower, no a11y guarantees, no community knowledge for free.
- **Use a full UI kit (MUI, Chakra, Mantine).** Too opinionated visually, hard to swap tokens cleanly, runtime CSS-in-JS overhead conflicts with Tailwind v4 conventions.
- **`npx shadcn add` CLI.** Adds tooling we don't need; we'd own the same files anyway and the CLI muddies the git history.
- **Final brand palette today.** No brand decision has been made; committing now would either lock us in or guarantee rework. Placeholder is honest.

## 5. What makes the palette final (acceptance criteria for a future ADR)

The placeholder palette is replaced only when **all** of:
1. Comms (Luana) signs off on primary, secondary, accent in light + dark.
2. UX (Adson) validates contrast ratios meet WCAG AA on the four primitives.
3. An ADR documents the chosen oklch values with reasoning.

Until then, the moss green stands.

## 6. References

- `src/lib/cn.ts` — `cn()` helper.
- `src/app/globals.css` — token taxonomy + light/dark blocks + `@theme inline`.
- `src/app/layout.tsx` — font wiring.
- `src/design-system/primitives/` — the four primitives.
- `src/app/page.tsx` — showcase, replaced by real landing in a later step.
- shadcn/ui — https://ui.shadcn.com (upstream pattern lineage, not a dependency).
