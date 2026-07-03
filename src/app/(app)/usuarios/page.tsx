import { requireProfile, requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listAllCategories } from "@/lib/data/categories";
import { NewUserDialog } from "./new-user-dialog";
import { UsersTable } from "./users-table";
import { CategoriesTab } from "./categories-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function UsuariosPage() {
  const { profile, userId } = await requireProfile();
  requireAdmin(profile);

  const supabase = await createClient();
  const [{ data: profiles }, categories] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    listAllCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Quem tem acesso ao sistema e as categorias de despesa.
        </p>
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <NewUserDialog />
          </div>
          <UsersTable profiles={profiles ?? []} currentUserId={userId} />
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <CategoriesTab categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
