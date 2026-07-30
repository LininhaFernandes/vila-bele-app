import { requireProfile, requireAdmin } from "@/lib/auth";
import { fetchDraftExpenses } from "@/lib/data/expenses";
import { listCategories } from "@/lib/data/categories";
import { listActiveProfiles } from "@/lib/data/profiles";
import { getSignedReceiptUrls } from "@/lib/data/receipts";
import { SyncButton } from "./sync-button";
import { DraftReviewCard } from "./draft-review-card";

export default async function RevisaoPage() {
  const { profile } = await requireProfile();
  requireAdmin(profile);

  const [drafts, categories, profiles] = await Promise.all([
    fetchDraftExpenses(),
    listCategories(),
    listActiveProfiles(),
  ]);

  const receiptPaths = drafts.map((d) => d.receipt_url).filter((p): p is string => !!p);
  const thumbnails = await getSignedReceiptUrls(receiptPaths);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Revisão de notinhas</h1>
          <p className="text-muted-foreground text-sm">
            Notinhas lidas automaticamente da pasta do Drive, aguardando sua confirmação.
          </p>
        </div>
        <SyncButton />
      </div>

      {drafts.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          Nenhuma notinha aguardando revisão. Clique em &quot;Sincronizar agora&quot; para checar a
          pasta do Drive.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {drafts.map((expense) => (
            <DraftReviewCard
              key={expense.id}
              expense={expense}
              receiptUrl={expense.receipt_url ? thumbnails[expense.receipt_url] : null}
              categories={categories}
              profiles={profiles}
            />
          ))}
        </div>
      )}
    </div>
  );
}
