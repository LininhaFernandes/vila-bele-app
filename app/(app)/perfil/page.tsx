"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
}

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("As senhas não conferem");
      setSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao alterar senha");
        setSubmitting(false);
        return;
      }

      toast.success("Senha alterada com sucesso!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seu Perfil</h1>
        <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* User Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                value={user.full_name}
                disabled
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Função</Label>
              <Input
                id="role"
                type="text"
                value={user.role === "admin" ? "Administrador" : "Usuário"}
                disabled
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="created">Membro desde</Label>
              <Input
                id="created"
                type="text"
                value={new Date(user.created_at).toLocaleDateString("pt-BR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                disabled
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Digite sua senha atual"
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentPassword: e.target.value,
                  })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
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
                placeholder="Confirme sua nova senha"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className="mt-2"
              />
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </form>
        </Card>

        {/* Security Info */}
        <Card className="p-6 bg-muted/30">
          <h3 className="font-semibold mb-2">Dicas de Segurança</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use uma senha forte com pelo menos 6 caracteres</li>
            <li>• Não compartilhe sua senha com outras pessoas</li>
            <li>• Altere sua senha regularmente</li>
            <li>• Se suspeitar de acesso não autorizado, mude sua senha imediatamente</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
