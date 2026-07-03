import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { fetchExpenses } from "@/lib/data/expenses";
import type { ReimbursementStatus } from "@/types/database";

const REIMBURSEMENT_LABEL: Record<ReimbursementStatus, string> = {
  not_applicable: "Pagamento direto",
  pending: "Aguardando reembolso",
  reimbursed: "Reembolsado",
};

function csvEscape(value: string) {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(request: Request) {
  await requireProfile();

  const { searchParams } = new URL(request.url);
  const expenses = await fetchExpenses({
    from: searchParams.get("de") ?? undefined,
    to: searchParams.get("ate") ?? undefined,
    categoryId: searchParams.get("categoria") ?? undefined,
    paidBy: searchParams.get("pagador") ?? undefined,
    reimbursementStatus: (searchParams.get("status") as ReimbursementStatus) ?? undefined,
    search: searchParams.get("busca") ?? undefined,
  });

  const header = [
    "Data",
    "Descrição",
    "Estabelecimento",
    "Categoria",
    "Valor",
    "Pago por",
    "Status de reembolso",
    "Reembolsado por",
    "Data do reembolso",
    "Observações",
  ];

  const rows = expenses.map((e) =>
    [
      e.expense_date,
      e.description,
      e.establishment ?? "",
      e.category?.name ?? "",
      Number(e.amount).toFixed(2).replace(".", ","),
      e.payer?.full_name ?? "",
      REIMBURSEMENT_LABEL[e.reimbursement_status],
      e.reimburser?.full_name ?? "",
      e.reimbursed_at ?? "",
      e.notes ?? "",
    ]
      .map((v) => csvEscape(String(v)))
      .join(";"),
  );

  const csv = "﻿" + [header.join(";"), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="despesas-vila-bele.csv"`,
    },
  });
}
