"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { confirmDraftAction, discardDraftAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/category-icon";
import { ReceiptThumbnail } from "@/components/receipt-viewer";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Loader2, Sparkles } from "lucide-react";
import type { Category, ExpenseWithRelations, Profile } from "@/types/database";

export function DraftReviewCard({
  expense,
  receiptUrl,
  categories,
  profiles,
}: {
  expense: ExpenseWithRelations;
  receiptUrl: string | null;
  categories: Category[];
  profiles: Profile[];
}) {
  const [pending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(expense.category_id ?? "");
  const [paidBy, setPaidBy] = useState(expense.paid_by);
  const [reimbursementStatus, setReimbursementStatus] = useState(expense.reimbursement_status);
  const [receiptType, setReceiptType] = useState(expense.receipt_type);

  function confirm(formData: FormData) {
    formData.set("category_id", categoryId);
    formData.set("paid_by", paidBy);
    formData.set("reimbursement_status", reimbursementStatus);
    formData.set("receipt_type", receiptType);
    startTransition(async () => {
      const result = await confirmDraftAction(expense.id, formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Despesa confirmada!");
    });
  }

  function discard() {
    startTransition(async () => {
      const result = await discardDraftAction(expense.id);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Rascunho descartado.");
    });
  }

  return (
    <div className="grid gap-4 rounded-2xl border bg-card p-4 md:grid-cols-2">
      <div>
        {receiptUrl ? (
          <ReceiptThumbnail url={receiptUrl} isPdf={expense.receipt_url?.endsWith(".pdf") ?? false} />
        ) : (
          <div className="text-muted-foreground flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed text-sm">
            Sem comprovante
          </div>
        )}
        <Badge variant="outline" className="mt-2 gap-1">
          <Sparkles className="h-3 w-3" />
          Lido automaticamente pela IA
        </Badge>
      </div>

      <form action={confirm} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Data</Label>
            <Input type="date" name="expense_date" defaultValue={expense.expense_date} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              name="amount"
              defaultValue={expense.amount}
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Estabelecimento / descrição</Label>
          <Input name="description" defaultValue={expense.description} required />
          <input type="hidden" name="establishment" value={expense.establishment ?? ""} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Categoria</Label>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <CategoryIcon name={c.icon} className="h-4 w-4" />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Quem pagou</Label>
            <Select value={paidBy} onValueChange={(v) => setPaidBy(v ?? paidBy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Reembolso</Label>
            <Select
              value={reimbursementStatus}
              onValueChange={(v) => setReimbursementStatus(v as typeof reimbursementStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_applicable">Não se aplica</SelectItem>
                <SelectItem value="pending">Aguardando reembolso</SelectItem>
                <SelectItem value="reimbursed">Já reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Select value={receiptType} onValueChange={(v) => setReceiptType(v as typeof receiptType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cupom_fiscal">Cupom fiscal</SelectItem>
            <SelectItem value="nota_fiscal">Nota fiscal</SelectItem>
            <SelectItem value="none">Sem comprovante</SelectItem>
          </SelectContent>
        </Select>

        {expense.notes && <p className="text-muted-foreground text-xs">{expense.notes}</p>}

        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Confirmar
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={discard}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
