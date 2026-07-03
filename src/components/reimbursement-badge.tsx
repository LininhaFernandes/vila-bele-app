import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReimbursementStatus } from "@/types/database";

const CONFIG: Record<ReimbursementStatus, { label: string; className: string }> = {
  not_applicable: { label: "Pagamento direto", className: "bg-muted text-muted-foreground" },
  pending: { label: "Aguardando reembolso", className: "bg-accent/15 text-accent border-accent/30" },
  reimbursed: { label: "Reembolsado", className: "bg-primary/10 text-primary border-primary/30" },
};

export function ReimbursementBadge({ status }: { status: ReimbursementStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("border", className)}>
      {label}
    </Badge>
  );
}
