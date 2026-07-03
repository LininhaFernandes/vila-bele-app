import { LayoutDashboard, Receipt, HandCoins, Users, PlusCircle, Sparkles } from "lucide-react";
import type { UserRole } from "@/types/database";

export const NAV_ITEMS = [
  { href: "/painel", label: "Painel", icon: LayoutDashboard, roles: null },
  { href: "/despesas", label: "Despesas", icon: Receipt, roles: null },
  { href: "/despesas/nova", label: "Nova", icon: PlusCircle, roles: ["admin", "contributor"] as UserRole[] },
  { href: "/reembolsos", label: "Reembolsos", icon: HandCoins, roles: null },
  { href: "/revisao", label: "Revisão", icon: Sparkles, roles: ["admin"] as UserRole[] },
  { href: "/usuarios", label: "Usuários", icon: Users, roles: ["admin"] as UserRole[] },
] as const;

export function visibleNavItems(role: UserRole) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
