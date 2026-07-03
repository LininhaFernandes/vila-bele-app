import Link from "next/link";
import { format } from "date-fns";
import { CategoryIcon } from "@/components/category-icon";
import { ReimbursementBadge } from "@/components/reimbursement-badge";
import { FileText } from "lucide-react";
import type { ExpenseWithRelations } from "@/types/database";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ExpenseListItem({
  expense,
  thumbnailUrl,
}: {
  expense: ExpenseWithRelations;
  thumbnailUrl?: string | null;
}) {
  const isPdf = expense.receipt_url?.endsWith(".pdf");

  return (
    <Link
      href={`/despesas/${expense.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/40 hover:bg-secondary/30"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
        {thumbnailUrl && !isPdf ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : thumbnailUrl && isPdf ? (
          <FileText className="text-secondary-foreground h-5 w-5" />
        ) : (
          <CategoryIcon name={expense.category?.icon} className="text-secondary-foreground h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{expense.description}</p>
        <p className="text-muted-foreground truncate text-xs">
          {format(new Date(expense.expense_date + "T00:00:00"), "dd/MM/yyyy")} ·{" "}
          {expense.category?.name ?? "Sem categoria"} · {expense.payer?.full_name ?? "—"}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <p className="font-semibold tabular-nums">{formatCurrency(Number(expense.amount))}</p>
        <ReimbursementBadge status={expense.reimbursement_status} />
      </div>
    </Link>
  );
}
