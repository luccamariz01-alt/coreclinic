import Link from "next/link";
import type { Metadata } from "next";

import { PeriodFilter } from "@/components/dashboard/period-filter";
import { Icon } from "@/components/shared/icon";
import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { StaggerGroup } from "@/components/shared/stagger-group";
import { StatusBadge } from "@/components/shared/status-badge";
import { hasSupabaseEnv } from "@/lib/env";
import {
  type AgendaAppointment,
  getAgendaAppointmentsInRange,
  getDashboardRange,
  type DashboardPeriod
} from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda operacional da empresa."
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

function weekdayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
}

function toDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const label = weekdayLabel(date);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function parseCurrencyBRL(value: string) {
  const numeric = Number(value.replace(/[R$\s.]/g, "").replace(",", "."));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default async function AgendaPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const period = parsePeriod(resolvedSearchParams?.period);
  const startDate = parseDateParam(resolvedSearchParams?.start);
  const endDate = parseDateParam(resolvedSearchParams?.end);
  const range = getDashboardRange(period, startDate, endDate);

  let appointments: AgendaAppointment[] = [];

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    appointments = await getAgendaAppointmentsInRange(supabase, range);
  }

  const totalAppointments = appointments.length;
  const estimatedRevenue = appointments.reduce(
    (acc, appointment) => acc + parseCurrencyBRL(appointment.price),
    0
  );

  const groupedByDay = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const key = toDateKey(appointment.startAt);
    const existing = groupedByDay.get(key) ?? [];
    groupedByDay.set(key, [...existing, appointment]);
  }

  const dayColumns = Array.from(groupedByDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)
    .map(([key, items]) => ({
      key,
      label: formatDateLabel(key),
      total: `${items.length.toString().padStart(2, "0")} blocos`,
      appointments: items
    }));

  return (
    <div className="space-y-5">
      <PeriodFilter period={period} startDate={startDate} endDate={endDate} />

      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6 md:p-8">
            <p className="eyebrow">Recorte de hoje</p>
            <h1 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Agenda sincronizada com o Supabase.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              Todas as linhas abaixo sao carregadas do banco em tempo real conforme o filtro
              selecionado.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Agendamentos", String(totalAppointments)],
                ["Periodo", period === "custom" ? "Personalizado" : period.toUpperCase()],
                [
                  "Receita estimada",
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0
                  }).format(estimatedRevenue)
                ]
              ].map((item) => (
                <div key={item[0]} className="card-surface rounded-[1rem] bg-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    {item[0]}
                  </p>
                  <p className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                    {item[1]}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="eyebrow">Resumo do periodo</p>
                <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Proximos atendimentos
                </h2>
              </div>
              <StatusBadge
                trend={totalAppointments > 0 ? "up" : "stable"}
                label={totalAppointments > 0 ? `${totalAppointments} encontrados` : "Sem registros"}
              />
            </div>

            <div className="space-y-4">
              {appointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="card-surface rounded-[1rem] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {appointment.time} - {appointment.patient}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{appointment.procedure}</p>
                    </div>
                    <p className="font-headline text-xl font-semibold tracking-[-0.05em] text-foreground">
                      {appointment.price}
                    </p>
                  </div>
                </div>
              ))}
              {appointments.length === 0 ? (
                <div className="card-surface rounded-[1rem] p-4">
                  <p className="text-sm text-muted-foreground">
                    Nenhum agendamento retornado pelo Supabase neste periodo.
                  </p>
                </div>
              ) : null}
            </div>
          </Panel>
        </section>
      </Reveal>

      <StaggerGroup className="grid gap-5 xl:grid-cols-3" delay={0.05}>
        {dayColumns.map((column, index) => (
          <Reveal key={column.label} delay={0.06 * (index + 1)}>
            <Panel className="p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="eyebrow">{column.label}</p>
                  <h2 className="font-headline mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                    {column.total}
                  </h2>
                </div>
                <Link
                  href={`/agenda?period=custom&start=${column.key}&end=${column.key}`}
                  className="interactive-surface card-surface rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
                >
                  Ajustar
                </Link>
              </div>

              <div className="space-y-3">
                {column.appointments.map((appointment) => (
                  <article key={`${column.label}-${appointment.id}`} className="card-surface rounded-[1rem] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.patient}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{appointment.procedure}</p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Icon name="clock" className="size-4" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <Icon name="room" className="size-4" />
                        {appointment.room}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </Reveal>
        ))}
      </StaggerGroup>

      {dayColumns.length === 0 ? (
        <Panel className="p-6 text-sm text-muted-foreground">Sem dias para exibir neste filtro.</Panel>
      ) : null}
    </div>
  );
}
