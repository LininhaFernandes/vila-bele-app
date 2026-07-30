"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar perfil");
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      toast.error("Erro ao carregar perfil");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Senhas não conferem");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setChanging(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao alterar senha");
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Erro ao alterar senha");
    } finally {
      setChanging(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-4 text-center">Usuário não encontrado</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 sm:pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil</h1>
      </div>

      {/* Informações do Usuário */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Informações</h2>
        <div className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Nome Completo</Label>
            <p className="mt-1">{user.full_name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">E-mail</Label>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Função</Label>
            <p className="mt-1 capitalize">
              {user.role === "admin" ? "Administrador" : "Usuário"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Data de Cadastro</Label>
            <p className="mt-1">
              {new Date(user.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </Card>

      {/* Alterar Senha */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Alterar Senha</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Sua senha atual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={changing}
            />
          </div>
          <div>
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={changing}
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirme sua nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={changing}
            />
          </div>
          <Button type="submit" disabled={changing} className="w-full gap-2">
            {changing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Alterar Senha"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
