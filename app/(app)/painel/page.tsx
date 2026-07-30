"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Settings, FileText } from "lucide-react";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
}

export default function PainelPage() {
  const [user, setUser] = useState<User | null>(null);

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
      }
    }

    loadProfile();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {user.full_name}</h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin
            ? "Você está logado como administrador"
            : "Sistema de controle de despesas do sítio Vila Bele"}
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seu Perfil</p>
              <h3 className="mt-2 text-lg font-semibold">{user.email}</h3>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
          <Link href="/perfil">
            <Button variant="outline" className="mt-4 w-full">
              Gerenciar Perfil
            </Button>
          </Link>
        </Card>

        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Entrada</p>
              <h3 className="mt-2 text-lg font-semibold">
                {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </h3>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Membro desde {new Date(user.created_at).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </Card>

        {isAdmin && (
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administrador</p>
                <h3 className="mt-2 text-lg font-semibold">Gerenciar Usuários</h3>
              </div>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <Link href="/admin/usuarios">
              <Button variant="outline" className="mt-4 w-full">
                Ir para Admin
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Info Box */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-2">Informações do Sistema</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Seu token de autenticação expira em 7 dias</li>
          <li>• Você pode gerenciar sua senha na página de perfil</li>
          {isAdmin && <li>• Como administrador, você pode criar, listar e resetar senhas de usuários</li>}
          <li>• Clique em "Sair" no menu superior para fazer logout</li>
        </ul>
      </Card>
    </div>
  );
}
