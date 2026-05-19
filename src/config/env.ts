import { z } from "zod";

/**
 * Runtime environment contract for Piantare.
 *
 * - Parsed once at module load; fails fast on missing/invalid values.
 * - Public vars (NEXT_PUBLIC_*) are inlined by Next at build time.
 * - Server-only vars are NEVER referenced from client code.
 * - Validated by tests and `next build`.
 *
 * Schema source-of-truth: docs/adrs/0001 (Supabase baseline).
 */

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // --- Supabase (required) ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

  // --- Supabase service-role (optional, server-only) ---
  // If absent, services/supabase/admin.ts throws on use.
  // See docs/adrs/0003 (auth + RLS) for usage rules.
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

type Env = z.infer<typeof EnvSchema>;

function parseEnv(): Env {
  const parsed = EnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    // Fail fast — print every issue, then crash.
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\nSee .env.local.example.`,
    );
  }

  return parsed.data;
}

export const env = parseEnv();
export type { Env };
