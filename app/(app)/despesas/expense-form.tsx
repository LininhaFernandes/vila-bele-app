"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createExpenseAction, updateExpenseAction } from "./actions";
import { uploadReceipt } from "@/lib/receipts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryIcon } from "@/components/category-icon";
import { Loader2, Camera, FileText, X } from "lucide-react";
import type { Category, Expense, Profile } from "@/types/database";

export function ExpenseForm({
  mode,
  expense,
  categories,
  profiles,
  currentUserId,
}: {
  mode: "create" | "edit";
  expense?: Expense;
  categories: Category[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [paidBy, setPaidBy] = useState(expense?.paid_by ?? currentUserId);
  const [reimbursementStatus, setReimbursementStatus] = useState(
    expense?.reimbursement_status ?? "pending",
  );
  const [categoryId, setCategoryId] = useState(expense?.category_id ?? "");
  const [receiptType, setReceiptType] = useState(expense?.receipt_type ?? "cupom_fiscal");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      let receiptPath: string | null = null;

      if (file) {
        setUploading(true);
        try {
          receiptPath = await uploadReceipt(file, currentUserId);
        } catch {
          toast.error("Não consegui enviar o comprovante. Tente novamente.");
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const result =
        mode === "create"
          ? await createExpenseAction(formData, receiptPath)
          : await updateExpenseAction(expense!.id, formData, receiptPath);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  const busy = pending || uploading;

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-5 pb-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="expense_date">Data</Label>
          <Input
            id="expense_date"
            name="expense_date"
            type="date"
            required
            defaultValue={expense?.expense_date ?? new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            placeholder="0,00"
            defaultValue={expense?.amount ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          required
          placeholder="Ex: Compra de material elétrico"
          defaultValue={expense?.description ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="establishment">Estabelecimento (opcional)</Label>
        <Input
          id="establishment"
          name="establishment"
          placeholder="Ex: Loja do Zé"
          defaultValue={expense?.establishment ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categoria</Label>
        <input type="hidden" name="category_id" value={categoryId} />
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")} required>
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

      <div className="flex flex-col gap-2">
        <Label>Quem pagou</Label>
        <input type="hidden" name="paid_by" value={paidBy} />
        <Select value={paidBy} onValueChange={(v) => setPaidBy(v ?? "")} required>
          <SelectTrigger>
            <SelectValue placeholder="Quem pagou essa despesa?" />
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

      <div className="flex flex-col gap-2">
        <Label>Situação de reembolso</Label>
        <input type="hidden" name="reimbursement_status" value={reimbursementStatus} />
        <Select
          value={reimbursementStatus}
          onValueChange={(v) => setReimbursementStatus(v as typeof reimbursementStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_applicable">Não se aplica (pagamento direto)</SelectItem>
            <SelectItem value="pending">Aguardando reembolso</SelectItem>
            <SelectItem value="reimbursed">Já reembolsado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Comprovante</Label>
        <input type="hidden" name="receipt_type" value={receiptType} />
        {expense?.receipt_url && !file && (
          <p className="text-muted-foreground text-xs">
            Já existe um comprovante anexado. Envie um novo arquivo para substituí-lo.
          </p>
        )}

        {file ? (
          <div className="flex items-center gap-3 rounded-xl border p-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Pré-visualização do comprovante" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <FileText className="text-muted-foreground h-8 w-8" />
            )}
            <div className="flex-1 truncate text-sm">{file.name}</div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center hover:bg-secondary/40">
            <Camera className="text-muted-foreground h-6 w-6" />
            <span className="text-sm font-medium">Tirar foto ou escolher arquivo</span>
            <span className="text-muted-foreground text-xs">Foto do cupom ou PDF da nota fiscal</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}

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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={expense?.notes ?? ""} />
      </div>

      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "create" ? "Salvar despesa" : "Salvar alterações"}
      </Button>
    </form>
  );
}
