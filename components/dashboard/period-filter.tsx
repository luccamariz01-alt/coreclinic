"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { DashboardPeriod } from "@/lib/supabase/data";

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "custom", label: "Personalizado" }
];

type PeriodFilterProps = {
  period: DashboardPeriod;
  startDate?: string;
  endDate?: string;
};

export function PeriodFilter({ period, startDate, endDate }: PeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [customStart, setCustomStart] = useState(startDate ?? "");
  const [customEnd, setCustomEnd] = useState(endDate ?? "");

  const isCustom = period === "custom";
  const isCustomRangeValid = useMemo(() => {
    if (!customStart || !customEnd) return false;
    return new Date(customEnd) >= new Date(customStart);
  }, [customEnd, customStart]);

  function updateUrl(nextPeriod: DashboardPeriod, nextStart?: string, nextEnd?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", nextPeriod);

    if (nextPeriod === "custom" && nextStart && nextEnd) {
      params.set("start", nextStart);
      params.set("end", nextEnd);
    } else {
      params.delete("start");
      params.delete("end");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="rounded-[1.25rem] border border-border bg-white/[0.74] p-3 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        {PERIOD_OPTIONS.map((option) => {
          const isActive = option.value === period;
          return (
            <button
              key={option.value}
              type="button"
              disabled={isPending}
              onClick={() => updateUrl(option.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                isActive
                  ? "bg-brand text-white shadow-soft"
                  : "bg-white/70 text-muted-foreground hover:bg-white hover:text-foreground"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {isCustom ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-xs text-muted-foreground">
            <span>Inicio</span>
            <input
              type="date"
              value={customStart}
              onChange={(event) => setCustomStart(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </label>
          <label className="flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2 text-xs text-muted-foreground">
            <span>Fim</span>
            <input
              type="date"
              value={customEnd}
              onChange={(event) => setCustomEnd(event.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </label>
          <button
            type="button"
            disabled={isPending || !isCustomRangeValid}
            onClick={() => updateUrl("custom", customStart, customEnd)}
            className="rounded-full border border-brand/20 bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Aplicar
          </button>
        </div>
      ) : null}
    </div>
  );
}
