import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { fetchExpenseById } from "@/lib/data/expenses";
import { getSignedReceiptUrl } from "@/lib/data/receipts";
import { listActiveProfiles } from "@/lib/data/profiles";
import { CategoryIcon } from "@/components/category-icon";
import { ReimbursementBadge } from "@/components/reimbursement-badge";
import { ReceiptThumbnail } from "@/components/receipt-viewer";
import { ReimbursementControl } from "../reimbursement-control";
import { DeleteExpenseButton } from "../delete-expense-button";
import { buttonVariants } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DespesaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireProfile();
  const expense = await fetchExpenseById(id);
  if (!expense) notFound();

  const [receiptUrl, profiles] = await Promise.all([
    getSignedReceiptUrl(expense.receipt_url),
    listActiveProfiles(),
  ]);

  const canEdit =
    profile.role === "admin" || (profile.role === "contributor" && expense.created_by === userId);
  const canManageReimbursement = profile.role === "admin" || profile.role === "viewer_approver";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/despesas" className="text-muted-foreground flex items-center gap-1 text-sm hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Voltar para despesas
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CategoryIcon name={expense.category?.icon} className="h-4 w-4" />
                {expense.category?.name ?? "Sem categoria"}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{expense.description}</h1>
              {expense.establishment && (
                <p className="text-muted-foreground text-sm">{expense.establishment}</p>
              )}
            </div>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(Number(expense.amount))}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReimbursementBadge status={expense.reimbursement_status} />
            <span className="text-muted-foreground text-sm">
              {format(new Date(expense.expense_date + "T00:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Pago por</dt>
              <dd className="font-medium">{expense.payer?.full_name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Cadastrado via</dt>
              <dd className="font-medium">
                {expense.source === "pasta_notinhas" ? "Pasta de notinhas (IA)" : "Manual"}
              </dd>
            </div>
            {expense.reimbursement_status === "reimbursed" && (
              <>
                <div>
                  <dt className="text-muted-foreground">Reembolsado por</dt>
                  <dd className="font-medium">{expense.reimburser?.full_name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Data do reembolso</dt>
                  <dd className="font-medium">
                    {expense.reimbursed_at
                      ? format(new Date(expense.reimbursed_at + "T00:00:00"), "dd/MM/yyyy")
                      : "—"}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {expense.notes && (
            <div>
              <p className="text-muted-foreground text-sm font-medium">Observações</p>
              <p className="text-sm">{expense.notes}</p>
            </div>
          )}

          {canManageReimbursement && (
            <ReimbursementControl
              expenseId={expense.id}
              currentStatus={expense.reimbursement_status}
              currentReimbursedBy={expense.reimbursed_by}
              profiles={profiles}
            />
          )}

          <div className="flex gap-2">
            {canEdit && (
              <Link href={`/despesas/${expense.id}/editar`} className={buttonVariants({ variant: "outline" })}>
                <Pencil className="h-4 w-4" />
                Editar
              </Link>
            )}
            {profile.role === "admin" && <DeleteExpenseButton id={expense.id} />}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Comprovante</p>
          {receiptUrl ? (
            <ReceiptThumbnail url={receiptUrl} isPdf={expense.receipt_url?.endsWith(".pdf") ?? false} />
          ) : (
            <div className="text-muted-foreground flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed text-sm">
              Sem comprovante anexado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
