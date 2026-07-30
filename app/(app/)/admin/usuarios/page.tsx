"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, RotateCcw } from "lucide-react";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user" as "admin" | "user",
  });

  const [resetFormData, setResetFormData] = useState({
    userId: 0,
    newPassword: "",
    confirmPassword: "",
  });

  const [showResetForm, setShowResetForm] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        toast.error("Erro ao carregar usuários");
        return;
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar usuário");
        setSubmitting(false);
        return;
      }

      toast.success("Usuário criado com sucesso!");
      setFormData({ email: "", password: "", full_name: "", role: "user" });
      await loadUsers();
    } catch (error) {
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUserForReset) return;

    if (resetFormData.newPassword !== resetFormData.confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    if (resetFormData.newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setResetting(selectedUserForReset.id);

    try {
      const response = await fetch(
        `/api/admin/users/${selectedUserForReset.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: resetFormData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao resetar senha");
        setResetting(null);
        return;
      }

      toast.success(`Senha de ${selectedUserForReset.full_name} resetada com sucesso!`);
      setShowResetForm(false);
      setResetFormData({ userId: 0, newPassword: "", confirmPassword: "" });
      setSelectedUserForReset(null);
      setResetting(null);
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      toast.error("Erro ao conectar com o servidor");
      setResetting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground text-sm">Crie e gerencie usuários do sistema</p>
      </div>

      {/* Formulário de Criação */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Criar Novo Usuário</h2>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                placeholder="João Silva"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Função</Label>
              <select
                id="role"
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mt-2"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user",
                  })
                }
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {submitting ? "Criando..." : "Criar Usuário"}
          </Button>
        </form>
      </div>

      {/* Lista de Usuários */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 font-semibold">Usuários Cadastrados</h2>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            Nenhum usuário cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">E-mail</th>
                  <th className="text-left py-3 px-4 font-semibold">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold">Função</th>
                  <th className="text-left py-3 px-4 font-semibold">Data</th>
                  <th className="text-right py-3 px-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.full_name}</td>
                    <td className="py-3 px-4">
                      <span className={`rounded px-2 py-1 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {user.role === "admin" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUserForReset(user);
                          setShowResetForm(true);
                        }}
                        disabled={resetting === user.id}
                        className="text-xs"
                      >
                        {resetting === user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RotateCcw className="h-3 w-3 mr-1" />
                        )}
                        Resetar Senha
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetForm && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg border bg-card p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              Resetar Senha - {selectedUserForReset.full_name}
            </h2>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={resetFormData.newPassword}
                  onChange={(e) =>
                    setResetFormData({
                      ...resetFormData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={resetFormData.confirmPassword}
                  onChange={(e) =>
                    setResetFormData({
                      ...resetFormData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="mt-2"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetForm(false);
                    setSelectedUserForReset(null);
                    setResetFormData({
                      userId: 0,
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={resetting === selectedUserForReset.id}>
                  {resetting === selectedUserForReset.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Resetar Senha
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
