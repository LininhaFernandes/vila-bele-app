import { z } from "zod";

export const expenseFormSchema = z.object({
  expense_date: z.string().min(1, "Informe a data"),
  description: z.string().min(2, "Descreva a despesa"),
  establishment: z.string().optional(),
  category_id: z.string().min(1, "Escolha uma categoria"),
  amount: z.coerce.number().positive("O valor precisa ser maior que zero"),
  paid_by: z.string().min(1, "Escolha quem pagou"),
  reimbursement_status: z.enum(["not_applicable", "pending", "reimbursed"]),
  receipt_type: z.enum(["cupom_fiscal", "nota_fiscal", "none"]),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
