import { createClient } from "@/lib/supabase/server";
import type { ReimbursementBatch, Profile } from "@/types/database";

export type BatchWithRelations = ReimbursementBatch & {
  paid_by_profile: Profile | null;
  expense_count: number;
};

export async function listBatches(): Promise<BatchWithRelations[]> {
  const supabase = await createClient();
  const { data: rawBatches } = await supabase
    .from("reimbursement_batches")
    .select("*, paid_by_profile:profiles!reimbursement_batches_paid_by_fkey(*)")
    .order("paid_at", { ascending: false });

  const batches = (rawBatches ?? []) as unknown as (ReimbursementBatch & {
    paid_by_profile: Profile | null;
  })[];

  if (batches.length === 0) return [];

  const { data: counts } = await supabase
    .from("expenses")
    .select("reimbursement_batch_id")
    .in(
      "reimbursement_batch_id",
      batches.map((b) => b.id),
    );

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (!row.reimbursement_batch_id) continue;
    countMap.set(
      row.reimbursement_batch_id,
      (countMap.get(row.reimbursement_batch_id) ?? 0) + 1,
    );
  }

  return batches.map((b) => ({ ...b, expense_count: countMap.get(b.id) ?? 0 }));
}
