/**
 * i18n — static configuration.
 *
 * Step 7 ships cookie-based locale detection without URL-based routing.
 * When (and if) we later move to `/en/...` paths, only this file and
 * `src/i18n/request.ts` change shape — the rest of the app keeps using
 * `useTranslations` / `getTranslations` unchanged.
 *
 * See ADR 0005.
 */

export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";

/**
 * Cookie name used to persist the user's chosen (or detected) locale.
 * `NEXT_LOCALE` is the convention next-intl middleware also writes when
 * URL-based routing is enabled — using the same name keeps the door open
 * for a later, low-friction migration to `localePrefix` routing.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Max-age for the locale cookie: 1 year. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
