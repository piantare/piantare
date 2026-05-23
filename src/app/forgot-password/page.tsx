import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SubmitButton,
} from "@/design-system";
import { getCurrentUser, sendPasswordReset } from "@/modules/auth";

type Search = { error?: string; info?: string };

/**
 * Single-field form that triggers a Supabase recovery email.
 *
 * Idempotent + neutral: we always show the same "se existe uma conta..."
 * confirmation, regardless of whether the email is registered. Prevents
 * account enumeration.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;

  // If already signed in, no point being here.
  const existing = await getCurrentUser();
  if (existing) redirect("/");

  async function sendResetAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    if (!email) {
      redirect(
        `/forgot-password?error=${encodeURIComponent("Informe seu email.")}`,
      );
    }

    // Reconstruct origin from the proxy headers (Railway sets these).
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    const proto = h.get("x-forwarded-proto") ?? "https";
    const origin = `${proto}://${host}`;
    const redirectTo = `${origin}/auth/callback?next=/auth/reset-password`;

    const error = await sendPasswordReset(email, redirectTo);
    if (error) {
      redirect(`/forgot-password?error=${encodeURIComponent(error)}`);
    }

    redirect(
      `/login?info=${encodeURIComponent("Se existe uma conta com este email, você receberá um link para redefinir a senha.")}`,
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          Recuperar acesso
        </h1>
        <p className="text-[14px] font-light leading-relaxed text-[var(--piantare-muted)]">
          Enviaremos um link calmo para você redefinir sua senha.
        </p>
      </header>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-5 p-7">
          {sp.error && <p className="text-[13px] text-destructive">{sp.error}</p>}
          {sp.info && (
            <p className="text-[13px] text-muted-foreground">{sp.info}</p>
          )}
          <form action={sendResetAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <SubmitButton pendingLabel="Enviando…" className="mt-2 w-full">
              Enviar link de recuperação
            </SubmitButton>
          </form>
          <p className="pt-2 text-[13px] font-light text-[var(--piantare-muted)]">
            Lembrou da senha?{" "}
            <a
              className="text-[var(--piantare-gm)] underline-offset-4 hover:underline"
              href="/login"
            >
              Entrar
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
