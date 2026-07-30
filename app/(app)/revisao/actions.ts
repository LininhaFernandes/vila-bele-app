"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { expenseFormSchema } from "@/lib/expense-schema";
import { syncDriveReceipts, type SyncSummary } from "@/lib/drive-sync";

export async function triggerSyncAction(): Promise<{ error?: string; summary?: SyncSummary }> {
  const { userId, profile } = await requireProfile();
  requireAdmin(profile);

  try {
    const summary = await syncDriveReceipts(userId);
    revalidatePath("/revisao");
    revalidatePath("/painel");
    return { summary };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Falha ao sincronizar." };
  }
}

export async function confirmDraftAction(id: string, formData: FormData) {
  const { profile } = await requireProfile();
  requireAdmin(profile);

  const raw = {
    expense_date: String(formData.get("expense_date") || ""),
    description: String(formData.get("description") || ""),
    establishment: String(formData.get("establishment") || ""),
    category_id: String(formData.get("category_id") || ""),
    amount: String(formData.get("amount") || ""),
    paid_by: String(formData.get("paid_by") || ""),
    reimbursement_status: String(formData.get("reimbursement_status") || "not_applicable"),
    receipt_type: String(formData.get("receipt_type") || "cupom_fiscal"),
    notes: String(formData.get("notes") || ""),
  };
  const parsed = expenseFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      ...parsed.data,
      establishment: parsed.data.establishment || null,
      notes: parsed.data.notes || null,
      status: "confirmed",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/revisao");
  revalidatePath("/despesas");
  revalidatePath("/painel");
  return { success: true };
}

export async function discardDraftAction(id: string) {
  const { profile } = await requireProfile();
  requireAdmin(profile);

  const supabase = await createClient();
  const { data: expense } = await supabase
    .from("expenses")
    .select("receipt_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  if (expense?.receipt_url) {
    await supabase.storage.from("receipts").remove([expense.receipt_url]);
  }

  revalidatePath("/revisao");
  revalidatePath("/painel");
  return { success: true };
}
