import Link from "next/link";
import type { Metadata } from "next";

import { MetricCard } from "@/components/shared/metric-card";
import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import { DeleteEntityAction } from "@/components/shared/delete-entity-action";
import { StaggerGroup } from "@/components/shared/stagger-group";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import {
  dashboardMetrics,
  revenueComposition,
  scheduleFocus,
  todayAppointments,
  weeklyLoad
} from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import {
  getAppointmentsInRange,
  getDashboardMetrics,
  getDashboardRange,
  getWeeklyLoad,
  type DashboardPeriod
} from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visao executiva da operacao empresarial."
};

function parsePeriod(rawValue: string | string[] | undefined): DashboardPeriod {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (value === "day" || value === "week" || value === "month" || value === "custom") {
    return value;
  }
  return "day";
}

function parseDateParam(rawValue: string | string[] | undefined) {
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const period = parsePeriod(resolvedSearchParams?.period);
  const startDate = parseDateParam(resolvedSearchParams?.start);
  const endDate = parseDateParam(resolvedSearchParams?.end);
  const range = getDashboardRange(period, startDate, endDate);

  let metrics = dashboardMetrics;
  let appointments = todayAppointments;
  let loadByWeekday = weeklyLoad;
  let canDeleteAppointments = false;

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const [dbMetrics, dbAppointments, dbWeeklyLoad] = await Promise.all([
      getDashboardMetrics(supabase, range, period),
      getAppointmentsInRange(supabase, range, { limit: 8 }),
      getWeeklyLoad(supabase, range)
    ]);

    metrics = dbMetrics;
    appointments = dbAppointments;
    loadByWeekday = dbWeeklyLoad;
    canDeleteAppointments = dbAppointments.length > 0;
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <Panel className="overflow-hidden p-6 md:p-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="eyebrow">Panorama do dia</p>
                <h1 className="font-headline mt-4 max-w-[14ch] text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-5xl">
                  A operacao esta intensa, mas a decisao segue clara.
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  A interface concentra capacidade, receita e recorrencia em uma
                  unica leitura. O ganho nao e so visual: e velocidade para
                  decidir com mais seguranca.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {scheduleFocus.map((item, index) => (
                  <Reveal key={item.label} delay={0.06 * (index + 1)}>
                    <div className="card-surface rounded-[1rem] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                        {item.label}
                      </p>
                      <h3 className="font-headline mt-3 text-xl font-semibold tracking-[-0.05em] text-foreground">
                        {item.value}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.note}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="flex flex-col justify-between p-6 md:p-8">
            <div>
              <p className="eyebrow">Composicao da receita</p>
              <div className="mt-6 space-y-4">
                {revenueComposition.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-brand-gradient"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[1rem] bg-brand px-5 py-4 text-white shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/[0.65]">
                Recomendacao semanal
              </p>
              <p className="mt-3 text-sm leading-6 text-white/[0.84]">
                Sexta sustenta o maior pico de ocupacao. Abra janelas de maior
                ticket no fim da tarde e reduza encaixes de baixa margem.
              </p>
            </div>
          </Panel>
        </section>
      </Reveal>

      <PeriodFilter period={period} startDate={startDate} endDate={endDate} />

      <StaggerGroup className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4" delay={0.05}>
        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={0.06 * (index + 1)}>
            <MetricCard metric={metric} />
          </Reveal>
        ))}
      </StaggerGroup>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Reveal delay={0.08}>
          <Panel className="p-6 md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Desempenho semanal</p>
                <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Ritmo da agenda por dia
                </h2>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-brand" />
                  Semana atual
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-brand/[0.18]" />
                  Semana anterior
                </span>
              </div>
            </div>

            <div className="grid h-[18rem] grid-cols-6 items-end gap-3">
              {loadByWeekday.map((bar) => (
                <div key={bar.day} className="flex h-full flex-col justify-end gap-3">
                  <div className="flex h-full items-end gap-2">
                    <div
                      className="w-full rounded-t-[1.1rem] bg-brand/[0.18]"
                      style={{ height: `${bar.previous}%` }}
                    />
                    <div
                      className="w-full rounded-t-[1.1rem] bg-brand-gradient shadow-soft"
                      style={{ height: `${bar.current}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {bar.day}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.12}>
          <Panel className="p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="eyebrow">
                  {period === "day" ? "Agenda de hoje" : "Agenda do periodo"}
                </p>
                <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  {period === "day" ? "Sequencia do dia" : "Sequencia filtrada"}
                </h2>
              </div>
              <Link href="/agenda" className="text-sm font-semibold text-brand">
                Ver agenda
              </Link>
            </div>

            <StaggerGroup className="space-y-3" delay={0.04}>
              {appointments.map((appointment) => (
                <article key={appointment.id} className="card-surface rounded-[1rem] p-4">
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          {appointment.patient}
                        </h3>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {appointment.procedure}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="clock" className="size-4" />
                        {appointment.time} - {appointment.duration}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="room" className="size-4" />
                        {appointment.room}
                      </span>
                      <span className="font-semibold text-foreground">
                        {appointment.price}
                      </span>
                    </div>

                    {canDeleteAppointments ? (
                      <div>
                        <DeleteEntityAction
                          table="agendamentos"
                          id={appointment.id}
                          entityLabel={`o agendamento de ${appointment.patient}`}
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </StaggerGroup>
          </Panel>
        </Reveal>
      </section>
    </div>
  );
}
