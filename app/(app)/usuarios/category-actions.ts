"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const { profile } = await requireProfile();
  requireAdmin(profile);
}

export async function createCategoryAction(formData: FormData) {
  await assertAdmin();

  const name = String(formData.get("name") || "").trim();
  const icon = String(formData.get("icon") || "").trim() || "Package";

  if (!name) return { error: "Dê um nome para a categoria." };

  const supabase = await createClient();
  const { data: max } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from("categories")
    .insert({ name, icon, sort_order: (max?.sort_order ?? 0) + 1 });

  if (error) {
    return {
      error: error.code === "23505" ? "Já existe uma categoria com esse nome." : error.message,
    };
  }

  revalidatePath("/usuarios");
  revalidatePath("/despesas");
  revalidatePath("/painel");
  return { success: true };
}

export async function updateCategoryAction(id: string, name: string, icon: string) {
  await assertAdmin();
  if (!name.trim()) return { error: "Dê um nome para a categoria." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ name: name.trim(), icon: icon.trim() || "Package" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  revalidatePath("/despesas");
  revalidatePath("/painel");
  return { success: true };
}

export async function setCategoryActiveAction(id: string, active: boolean) {
  await assertAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ active }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/usuarios");
  revalidatePath("/despesas");
  revalidatePath("/painel");
  return { success: true };
}
