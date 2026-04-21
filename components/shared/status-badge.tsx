import type { TrendDirection, AppointmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";

const statusMap: Record<
  AppointmentStatus,
  { className: string; label: string }
> = {
  Confirmado: {
    className: "border border-emerald-500/15 bg-emerald-500/[0.12] text-emerald-700",
    label: "Confirmado"
  },
  Agendado: {
    className: "border border-brand/15 bg-brand/10 text-brand",
    label: "Agendado"
  },
  "Em atendimento": {
    className: "border border-amber-500/15 bg-amber-500/[0.14] text-amber-700",
    label: "Em atendimento"
  },
  Concluido: {
    className: "border border-slate-900/10 bg-slate-900/8 text-slate-700",
    label: "Concluido"
  },
  Cancelado: {
    className: "border border-rose-500/15 bg-rose-500/10 text-rose-700",
    label: "Cancelado"
  }
};

const trendMap: Record<
  TrendDirection,
  { className: string; icon: "trendUp" | "trendDown" | "spark" }
> = {
  up: {
    className: "border border-emerald-500/15 bg-emerald-500/[0.12] text-emerald-700",
    icon: "trendUp"
  },
  down: {
    className: "border border-rose-500/15 bg-rose-500/10 text-rose-700",
    icon: "trendDown"
  },
  stable: {
    className: "border border-brand/15 bg-brand/10 text-brand",
    icon: "spark"
  }
};

type StatusBadgeProps =
  | {
      status: AppointmentStatus;
      trend?: never;
      label?: never;
    }
  | {
      trend: TrendDirection;
      label: string;
      status?: never;
    };

export function StatusBadge(props: StatusBadgeProps) {
  if ("status" in props && props.status) {
    const config = statusMap[props.status as AppointmentStatus];

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
          config.className
        )}
      >
        {config.label}
      </span>
    );
  }

  const config = trendMap[props.trend as TrendDirection];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        config.className
      )}
    >
      <Icon name={config.icon} className="size-3.5" />
      {props.label}
    </span>
  );
}
