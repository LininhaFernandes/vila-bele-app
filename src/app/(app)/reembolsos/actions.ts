"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createBatchAction(
  expenseIds: string[],
  paidBy: string,
  paidAt: string,
  notes: string,
) {
  const { userId, profile } = await requireProfile();
  if (profile.role !== "admin" && profile.role !== "viewer_approver") {
    return { error: "Você não pode registrar reembolsos." };
  }
  if (expenseIds.length === 0) {
    return { error: "Selecione ao menos uma despesa." };
  }
  if (!paidBy || !paidAt) {
    return { error: "Informe quem pagou e a data." };
  }

  const supabase = await createClient();

  const { data: selected, error: fetchError } = await supabase
    .from("expenses")
    .select("id, amount, reimbursement_status")
    .in("id", expenseIds);

  if (fetchError) return { error: fetchError.message };

  const invalid = selected?.some((e) => e.reimbursement_status !== "pending");
  if (invalid) {
    return { error: "Alguma despesa selecionada não está mais aguardando reembolso." };
  }

  const total = (selected ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

  const { data: batch, error: batchError } = await supabase
    .from("reimbursement_batches")
    .insert({ paid_at: paidAt, total_amount: total, paid_by: paidBy, notes: notes || null, created_by: userId })
    .select("id")
    .single();

  if (batchError) return { error: batchError.message };

  const { error: updateError } = await supabase
    .from("expenses")
    .update({
      reimbursement_status: "reimbursed",
      reimbursed_by: paidBy,
      reimbursed_at: paidAt,
      reimbursement_batch_id: batch.id,
    })
    .in("id", expenseIds);

  if (updateError) return { error: updateError.message };

  revalidatePath("/reembolsos");
  revalidatePath("/despesas");
  revalidatePath("/painel");
  return { success: true };
}
