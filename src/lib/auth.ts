import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/** Retorna o usuário logado e seu perfil. Redireciona para /login se não houver sessão. */
export async function requireProfile(): Promise<{ userId: string; email: string; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.active) {
    redirect("/sem-acesso");
  }

  return { userId: user.id, email: user.email ?? "", profile };
}

/** Redireciona para /painel se o perfil não for admin. Use em páginas restritas. */
export function requireAdmin(profile: Profile) {
  if (profile.role !== "admin") {
    redirect("/painel");
  }
}
