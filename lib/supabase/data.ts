import type { SupabaseClient } from "@supabase/supabase-js";

import type { Appointment, DashboardMetric, Patient } from "@/lib/types";

type QueryClient = SupabaseClient<any, "public", any>;
type DateRange = {
  start: Date;
  endExclusive: Date;
};

export type DashboardPeriod = "day" | "week" | "month" | "custom";

const statusLabel: Record<string, Appointment["status"]> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_atendimento: "Em atendimento",
  concluido: "Concluido",
  cancelado: "Cancelado",
  falta: "Cancelado"
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDateBR(dateInput: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
    .format(new Date(dateInput))
    .replace(".", "");
}

function formatTime(dateInput: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateInput));
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function parseISODate(date?: string) {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getDashboardRange(
  period: DashboardPeriod,
  startDate?: string,
  endDate?: string
): DateRange {
  const now = new Date();

  if (period === "day") {
    const start = startOfDay(now);
    return { start, endExclusive: addDays(start, 1) };
  }

  if (period === "week") {
    const start = startOfWeek(now);
    return { start, endExclusive: addDays(start, 7) };
  }

  if (period === "month") {
    const start = startOfMonth(now);
    return { start, endExclusive: addMonths(start, 1) };
  }

  const parsedStart = parseISODate(startDate);
  const parsedEnd = parseISODate(endDate);

  if (!parsedStart || !parsedEnd || parsedEnd < parsedStart) {
    const start = startOfMonth(now);
    return { start, endExclusive: addMonths(start, 1) };
  }

  return { start: parsedStart, endExclusive: addDays(parsedEnd, 1) };
}

function getPreviousRange(current: DateRange): DateRange {
  const durationMs = current.endExclusive.getTime() - current.start.getTime();
  const prevEnd = new Date(current.start);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start: prevStart, endExclusive: prevEnd };
}

function getRangeLabel(period: DashboardPeriod) {
  if (period === "day") return "Hoje";
  if (period === "week") return "Semana atual";
  if (period === "month") return "Mes atual";
  return "Periodo selecionado";
}

function getPercentDelta(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? "+100%" : "0%";
  }

  const delta = Math.round(((current - previous) / previous) * 100);
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

export async function getDashboardMetrics(
  supabase: QueryClient,
  range: DateRange,
  period: DashboardPeriod
): Promise<DashboardMetric[]> {
  const previousRange = getPreviousRange(range);

  const [appointmentsCountResult, paidResult, ticketResult, previousCountResult] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .gte("inicio", range.start.toISOString())
      .lt("inicio", range.endExclusive.toISOString()),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pago")
      .gte("data_pagamento", range.start.toISOString())
      .lt("data_pagamento", range.endExclusive.toISOString()),
    supabase
      .from("agendamentos")
      .select("valor_cobrado")
      .eq("status", "concluido")
      .not("valor_cobrado", "is", null)
      .gte("inicio", range.start.toISOString())
      .lt("inicio", range.endExclusive.toISOString()),
    supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .gte("inicio", previousRange.start.toISOString())
      .lt("inicio", previousRange.endExclusive.toISOString())
  ]);

  const appointmentsCount = appointmentsCountResult.count ?? 0;
  const previousAppointmentsCount = previousCountResult.count ?? 0;
  const appointmentsDelta = getPercentDelta(appointmentsCount, previousAppointmentsCount);
  const rangeLabel = getRangeLabel(period);
  const paidTotal =
    paidResult.data?.reduce((acc, row) => acc + Number(row.valor ?? 0), 0) ?? 0;
  const ticketValues = ticketResult.data?.map((row) => Number(row.valor_cobrado ?? 0)) ?? [];
  const ticketAverage = ticketValues.length
    ? ticketValues.reduce((acc, value) => acc + value, 0) / ticketValues.length
    : 0;

  return [
    {
      label: "Agendamentos no periodo",
      value: String(appointmentsCount),
      delta: appointmentsDelta,
      detail: "Comparado com o periodo anterior equivalente",
      trend:
        appointmentsCount > previousAppointmentsCount
          ? "up"
          : appointmentsCount < previousAppointmentsCount
            ? "down"
            : "stable"
    },
    {
      label: "Receita confirmada",
      value: formatMoney(paidTotal),
      delta: rangeLabel,
      detail: "Soma de pagamentos com status pago",
      trend: "up"
    },
    {
      label: "Retorno ativo",
      value: "N/D",
      delta: "Em evolucao",
      detail: "Indicador de recorrencia sera refinado com regras de negocio",
      trend: "stable"
    },
    {
      label: "Ticket medio",
      value: formatMoney(ticketAverage),
      delta: rangeLabel,
      detail: "Media de valor cobrado nos atendimentos concluidos",
      trend: "stable"
    }
  ];
}

export async function getAppointmentsInRange(
  supabase: QueryClient,
  range: DateRange
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,paciente_nome,procedimento_nome,inicio,fim,status,valor_cobrado")
    .gte("inicio", range.start.toISOString())
    .lt("inicio", range.endExclusive.toISOString())
    .order("inicio", { ascending: true })
    .limit(8);

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const start = new Date(row.inicio);
    const end = new Date(row.fim);
    const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));

    return {
      id: row.id,
      patient: row.paciente_nome ?? "Paciente",
      procedure: row.procedimento_nome ?? "Procedimento",
      time: formatTime(row.inicio),
      duration: `${durationMin} min`,
      room: "Sala principal",
      status: statusLabel[row.status] ?? "Agendado",
      price: formatMoney(Number(row.valor_cobrado ?? 0))
    };
  });
}

export async function getWeeklyLoad(
  supabase: QueryClient,
  range: DateRange
): Promise<Array<{ day: string; current: number; previous: number }>> {
  const previousRange = getPreviousRange(range);
  const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const currentCounts = [0, 0, 0, 0, 0, 0];
  const previousCounts = [0, 0, 0, 0, 0, 0];

  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("inicio")
      .gte("inicio", range.start.toISOString())
      .lt("inicio", range.endExclusive.toISOString()),
    supabase
      .from("agendamentos")
      .select("inicio")
      .gte("inicio", previousRange.start.toISOString())
      .lt("inicio", previousRange.endExclusive.toISOString())
  ]);

  for (const row of currentResult.data ?? []) {
    const day = new Date(row.inicio).getDay();
    const idx = day === 0 ? 6 : day - 1;
    if (idx >= 0 && idx <= 5) currentCounts[idx] += 1;
  }

  for (const row of previousResult.data ?? []) {
    const day = new Date(row.inicio).getDay();
    const idx = day === 0 ? 6 : day - 1;
    if (idx >= 0 && idx <= 5) previousCounts[idx] += 1;
  }

  const maxCount = Math.max(...currentCounts, ...previousCounts, 1);

  return dayLabels.map((day, index) => ({
    day,
    current: Math.max(5, Math.round((currentCounts[index] / maxCount) * 95)),
    previous: Math.max(5, Math.round((previousCounts[index] / maxCount) * 95))
  }));
}

export async function getPatients(supabase: QueryClient): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("pacientes")
    .select("id,nome,email,telefone,observacoes,created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.nome,
    email: row.email ?? "-",
    phone: row.telefone ?? "-",
    lastVisit: row.created_at ? formatDateBR(row.created_at) : "-",
    procedure: "Consultar agenda",
    lifetimeValue: "N/D",
    segment: "Em definicao",
    notes: row.observacoes ?? "Sem observacoes."
  }));
}
