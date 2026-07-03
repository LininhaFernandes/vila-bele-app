"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markReimbursementAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Profile, ReimbursementStatus } from "@/types/database";

const STATUS_LABEL: Record<ReimbursementStatus, string> = {
  not_applicable: "Não se aplica",
  pending: "Aguardando reembolso",
  reimbursed: "Reembolsado",
};

export function ReimbursementControl({
  expenseId,
  currentStatus,
  currentReimbursedBy,
  profiles,
}: {
  expenseId: string;
  currentStatus: ReimbursementStatus;
  currentReimbursedBy: string | null;
  profiles: Profile[];
}) {
  const [status, setStatus] = useState(currentStatus);
  const [reimbursedBy, setReimbursedBy] = useState(currentReimbursedBy ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await markReimbursementAction(
        expenseId,
        status,
        status === "reimbursed" ? reimbursedBy || undefined : undefined,
      );
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Status de reembolso atualizado.");
    });
  }

  const changed =
    status !== currentStatus || (status === "reimbursed" && reimbursedBy !== (currentReimbursedBy ?? ""));

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <p className="text-sm font-medium">Reembolso</p>
      <Select value={status} onValueChange={(v) => setStatus(v as ReimbursementStatus)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABEL) as ReimbursementStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {status === "reimbursed" && (
        <Select value={reimbursedBy} onValueChange={(v) => setReimbursedBy(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Quem reembolsou?" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {changed && (
        <Button onClick={save} disabled={pending} size="sm">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      )}
    </div>
  );
}
