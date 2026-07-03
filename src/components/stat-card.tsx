import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "accent" | "primary";
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border bg-card p-4">
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </div>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "accent" && "bg-accent/15 text-accent",
          tone === "primary" && "bg-primary/10 text-primary",
          tone === "default" && "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
