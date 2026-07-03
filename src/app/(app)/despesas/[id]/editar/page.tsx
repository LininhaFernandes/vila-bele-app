import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { fetchExpenseById } from "@/lib/data/expenses";
import { listCategories } from "@/lib/data/categories";
import { listActiveProfiles } from "@/lib/data/profiles";
import { ExpenseForm } from "../../expense-form";

export default async function EditarDespesaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId, profile } = await requireProfile();
  const expense = await fetchExpenseById(id);

  if (!expense) notFound();

  const canEdit =
    profile.role === "admin" || (profile.role === "contributor" && expense.created_by === userId);
  if (!canEdit) redirect(`/despesas/${id}`);

  const [categories, profiles] = await Promise.all([listCategories(), listActiveProfiles()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar despesa</h1>
      </div>
      <ExpenseForm
        mode="edit"
        expense={expense}
        categories={categories}
        profiles={profiles}
        currentUserId={userId}
      />
    </div>
  );
}
