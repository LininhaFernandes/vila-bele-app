"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Users, LayoutDashboard, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface User {
  id: number;
  email: string;
  full_name: string;
  role: "admin" | "user";
  created_at: string;
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/auth/profile");

        if (!response.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }

    localStorage.removeItem("token");
    toast.success("Logout realizado com sucesso");
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/painel">
            <Button>Voltar para o Painel</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/painel" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              VB
            </div>
            <span className="hidden font-semibold sm:inline">Vila Bele</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/painel"
              className={`text-sm font-medium transition-colors ${
                pathname === "/painel"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Painel
            </Link>
            <Link
              href="/perfil"
              className={`text-sm font-medium transition-colors ${
                pathname === "/perfil"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Perfil
            </Link>
            {isAdmin && (
              <Link
                href="/admin/usuarios"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="border-t bg-muted/50 p-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                href="/painel"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="h-4 w-4" />
                Painel
              </Link>
              <Link
                href="/perfil"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Perfil
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/usuarios"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <Users className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted text-sm font-medium w-full text-left text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
