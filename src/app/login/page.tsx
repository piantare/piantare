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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? "Criar conta" : "Entrar"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Crie sua conta para começar a configurar sua indústria ou brand."
              : "Acesse sua conta Piantare."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sp.error && (
            <p className="text-sm text-destructive">{sp.error}</p>
          )}
          {sp.info && (
            <p className="text-sm text-muted-foreground">{sp.info}</p>
          )}
          <form
            action={isSignUp ? signUpAction : signInAction}
            className="flex flex-col gap-4"
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
            <SubmitButton pendingLabel={isSignUp ? "Criando conta…" : "Entrando…"}>
              {isSignUp ? "Criar conta" : "Entrar"}
            </SubmitButton>
          </form>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Já tem conta? " : "Novo aqui? "}
            <a
              className="underline"
              href={isSignUp ? "/login" : "/login?mode=signup"}
            >
              {isSignUp ? "Entrar" : "Criar conta"}
            </a>
          </p>
          {!isSignUp && (
            <p className="text-sm text-muted-foreground">
              Esqueceu a senha?{" "}
              <a className="underline" href="/forgot-password">
                Recuperar acesso
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
