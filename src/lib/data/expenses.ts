import { createClient } from "@/lib/supabase/server";
import type { ExpenseWithRelations, ReimbursementStatus } from "@/types/database";

const EXPENSE_SELECT = `
  *,
  category:categories(*),
  payer:profiles!expenses_paid_by_fkey(*),
  reimburser:profiles!expenses_reimbursed_by_fkey(*)
`;

export type ExpenseFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  paidBy?: string;
  reimbursementStatus?: ReimbursementStatus;
  search?: string;
};

export async function fetchExpenses(filters: ExpenseFilters = {}): Promise<ExpenseWithRelations[]> {
  const supabase = await createClient();
  let query = supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("status", "confirmed")
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.from) query = query.gte("expense_date", filters.from);
  if (filters.to) query = query.lte("expense_date", filters.to);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.paidBy) query = query.eq("paid_by", filters.paidBy);
  if (filters.reimbursementStatus)
    query = query.eq("reimbursement_status", filters.reimbursementStatus);
  if (filters.search)
    query = query.or(
      `description.ilike.%${filters.search}%,establishment.ilike.%${filters.search}%`,
    );

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ExpenseWithRelations[];
}

export async function fetchExpenseById(id: string): Promise<ExpenseWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ExpenseWithRelations) ?? null;
}

export async function fetchDraftExpenses(): Promise<ExpenseWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select(EXPENSE_SELECT)
    .eq("status", "draft")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ExpenseWithRelations[];
}

export async function countDraftExpenses(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("status", "draft");
  return count ?? 0;
}

export async function fetchPendingReimbursementTotal(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("amount")
    .eq("reimbursement_status", "pending")
    .eq("status", "confirmed");
  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}
