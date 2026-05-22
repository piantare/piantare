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
import { getCurrentUser, updateOwnPassword } from "@/modules/auth";

type Search = { error?: string };

/**
 * Final step of the password recovery flow.
 *
 * The user arrives here after `/auth/callback` has exchanged the recovery
 * code for a real session, so `getCurrentUser()` succeeds even though the
 * user technically "forgot" their password. We require a signed-in session
 * to render the form — anyone arriving without one is bounced to login.
 *
 * After update, we sign them straight into `/` (the loop entry point).
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("Sessão de recuperação expirada. Solicite um novo link.")}`,
    );
  }

  async function updatePasswordAction(formData: FormData) {
    "use server";
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password.length < 6) {
      redirect(
        `/auth/reset-password?error=${encodeURIComponent("Senha precisa de pelo menos 6 caracteres.")}`,
      );
    }
    if (password !== confirm) {
      redirect(
        `/auth/reset-password?error=${encodeURIComponent("As senhas não coincidem.")}`,
      );
    }
    const error = await updateOwnPassword(password);
    if (error) {
      redirect(`/auth/reset-password?error=${encodeURIComponent(error)}`);
    }
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Definir nova senha</CardTitle>
          <CardDescription>
            Escolha uma senha de pelo menos 6 caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sp.error && <p className="text-sm text-destructive">{sp.error}</p>}
          <form action={updatePasswordAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Nova senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Confirme a senha</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={6}
              />
            </div>
            <SubmitButton pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
