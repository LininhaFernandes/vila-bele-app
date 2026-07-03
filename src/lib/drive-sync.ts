import { createClient } from "@/lib/supabase/server";
import { listReceiptFiles, downloadFile, renameFile } from "@/lib/google-drive";
import { extractReceiptData } from "@/lib/receipt-ai";
import { listCategories } from "@/lib/data/categories";

function sanitizeForFilename(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "despesa";
}

function extensionFor(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "jpg";
}

export type SyncSummary = { created: number; failed: number; skipped: number };

export async function syncDriveReceipts(triggeredByUserId: string): Promise<SyncSummary> {
  const supabase = await createClient();
  const summary: SyncSummary = { created: 0, failed: 0, skipped: 0 };

  const [files, categories] = await Promise.all([listReceiptFiles(), listCategories()]);
  if (files.length === 0) return summary;

  const { data: alreadyProcessed } = await supabase
    .from("processed_drive_files")
    .select("drive_file_id")
    .in(
      "drive_file_id",
      files.map((f) => f.id),
    );
  const processedIds = new Set((alreadyProcessed ?? []).map((r) => r.drive_file_id));
  const newFiles = files.filter((f) => !processedIds.has(f.id));

  const outrosCategory = categories.find((c) => c.name.toLowerCase() === "outros") ?? categories[0];

  for (const file of newFiles) {
    try {
      const buffer = await downloadFile(file.id);
      const extracted = await extractReceiptData(buffer, file.mimeType, categories);

      const matchedCategory =
        categories.find((c) => c.name.toLowerCase() === extracted.category_guess.toLowerCase()) ??
        outrosCategory;

      const ext = extensionFor(file.mimeType);
      const storagePath = `${triggeredByUserId}/drive-${file.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(storagePath, buffer, {
          contentType: file.mimeType,
          upsert: true,
        });
      if (uploadError) throw new Error(`Upload do comprovante falhou: ${uploadError.message}`);

      const { data: expense, error: insertError } = await supabase
        .from("expenses")
        .insert({
          expense_date: extracted.date,
          description: extracted.establishment || "Despesa (revisar)",
          establishment: extracted.establishment || null,
          category_id: matchedCategory?.id ?? null,
          amount: extracted.amount,
          paid_by: triggeredByUserId,
          reimbursement_status: "not_applicable",
          receipt_url: storagePath,
          receipt_type: extracted.receipt_type,
          source: "pasta_notinhas",
          status: "draft",
          ai_suggested: extracted,
          notes:
            extracted.confidence !== "alta"
              ? "A IA teve baixa/média confiança nesta leitura — confira os dados com atenção."
              : null,
          created_by: triggeredByUserId,
        })
        .select("id")
        .single();
      if (insertError) throw new Error(`Não consegui criar a despesa: ${insertError.message}`);

      const newName = `${extracted.date}_${sanitizeForFilename(extracted.establishment)}_R$${extracted.amount.toFixed(2)}.${ext}`;
      await renameFile(file.id, newName).catch(() => {
        // renomear é só cosmético; não falha a sincronização se der erro
      });

      await supabase.from("processed_drive_files").insert({
        drive_file_id: file.id,
        file_name: file.name,
        status: "processed",
        expense_id: expense.id,
      });
      summary.created += 1;
    } catch (error) {
      await supabase.from("processed_drive_files").insert({
        drive_file_id: file.id,
        file_name: file.name,
        status: "failed",
        error_message: error instanceof Error ? error.message : String(error),
      });
      summary.failed += 1;
    }
  }

  return summary;
}
