"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { expenseFormSchema } from "@/lib/expense-schema";
import type { Expense } from "@/types/database";

function parseExpenseForm(formData: FormData) {
  const raw = {
    expense_date: String(formData.get("expense_date") || ""),
    description: String(formData.get("description") || ""),
    establishment: String(formData.get("establishment") || ""),
    category_id: String(formData.get("category_id") || ""),
    amount: String(formData.get("amount") || ""),
    paid_by: String(formData.get("paid_by") || ""),
    reimbursement_status: String(formData.get("reimbursement_status") || "not_applicable"),
    receipt_type: String(formData.get("receipt_type") || "none"),
    notes: String(formData.get("notes") || ""),
  };
  return expenseFormSchema.safeParse(raw);
}

export async function createExpenseAction(formData: FormData, receiptPath: string | null) {
  const { userId, profile } = await requireProfile();

  if (profile.role !== "admin" && profile.role !== "contributor") {
    return { error: "Você não pode cadastrar despesas." };
  }

  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      ...parsed.data,
      establishment: parsed.data.establishment || null,
      notes: parsed.data.notes || null,
      receipt_url: receiptPath,
      receipt_type: receiptPath ? parsed.data.receipt_type : "none",
      source: "manual",
      status: "confirmed",
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/despesas");
  revalidatePath("/painel");
  redirect(`/despesas/${data.id}`);
}

export async function updateExpenseAction(
  id: string,
  formData: FormData,
  receiptPath: string | null,
) {
  const { userId, profile } = await requireProfile();

  const parsed = parseExpenseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();

  if (profile.role === "contributor") {
    const { data: existing } = await supabase
      .from("expenses")
      .select("created_by")
      .eq("id", id)
      .maybeSingle();
    if (!existing || existing.created_by !== userId) {
      return { error: "Você só pode editar despesas que você mesmo cadastrou." };
    }
  } else if (profile.role !== "admin") {
    return { error: "Você não pode editar despesas." };
  }

  const update: Partial<Expense> = {
    ...parsed.data,
    establishment: parsed.data.establishment || null,
    notes: parsed.data.notes || null,
  };
  if (receiptPath) {
    update.receipt_url = receiptPath;
    update.receipt_type = parsed.data.receipt_type;
  }

  const { error } = await supabase.from("expenses").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/despesas");
  revalidatePath(`/despesas/${id}`);
  revalidatePath("/painel");
  redirect(`/despesas/${id}`);
}

export async function deleteExpenseAction(id: string) {
  const { profile } = await requireProfile();
  if (profile.role !== "admin") {
    return { error: "Só a administradora pode excluir despesas." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/despesas");
  revalidatePath("/painel");
  redirect("/despesas");
}

export async function markReimbursementAction(
  id: string,
  status: "pending" | "reimbursed" | "not_applicable",
  reimbursedBy?: string,
) {
  const { profile } = await requireProfile();
  if (profile.role !== "admin" && profile.role !== "viewer_approver") {
    return { error: "Você não pode alterar o status de reembolso." };
  }

  const supabase = await createClient();
  const update: Partial<Expense> = { reimbursement_status: status };
  if (status === "reimbursed") {
    update.reimbursed_by = reimbursedBy ?? null;
    update.reimbursed_at = new Date().toISOString().slice(0, 10);
  } else {
    update.reimbursed_by = null;
    update.reimbursed_at = null;
    update.reimbursement_batch_id = null;
  }

  const { error } = await supabase.from("expenses").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/despesas");
  revalidatePath(`/despesas/${id}`);
  revalidatePath("/painel");
  revalidatePath("/reembolsos");
  return { success: true };
}
