import type { SupabaseClient } from "@supabase/supabase-js";

import type { Appointment, DashboardMetric, Patient } from "@/lib/types";

type QueryClient = SupabaseClient<any, "public", any>;

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

export async function getDashboardMetrics(supabase: QueryClient): Promise<DashboardMetric[]> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [todayCountResult, paidResult, ticketResult] = await Promise.all([
    supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .gte("inicio", dayStart.toISOString())
      .lt("inicio", dayEnd.toISOString()),
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pago")
      .gte("data_pagamento", monthStart.toISOString())
      .lt("data_pagamento", nextMonthStart.toISOString()),
    supabase
      .from("agendamentos")
      .select("valor_cobrado")
      .eq("status", "concluido")
      .not("valor_cobrado", "is", null)
      .gte("inicio", monthStart.toISOString())
      .lt("inicio", nextMonthStart.toISOString())
  ]);

  const todayCount = todayCountResult.count ?? 0;
  const paidTotal =
    paidResult.data?.reduce((acc, row) => acc + Number(row.valor ?? 0), 0) ?? 0;
  const ticketValues = ticketResult.data?.map((row) => Number(row.valor_cobrado ?? 0)) ?? [];
  const ticketAverage = ticketValues.length
    ? ticketValues.reduce((acc, value) => acc + value, 0) / ticketValues.length
    : 0;

  return [
    {
      label: "Agendamentos do dia",
      value: String(todayCount),
      delta: "Dados reais",
      detail: "Total de agendamentos de hoje no Supabase",
      trend: "stable"
    },
    {
      label: "Receita confirmada",
      value: formatMoney(paidTotal),
      delta: "Mes atual",
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
      delta: "Mes atual",
      detail: "Media de valor cobrado nos atendimentos concluidos",
      trend: "stable"
    }
  ];
}

export async function getTodayAppointments(supabase: QueryClient): Promise<Appointment[]> {
  const dayStart = startOfDay();
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data, error } = await supabase
    .from("agendamentos")
    .select("id,paciente_nome,procedimento_nome,inicio,fim,status,valor_cobrado")
    .gte("inicio", dayStart.toISOString())
    .lt("inicio", dayEnd.toISOString())
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
