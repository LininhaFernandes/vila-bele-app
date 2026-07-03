"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { PeriodPreset } from "@/lib/period";

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "mes", label: "Este mês" },
  { value: "trimestre", label: "Este trimestre" },
  { value: "ano", label: "Este ano" },
  { value: "personalizado", label: "Período personalizado" },
];

export function PeriodSelector({ preset }: { preset: PeriodPreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPreset(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", value ?? "mes");
    router.push(`${pathname}?${params.toString()}`);
  }

  function setCustomDate(key: "de" | "ate", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", "personalizado");
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={preset} onValueChange={setPreset}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {preset === "personalizado" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            defaultValue={searchParams.get("de") ?? ""}
            onChange={(e) => setCustomDate("de", e.target.value)}
          />
          <span className="text-muted-foreground text-sm">até</span>
          <Input
            type="date"
            defaultValue={searchParams.get("ate") ?? ""}
            onChange={(e) => setCustomDate("ate", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
