import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE } from "./config";
import { resolveLocale } from "./locale";

/**
 * next-intl request configuration.
 *
 * Step 7 ships cookie-based locale detection — there is no `[locale]`
 * segment in the App Router. We therefore IGNORE `requestLocale` (which
 * is segment-derived) and resolve locale from cookies + Accept-Language
 * on every request.
 *
 * When/if URL-based routing is introduced later, this file becomes:
 *   const requested = await requestLocale;
 *   const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
 *
 * — see ADR 0005 §5.
 */
export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const locale = resolveLocale({
    cookieValue: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  // Static import so the bundler can statically resolve and tree-shake.
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    // Both locales are EN-style date/time (no zoneless preference); keep
    // server-side time zone implicit until product surfaces require it.
    now: new Date(),
    // Default time zone deferred — surface decisions belong to product UI,
    // not the i18n shell.
  };
});

export { DEFAULT_LOCALE };
