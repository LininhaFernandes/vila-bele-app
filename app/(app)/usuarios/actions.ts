"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

const ROLES: UserRole[] = ["admin", "viewer_approver", "contributor"];

async function assertAdmin() {
  const { profile } = await requireProfile();
  requireAdmin(profile);
  return profile;
}

export async function createUserAction(formData: FormData) {
  await assertAdmin();

  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "") as UserRole;

  if (!full_name || !email || !ROLES.includes(role)) {
    return { error: "Preencha nome, e-mail e papel corretamente." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });

  if (error || !data.user) {
    return {
      error:
        error?.message === "User already registered"
          ? "Já existe um usuário com este e-mail."
          : (error?.message ?? "Não foi possível convidar este e-mail."),
    };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .insert({ id: data.user.id, full_name, role });

  if (profileError) {
    // volta atrás: remove o usuário de autenticação órfão
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Não foi possível criar o perfil: " + profileError.message };
  }

  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserAction(id: string, full_name: string, role: UserRole) {
  await assertAdmin();
  if (!full_name.trim() || !ROLES.includes(role)) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name.trim(), role })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}

export async function setUserActiveAction(id: string, active: boolean) {
  const admin = await assertAdmin();
  if (id === admin.id && !active) {
    return { error: "Você não pode desativar sua própria conta." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ active }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  return { success: true };
}
