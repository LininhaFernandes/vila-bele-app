import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodPreset = "mes" | "trimestre" | "ano" | "personalizado";

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export function resolvePeriod(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string,
): { from: string; to: string; label: string } {
  const now = new Date();

  if (preset === "trimestre") {
    return {
      from: iso(startOfQuarter(now)),
      to: iso(endOfQuarter(now)),
      label: `${format(startOfQuarter(now), "MMM", { locale: ptBR })} – ${format(endOfQuarter(now), "MMM yyyy", { locale: ptBR })}`,
    };
  }

  if (preset === "ano") {
    return {
      from: iso(startOfYear(now)),
      to: iso(endOfYear(now)),
      label: format(now, "yyyy"),
    };
  }

  if (preset === "personalizado" && customFrom && customTo) {
    return { from: customFrom, to: customTo, label: `${customFrom} a ${customTo}` };
  }

  return {
    from: iso(startOfMonth(now)),
    to: iso(endOfMonth(now)),
    label: format(now, "MMMM 'de' yyyy", { locale: ptBR }),
  };
}
