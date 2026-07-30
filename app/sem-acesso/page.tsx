import { LogoutButtonStandalone } from "./logout-button-standalone";

export default function SemAcessoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Seu acesso ainda não foi liberado</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Sua conta existe, mas ainda não foi vinculada a um usuário do sistema Vila
        Bele. Peça para a administradora te cadastrar na tela de Usuários.
      </p>
      <LogoutButtonStandalone />
    </main>
  );
}
