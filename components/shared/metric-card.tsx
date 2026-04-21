import { StatusBadge } from "@/components/shared/status-badge";
import type { DashboardMetric } from "@/lib/types";

type MetricCardProps = {
  metric: DashboardMetric;
};

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="panel-surface interactive-surface rounded-panel p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
            {metric.label}
          </p>
          <h3 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground">
            {metric.value}
          </h3>
        </div>
        <StatusBadge trend={metric.trend} label={metric.delta} />
      </div>
      <p className="max-w-[26ch] text-sm leading-6 text-muted-foreground">{metric.detail}</p>
    </article>
  );
}
