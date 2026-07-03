"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function MonthlyBarChart({ data }: { data: { month: string; total: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
        Sem despesas neste período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <YAxis hide />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          cursor={{ fill: "var(--secondary)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            fontSize: 13,
          }}
        />
        <Bar dataKey="total" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
