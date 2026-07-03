"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Category, Profile } from "@/types/database";

const ALL = "__all__";

export function FiltersBar({
  categories,
  profiles,
}: {
  categories: Category[];
  profiles: Profile[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === ALL) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Buscar por descrição ou estabelecimento"
          defaultValue={searchParams.get("busca") ?? ""}
          className="pl-9"
          onChange={(e) => setParam("busca", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select defaultValue={searchParams.get("categoria") ?? ALL} onValueChange={(v) => setParam("categoria", v ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get("pagador") ?? ALL} onValueChange={(v) => setParam("pagador", v ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Quem pagou" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={searchParams.get("status") ?? ALL} onValueChange={(v) => setParam("status", v ?? ALL)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Reembolso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Qualquer status</SelectItem>
            <SelectItem value="pending">Aguardando reembolso</SelectItem>
            <SelectItem value="reimbursed">Reembolsado</SelectItem>
            <SelectItem value="not_applicable">Pagamento direto</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Input
            type="date"
            aria-label="De"
            defaultValue={searchParams.get("de") ?? ""}
            onChange={(e) => setParam("de", e.target.value)}
          />
          <Input
            type="date"
            aria-label="Até"
            defaultValue={searchParams.get("ate") ?? ""}
            onChange={(e) => setParam("ate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
