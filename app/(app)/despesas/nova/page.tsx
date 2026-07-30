import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listCategories } from "@/lib/data/categories";
import { listActiveProfiles } from "@/lib/data/profiles";
import { ExpenseForm } from "../expense-form";

export default async function NovaDespesaPage() {
  const { userId, profile } = await requireProfile();

  if (profile.role !== "admin" && profile.role !== "contributor") {
    redirect("/despesas");
  }

  const [categories, profiles] = await Promise.all([listCategories(), listActiveProfiles()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova despesa</h1>
        <p className="text-muted-foreground text-sm">
          Preencha os dados e anexe o comprovante, se tiver.
        </p>
      </div>
      <ExpenseForm
        mode="create"
        categories={categories}
        profiles={profiles}
        currentUserId={userId}
      />
    </div>
  );
}
