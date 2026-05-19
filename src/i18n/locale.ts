import { DEFAULT_LOCALE, LOCALES, type Locale, isLocale } from "./config";

/**
 * Resolve a locale from a cookie value first, falling back to an
 * Accept-Language negotiation, then to the default.
 *
 * Pure function — no `next/headers` import here so this can be reused from
 * middleware (NextRequest), Server Components (next/headers), and tests.
 */
export function resolveLocale({
  cookieValue,
  acceptLanguage,
}: {
  cookieValue?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (cookieValue && isLocale(cookieValue)) {
    return cookieValue;
  }

  if (acceptLanguage) {
    const negotiated = negotiateFromAcceptLanguage(acceptLanguage);
    if (negotiated) return negotiated;
  }

  return DEFAULT_LOCALE;
}

/**
 * Minimal Accept-Language negotiation: parse q-weighted tags, sort by
 * descending q, return the first tag that matches a supported locale
 * either exactly (pt-BR) or by primary subtag (pt → pt-BR).
 */
function negotiateFromAcceptLanguage(header: string): Locale | null {
  const tags = header
    .split(",")
    .map((part) => {
      const [raw, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: raw.trim(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    // Exact match first (e.g. "pt-BR").
    if (isLocale(tag)) return tag;

    // Primary-subtag match (e.g. "pt" → "pt-BR", "en-US" → "en").
    const primary = tag.split("-")[0]?.toLowerCase();
    if (!primary) continue;
    const fallback = LOCALES.find(
      (locale) => locale.split("-")[0].toLowerCase() === primary,
    );
    if (fallback) return fallback;
  }

  return null;
}
