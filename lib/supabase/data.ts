import type { SupabaseClient } from "@supabase/supabase-js";

import type { Appointment, DashboardMetric, Patient } from "@/lib/types";

type QueryClient = SupabaseClient<any, "public", any>;
export type DateRange = {
  start: Date;
  endExclusive: Date;
};

export type DashboardPeriod = "day" | "week" | "month" | "custom";
export type AgendaAppointment = Appointment & {
  startAt: string;
};

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

type AppointmentRow = {
  id: string;
  paciente_nome: string | null;
  paciente_id: string | null;
  procedimento_nome: string | null;
  procedimento_id: string | null;
  inicio: string;
  fim: string;
  status: string | null;
  valor_cobrado: number | null;
};

async function getProcedureLookup(supabase: QueryClient, procedureIds: string[]) {
  if (!procedureIds.length) {
    return new Map<string, { nome: string | null; valor: number | null }>();
  }

  const { data } = await supabase
    .from("procedimentos")
    .select("id,nome,valor")
    .in("id", procedureIds);

  const lookup = new Map<string, { nome: string | null; valor: number | null }>();
  for (const row of data ?? []) {
    lookup.set(row.id, {
      nome: row.nome ?? null,
      valor: typeof row.valor === "number" ? row.valor : Number(row.valor ?? 0)
    });
  }
  return lookup;
}

async function getPatientNameLookup(supabase: QueryClient, patientIds: string[]) {
  if (!patientIds.length) {
    return new Map<string, string>();
  }

  const { data } = await supabase.from("pacientes").select("id,nome").in("id", patientIds);
  const lookup = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.nome) lookup.set(row.id, row.nome);
  }
  return lookup;
}

async function getEnrichedAppointments(
  supabase: QueryClient,
  rows: AppointmentRow[]
): Promise<AgendaAppointment[]> {
  if (!rows.length) {
    return [];
  }

  const procedureIds = Array.from(
    new Set(rows.map((row) => row.procedimento_id).filter((id): id is string => Boolean(id)))
  );
  const patientIds = Array.from(
    new Set(rows.map((row) => row.paciente_id).filter((id): id is string => Boolean(id)))
  );

  const [procedureLookup, patientLookup] = await Promise.all([
    getProcedureLookup(supabase, procedureIds),
    getPatientNameLookup(supabase, patientIds)
  ]);

  return rows.map((row) => {
    const start = new Date(row.inicio);
    const end = new Date(row.fim);
    const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    const procedureMeta = row.procedimento_id ? procedureLookup.get(row.procedimento_id) : undefined;
    const resolvedProcedure = row.procedimento_nome ?? procedureMeta?.nome ?? "Procedimento";
    const resolvedPatient = row.paciente_nome ?? (row.paciente_id ? patientLookup.get(row.paciente_id) : null);
    const resolvedValue =
      typeof row.valor_cobrado === "number"
        ? row.valor_cobrado
        : typeof procedureMeta?.valor === "number"
          ? procedureMeta.valor
          : 0;

    return {
      id: row.id,
      patient: resolvedPatient ?? "Paciente",
      procedure: resolvedProcedure,
      time: formatTime(row.inicio),
      duration: `${durationMin} min`,
      room: "Sala principal",
      status: statusLabel[row.status ?? "agendado"] ?? "Agendado",
      price: formatMoney(Number(resolvedValue)),
      startAt: row.inicio
    };
  });
}

export async function getAgendaAppointmentsInRange(
  supabase: QueryClient,
  range: DateRange
): Promise<AgendaAppointment[]> {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,paciente_nome,paciente_id,procedimento_nome,procedimento_id,inicio,fim,status,valor_cobrado")
    .gte("inicio", range.start.toISOString())
    .lt("inicio", range.endExclusive.toISOString())
    .order("inicio", { ascending: true });

  if (error || !data) {
    return [];
  }

  return getEnrichedAppointments(supabase, data as AppointmentRow[]);
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
  range: DateRange,
  options?: {
    limit?: number;
  }
): Promise<Appointment[]> {
  let query = supabase
    .from("agendamentos")
    .select("id,paciente_nome,paciente_id,procedimento_nome,procedimento_id,inicio,fim,status,valor_cobrado")
    .gte("inicio", range.start.toISOString())
    .lt("inicio", range.endExclusive.toISOString())
    .order("inicio", { ascending: true });

  if (typeof options?.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  const enriched = await getEnrichedAppointments(supabase, data as AppointmentRow[]);
  return enriched.map(({ startAt: _startAt, ...appointment }) => appointment);
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

  const patientIds = data.map((row) => row.id);
  if (!patientIds.length) {
    return [];
  }
  const { data: appointmentData } = await supabase
    .from("agendamentos")
    .select("paciente_id,procedimento_id,procedimento_nome,inicio,valor_cobrado,status")
    .in("paciente_id", patientIds)
    .order("inicio", { ascending: false });

  const procedureIds = Array.from(
    new Set(
      (appointmentData ?? [])
        .map((row) => row.procedimento_id)
        .filter((id): id is string => Boolean(id))
    )
  );
  const procedureLookup = await getProcedureLookup(supabase, procedureIds);

  const lastAppointmentByPatient = new Map<
    string,
    {
      inicio: string;
      procedimentoNome: string;
    }
  >();
  const lifetimeByPatient = new Map<string, number>();

  for (const appointment of appointmentData ?? []) {
    if (!appointment.paciente_id) continue;

    if (!lastAppointmentByPatient.has(appointment.paciente_id)) {
      const procedureMeta = appointment.procedimento_id
        ? procedureLookup.get(appointment.procedimento_id)
        : undefined;
      lastAppointmentByPatient.set(appointment.paciente_id, {
        inicio: appointment.inicio,
        procedimentoNome:
          appointment.procedimento_nome ?? procedureMeta?.nome ?? "Sem procedimento"
      });
    }

    if (appointment.status === "concluido") {
      const prev = lifetimeByPatient.get(appointment.paciente_id) ?? 0;
      lifetimeByPatient.set(
        appointment.paciente_id,
        prev + Number(appointment.valor_cobrado ?? 0)
      );
    }
  }

  return data.map((row) => {
    const lastAppointment = lastAppointmentByPatient.get(row.id);
    const total = lifetimeByPatient.get(row.id) ?? 0;
    const segment =
      total >= 5000 ? "Premium recorrente" : total >= 1500 ? "Alto potencial" : "Entrada ativa";

    return {
      id: row.id,
      name: row.nome,
      email: row.email ?? "-",
      phone: row.telefone ?? "-",
      lastVisit: lastAppointment?.inicio
        ? formatDateBR(lastAppointment.inicio)
        : row.created_at
          ? formatDateBR(row.created_at)
          : "-",
      procedure: lastAppointment?.procedimentoNome ?? "Sem procedimento",
      lifetimeValue: formatMoney(total),
      segment,
      notes: row.observacoes ?? "Sem observacoes."
    };
  });
}
