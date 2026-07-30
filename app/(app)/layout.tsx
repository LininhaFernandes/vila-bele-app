import { requireProfile } from "@/lib/auth";
import { TopNav } from "@/components/nav/top-nav";
import { BottomNav } from "@/components/nav/bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Temporariamente desabilitado para debug
  // const { profile } = await requireProfile();

  const profile = {
    id: "temp-user",
    full_name: "Usuário Teste",
    role: "admin",
    active: true,
    created_at: new Date().toISOString(),
  } as any;

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-10">
        {children}
      </main>
      <BottomNav profile={profile} />
    </div>
  );
}
