import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env } from "@/config/env";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  isLocale,
} from "@/i18n/config";
import { resolveLocale } from "@/i18n/locale";

/**
 * Piantare middleware — composes two concerns, in order:
 *
 *   1. i18n: ensure a valid `NEXT_LOCALE` cookie exists (negotiated from
 *      Accept-Language on first visit). No redirect, no URL rewrite —
 *      Step 7 deliberately avoids `[locale]/` routing (see ADR 0005).
 *
 *   2. auth: refresh the Supabase session on every navigation by
 *      reading/writing auth cookies (ADR 0003, ADR 0004).
 *
 * Future hooks (organization context, billing context) plug in here as
 * additional named steps before/after `auth`. We are NOT pre-creating
 * those slots — adding an empty seam now is the kind of speculative
 * abstraction the operating principles forbid. When Step 8 lands the
 * org context, it adds itself to this file explicitly.
 *
 * Runtime is pinned to `nodejs` (Next 16: `proxy.ts` runtime is nodejs-
 * only, so we already match the future migration target).
 *
 * Pattern source: Supabase SSR docs + next-intl docs (cookie-only mode).
 */

export const config = {
  // Skip Next internals, static assets, image optimizer, and our health
  // smoke endpoint (so it can prove RLS without a session refresh in the path).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|_health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map)$).*)",
  ],
  runtime: "nodejs",
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // --- Step 1: i18n cookie negotiation -------------------------------------
  // Decide the locale once. If a valid cookie already exists, `localeToPersist`
  // stays null and we skip the Set-Cookie. Otherwise we write to the request
  // (so the same render reads it via `cookies()`) and remember to mirror onto
  // the final response — done AFTER Supabase, since `setAll` below may rebuild
  // the response and would otherwise discard a pre-Supabase cookie write.
  const existingLocaleCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  let localeToPersist: string | null = null;
  if (!existingLocaleCookie || !isLocale(existingLocaleCookie)) {
    const locale = resolveLocale({
      cookieValue: existingLocaleCookie,
      acceptLanguage: request.headers.get("accept-language"),
    });
    request.cookies.set(LOCALE_COOKIE, locale);
    localeToPersist = locale;
  }

  // --- Step 2: Supabase session refresh ------------------------------------
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate both the inbound request cookies (so subsequent
          // reads inside this same request see the fresh values) and
          // the outbound response cookies (so the browser stores them).
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touch the user — this triggers a token refresh if needed, and the
  // `setAll` handler above writes the refreshed cookies back.
  await supabase.auth.getUser();

  // Persist the negotiated locale onto the *final* response (post any
  // Supabase-driven response rebuild).
  if (localeToPersist) {
    response.cookies.set(LOCALE_COOKIE, localeToPersist, {
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
