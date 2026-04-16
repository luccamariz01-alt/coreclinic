export type TrendDirection = "up" | "down" | "stable";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  detail: string;
  trend: TrendDirection;
};

export type AppointmentStatus =
  | "Confirmado"
  | "Agendado"
  | "Em atendimento"
  | "Concluido"
  | "Cancelado";

export type Appointment = {
  id: string;
  patient: string;
  procedure: string;
  time: string;
  duration: string;
  room: string;
  status: AppointmentStatus;
  price: string;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  procedure: string;
  lifetimeValue: string;
  segment: string;
  notes: string;
};

export type Procedure = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: string;
  fillRate: string;
  summary: string;
  protocol: string[];
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  amount?: string;
};
