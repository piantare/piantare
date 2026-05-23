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
import {
  getCurrentUser,
  signInWithPassword,
  signUpWithPassword,
} from "@/modules/auth";

type LoginSearch = { mode?: string; error?: string; info?: string };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearch>;
}) {
  const sp = await searchParams;
  const isSignUp = sp.mode === "signup";

  const existing = await getCurrentUser();
  if (existing) redirect("/");

  async function signInAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || !password) {
      redirect(`/login?error=${encodeURIComponent("Preencha email e senha.")}`);
    }
    const errorMessage = await signInWithPassword(email, password);
    if (errorMessage) {
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
    redirect("/");
  }

  async function signUpAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!email || password.length < 6) {
      redirect(
        `/login?mode=signup&error=${encodeURIComponent("Email válido e senha de pelo menos 6 caracteres.")}`,
      );
    }
    const result = await signUpWithPassword(email, password);
    if (!result.ok) {
      redirect(`/login?mode=signup&error=${encodeURIComponent(result.error)}`);
    }
    if (result.needsConfirmation) {
      redirect(
        `/login?info=${encodeURIComponent("Confira seu email para confirmar a conta.")}`,
      );
    }
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-serif text-[44px] font-light leading-none tracking-tight">
          Piantare
        </h1>
        <p className="text-[13px] font-light italic text-[var(--piantare-muted)]">
          Criar pontes para a longevidade.
        </p>
      </header>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{isSignUp ? "Criar conta" : "Entrar"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crie sua conta para começar a configurar sua indústria ou brand."
              : "Acesse sua conta Piantare."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {sp.error && (
            <p className="text-[13px] text-destructive">{sp.error}</p>
          )}
          {sp.info && (
            <p className="text-[13px] text-muted-foreground">{sp.info}</p>
          )}
          <form
            action={isSignUp ? signUpAction : signInAction}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            <SubmitButton
              pendingLabel={isSignUp ? "Criando conta…" : "Entrando…"}
              className="mt-2 w-full"
            >
              {isSignUp ? "Criar conta" : "Entrar"}
            </SubmitButton>
          </form>
          <div className="flex flex-col gap-2 pt-2 text-[13px] font-light text-[var(--piantare-muted)]">
            <p>
              {isSignUp ? "Já tem conta? " : "Novo aqui? "}
              <a
                className="text-[var(--piantare-gm)] underline-offset-4 hover:underline"
                href={isSignUp ? "/login" : "/login?mode=signup"}
              >
                {isSignUp ? "Entrar" : "Criar conta"}
              </a>
            </p>
            {!isSignUp && (
              <p>
                Esqueceu a senha?{" "}
                <a
                  className="text-[var(--piantare-gm)] underline-offset-4 hover:underline"
                  href="/forgot-password"
                >
                  Recuperar acesso
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
