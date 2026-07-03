import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { requireProfile } from "@/lib/auth";
import {
  fetchExpenses,
  fetchPendingReimbursementTotal,
  countDraftExpenses,
} from "@/lib/data/expenses";
import { getSignedReceiptUrls } from "@/lib/data/receipts";
import { resolvePeriod, type PeriodPreset } from "@/lib/period";
import { StatCard } from "@/components/stat-card";
import { ExpenseListItem } from "@/components/expense-list-item";
import { PeriodSelector } from "./period-selector";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { Wallet, Receipt, HandCoins, ArrowRight, Sparkles } from "lucide-react";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  // Temporariamente desabilitado para debug
  // const { profile } = await requireProfile();
  const profile = {
    id: "temp",
    full_name: "Usuário Teste",
    role: "admin",
  } as any;

  const preset = (sp.periodo as PeriodPreset) ?? "mes";
  const period = resolvePeriod(preset, sp.de, sp.ate);

  // Dados fake para teste
  const expenses: any[] = [];
  const pendingTotal = 0;
  const draftCount = 0;

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    const key = e.category?.name ?? "Outros";
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(e.amount));
  }
  const categoryData = [...byCategory.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const byMonth = new Map<string, number>();
  for (const e of expenses) {
    const key = e.expense_date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(e.amount));
  }
  const monthlyData = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      month: format(new Date(key + "-02"), "MMM/yy", { locale: ptBR }),
      total: value,
    }));

  const recent = expenses.slice(0, 6);
  const receiptPaths = recent.map((e) => e.receipt_url).filter((p): p is string => !!p);
  const thumbnails = await getSignedReceiptUrls(receiptPaths);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Olá, {profile.full_name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm capitalize">{period.label}</p>
        </div>
        <PeriodSelector preset={preset} />
      </div>

      {draftCount > 0 && (
        <Link
          href="/revisao"
          className="flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 transition hover:bg-accent/15"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <p className="text-sm font-medium">
              {draftCount} notinha{draftCount !== 1 && "s"} lida{draftCount !== 1 && "s"} pela IA
              aguardando revisão
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-accent" />
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total no período" value={formatCurrency(total)} icon={Wallet} tone="primary" />
        <StatCard
          label="Lançamentos no período"
          value={String(expenses.length)}
          icon={Receipt}
        />
        <StatCard
          label="Pendente de reembolso"
          value={formatCurrency(pendingTotal)}
          icon={HandCoins}
          tone="accent"
          hint="Total que ainda precisa ser devolvido"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-2 font-medium">Por categoria</p>
          <CategoryPieChart data={categoryData} />
          <div className="mt-2 flex flex-col gap-1.5">
            {categoryData.slice(0, 5).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{c.name}</span>
                <span className="font-medium tabular-nums">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <p className="mb-2 font-medium">Evolução mensal</p>
          <MonthlyBarChart data={monthlyData} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="font-medium">Lançamentos recentes</p>
          <Link href="/despesas" className="text-primary flex items-center gap-1 text-sm font-medium">
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            Nenhuma despesa neste período ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((expense) => (
              <ExpenseListItem
                key={expense.id}
                expense={expense}
                thumbnailUrl={expense.receipt_url ? thumbnails[expense.receipt_url] : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
