import { requireProfile } from "@/lib/auth";
import { fetchExpenses } from "@/lib/data/expenses";
import { listActiveProfiles } from "@/lib/data/profiles";
import { listBatches } from "@/lib/data/batches";
import { PendingSelector } from "./pending-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ReembolsosPage() {
  const { profile } = await requireProfile();
  const canManage = profile.role === "admin" || profile.role === "viewer_approver";

  const [pending, profiles, batches] = await Promise.all([
    fetchExpenses({ reimbursementStatus: "pending" }),
    listActiveProfiles(),
    listBatches(),
  ]);

  const pendingTotal = pending.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reembolsos</h1>
        <p className="text-muted-foreground text-sm">
          {pending.length} despesa(s) aguardando reembolso · {formatCurrency(pendingTotal)}
        </p>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Aguardando</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-4">
          {canManage ? (
            <PendingSelector expenses={pending} profiles={profiles} />
          ) : (
            <div className="flex flex-col gap-2">
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma despesa pendente.</p>
              ) : (
                pending.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-xl border bg-card p-3">
                    <div>
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-muted-foreground text-xs">{e.payer?.full_name}</p>
                    </div>
                    <p className="font-medium tabular-nums">{formatCurrency(Number(e.amount))}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          {batches.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum reembolso registrado ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {batches.map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-xl border bg-card p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {b.paid_by_profile?.full_name ?? "—"} · {b.expense_count} despesa(s)
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(b.paid_at + "T00:00:00"), "dd/MM/yyyy")}
                      {b.notes && ` · ${b.notes}`}
                    </p>
                  </div>
                  <p className="font-medium tabular-nums">{formatCurrency(Number(b.total_amount))}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
