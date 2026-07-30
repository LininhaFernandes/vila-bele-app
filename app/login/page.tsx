import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-secondary/60 to-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
            VB
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Vila Bele</h1>
          <p className="text-muted-foreground text-sm">
            Controle de despesas do sítio
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
