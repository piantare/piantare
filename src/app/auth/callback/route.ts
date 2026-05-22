import { NextResponse, type NextRequest } from "next/server";

import { exchangeCodeForSession } from "@/modules/auth";

/**
 * Supabase auth callback — handles links from recovery emails (password
 * reset) and, in the future, email confirmation / OAuth.
 *
 * Flow:
 *   1. Supabase sends an email with a URL like:
 *        https://<site>/auth/callback?code=...&next=/auth/reset-password
 *   2. We exchange the code for a session (writes auth cookies).
 *   3. We 303 to the `next` URL (defaults to `/`).
 *
 * Safety:
 *   - `next` is constrained to same-origin paths (no protocol, no host).
 *   - Errors redirect back to `/login?error=...` so the user lands somewhere
 *     known, never a stranded page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  // Guardrail: `next` must be a relative path.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Link de recuperação inválido.")}`,
        request.url,
      ),
    );
  }

  const error = await exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
