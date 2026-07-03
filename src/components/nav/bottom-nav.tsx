"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { visibleNavItems } from "./nav-items";
import type { Profile } from "@/types/database";

export function BottomNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const items = visibleNavItems(profile.role).filter((i) => i.href !== "/despesas/nova");
  const canCreate = profile.role === "admin" || profile.role === "contributor";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="relative mx-auto flex h-16 max-w-5xl items-center justify-around px-2">
        {items.slice(0, 2).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/painel" && pathname.startsWith(item.href));
          return <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={active} />;
        })}

        {canCreate && (
          <Link
            href="/despesas/nova"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            aria-label="Nova despesa"
          >
            <span className="text-2xl leading-none">+</span>
          </Link>
        )}

        {items.slice(2).map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/painel" && pathname.startsWith(item.href));
          return <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={active} />;
        })}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
