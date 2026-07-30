import { Suspense } from "react";
import { fetchExpenses } from "@/lib/data/expenses";
import { listCategories } from "@/lib/data/categories";
import { listActiveProfiles } from "@/lib/data/profiles";
import { getSignedReceiptUrls } from "@/lib/data/receipts";
import { FiltersBar } from "./filters-bar";
import { ExpenseListItem } from "@/components/expense-list-item";
import { buttonVariants } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ReimbursementStatus } from "@/types/database";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DespesasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const [expenses, categories, profiles] = await Promise.all([
    fetchExpenses({
      from: sp.de,
      to: sp.ate,
      categoryId: sp.categoria,
      paidBy: sp.pagador,
      reimbursementStatus: sp.status as ReimbursementStatus | undefined,
      search: sp.busca,
    }),
    listCategories(),
    listActiveProfiles(),
  ]);

  const receiptPaths = expenses.map((e) => e.receipt_url).filter((p): p is string => !!p);
  const thumbnails = await getSignedReceiptUrls(receiptPaths);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const exportQuery = new URLSearchParams(
    Object.entries(sp).filter((entry): entry is [string, string] => !!entry[1]),
  ).toString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground text-sm">
            {expenses.length} lançamento{expenses.length !== 1 && "s"} · {formatCurrency(total)}
          </p>
        </div>
        <a href={`/api/despesas/export?${exportQuery}`} className={buttonVariants({ variant: "outline" })}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </a>
      </div>

      <Suspense>
        <FiltersBar categories={categories} profiles={profiles} />
      </Suspense>

      <div className="flex flex-col gap-2">
        {expenses.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
            Nenhuma despesa encontrada com esses filtros.
          </div>
        ) : (
          expenses.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              thumbnailUrl={expense.receipt_url ? thumbnails[expense.receipt_url] : null}
            />
          ))
        )}
      </div>
    </div>
  );
}
