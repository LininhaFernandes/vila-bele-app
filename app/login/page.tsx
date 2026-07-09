import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            VB
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vila Bele</h1>
          <p className="text-muted-foreground">Controle de despesas do sítio</p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
