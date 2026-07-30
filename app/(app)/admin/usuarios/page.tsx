"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");

  // Reset password states
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar usuários");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao criar usuário");
        return;
      }

      toast.success("Usuário criado com sucesso!");
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("user");
      await fetchUsers();
    } catch (error) {
      toast.error("Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(userId: number) {
    if (!resetPassword || !confirmResetPassword) {
      toast.error("Preencha a nova senha");
      return;
    }

    if (resetPassword !== confirmResetPassword) {
      toast.error("Senhas não conferem");
      return;
    }

    if (resetPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setResetting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: resetPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao resetar senha");
        return;
      }

      toast.success("Senha resetada com sucesso!");
      setSelectedUserId(null);
      setResetPassword("");
      setConfirmResetPassword("");
    } catch (error) {
      toast.error("Erro ao resetar senha");
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 sm:pb-4">
      <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>

      {/* Criar novo usuário */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Criar Novo Usuário</h2>
        <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={creating}
              required
            />
          </div>
          <div>
            <Label htmlFor="full-name">Nome Completo</Label>
            <Input
              id="full-name"
              type="text"
              placeholder="João Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={creating}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={creating}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Função</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={creating}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={creating}
            className="md:col-span-2 gap-2"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar Usuário"
            )}
          </Button>
        </form>
      </Card>

      {/* Lista de usuários */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Usuários Cadastrados</h2>

          {users.length === 0 ? (
            <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Admin" : "Usuário"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUserId(user.id)}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Resetar Senha
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de resetar senha */}
      <Dialog open={selectedUserId !== null} onOpenChange={(open) => {
        if (!open) setSelectedUserId(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              Digite a nova senha para {users.find((u) => u.id === selectedUserId)?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reset-password">Nova Senha</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Nova senha"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                disabled={resetting}
              />
            </div>
            <div>
              <Label htmlFor="confirm-reset-password">Confirmar Senha</Label>
              <Input
                id="confirm-reset-password"
                type="password"
                placeholder="Confirme a senha"
                value={confirmResetPassword}
                onChange={(e) => setConfirmResetPassword(e.target.value)}
                disabled={resetting}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedUserId(null)}
              disabled={resetting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => selectedUserId && handleResetPassword(selectedUserId)}
              disabled={resetting}
              className="gap-2"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Resetar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
