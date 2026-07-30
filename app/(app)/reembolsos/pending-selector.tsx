"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { createBatchAction } from "./actions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, HandCoins } from "lucide-react";
import type { ExpenseWithRelations, Profile } from "@/types/database";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PendingSelector({
  expenses,
  profiles,
}: {
  expenses: ExpenseWithRelations[];
  profiles: Profile[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [paidBy, setPaidBy] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const selectedExpenses = useMemo(
    () => expenses.filter((e) => selected.has(e.id)),
    [expenses, selected],
  );
  const selectedTotal = selectedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    startTransition(async () => {
      const result = await createBatchAction([...selected], paidBy, paidAt, notes);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Reembolso registrado!");
      setSelected(new Set());
      setNotes("");
      setOpen(false);
    });
  }

  if (expenses.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        Nenhuma despesa aguardando reembolso no momento.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {expenses.map((e) => (
          <label
            key={e.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 hover:bg-secondary/30"
          >
            <input
              type="checkbox"
              checked={selected.has(e.id)}
              onChange={() => toggle(e.id)}
              className="h-4 w-4 accent-primary"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{e.description}</p>
              <p className="text-muted-foreground text-xs">
                {e.payer?.full_name} · {e.expense_date}
              </p>
            </div>
            <p className="font-medium tabular-nums">{formatCurrency(Number(e.amount))}</p>
          </label>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-20 flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-lg md:bottom-4">
          <div>
            <p className="text-sm font-medium">{selected.size} selecionada(s)</p>
            <p className="text-muted-foreground text-xs">{formatCurrency(selectedTotal)}</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <HandCoins className="h-4 w-4" />
            Registrar reembolso
          </Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar reembolso</DialogTitle>
            <DialogDescription>
              {selected.size} despesa(s) · Total {formatCurrency(selectedTotal)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Quem pagou o reembolso</Label>
              <Select value={paidBy} onValueChange={(v) => setPaidBy(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha quem reembolsou" />
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
              <Label>Data do pagamento</Label>
              <Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Observações (opcional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={pending || !paidBy} className="w-full">
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar reembolso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
