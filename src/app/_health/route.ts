import { NextResponse } from "next/server";

import { createClient } from "@/services/supabase/server";
import { getCurrentUser } from "@/modules/auth";

/**
 * /_health — smoke endpoint.
 *
 * Public on purpose (see ADR 0003): anonymous request must be able to hit
 * this route, prove that
 *   1. the Supabase server client wires up,
 *   2. `auth.uid()` is null without a session,
 *   3. `profiles` lookups return no rows under RLS for an anonymous caller.
 *
 * No business data is exposed: only the existence and shape of these checks.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  try {
    const supabase = await createClient();

    const currentUser = await getCurrentUser();

    // Anonymous queries should return 0 rows under RLS, not raise an error.
    const { data: profilesProbe, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    // Helper-fn probe: returns false for anonymous caller.
    const { data: isAdminProbe, error: isAdminError } = await supabase.rpc(
      "is_admin",
    );

    return NextResponse.json({
      ok: true,
      tookMs: Date.now() - startedAt,
      auth: {
        currentUser, // null when anonymous
      },
      rls: {
        profilesRowsVisible: profilesProbe?.length ?? 0,
        profilesError: profilesError?.message ?? null,
        isAdmin: isAdminProbe ?? null,
        isAdminError: isAdminError?.message ?? null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, tookMs: Date.now() - startedAt, error: message },
      { status: 500 },
    );
  }
}
