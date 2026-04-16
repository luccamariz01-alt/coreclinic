import type {
  Activity,
  Appointment,
  DashboardMetric,
  Patient,
  Procedure
} from "@/lib/types";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Agendamentos do dia",
    value: "18",
    delta: "+12%",
    detail: "3 encaixes acima da media das ultimas 4 semanas",
    trend: "up"
  },
  {
    label: "Receita confirmada",
    value: "R$ 14.280",
    delta: "+8,4%",
    detail: "Pagamentos com maior concentracao em harmonizacao facial",
    trend: "up"
  },
  {
    label: "Retorno ativo",
    value: "74%",
    delta: "Estavel",
    detail: "Base recorrente sustentando fluxo previsivel",
    trend: "stable"
  },
  {
    label: "Ticket medio",
    value: "R$ 793",
    delta: "-3%",
    detail: "Queda leve puxada por procedimentos de entrada",
    trend: "down"
  }
];

export const weeklyLoad = [
  { day: "Seg", current: 64, previous: 52 },
  { day: "Ter", current: 72, previous: 58 },
  { day: "Qua", current: 58, previous: 46 },
  { day: "Qui", current: 82, previous: 62 },
  { day: "Sex", current: 94, previous: 76 },
  { day: "Sab", current: 48, previous: 36 }
];

export const todayAppointments: Appointment[] = [
  {
    id: "a1",
    patient: "Mariana Costa",
    procedure: "Bioestimulador facial",
    time: "08:30",
    duration: "50 min",
    room: "Sala Aurora",
    status: "Confirmado",
    price: "R$ 1.450"
  },
  {
    id: "a2",
    patient: "Renata Melo",
    procedure: "Protocolo labios",
    time: "10:00",
    duration: "45 min",
    room: "Sala Iris",
    status: "Em atendimento",
    price: "R$ 980"
  },
  {
    id: "a3",
    patient: "Carla Nunes",
    procedure: "Consulta de retorno",
    time: "11:30",
    duration: "30 min",
    room: "Sala Aurora",
    status: "Agendado",
    price: "R$ 0"
  },
  {
    id: "a4",
    patient: "Paula Lima",
    procedure: "Toxina botulinica full face",
    time: "14:30",
    duration: "60 min",
    room: "Sala Iris",
    status: "Confirmado",
    price: "R$ 1.890"
  }
];

export const scheduleFocus = [
  {
    label: "Espacos premium",
    value: "3 horarios livres",
    note: "Quinta entre 16h e 19h com melhor potencial de ticket"
  },
  {
    label: "Pacientes em janela de retorno",
    value: "12 contatos quentes",
    note: "Metade ainda sem nova data definida"
  },
  {
    label: "Procedimento lider",
    value: "Harmonizacao full face",
    note: "28% da receita da semana em um unico protocolo"
  }
];

export const patients: Patient[] = [
  {
    id: "mariana-costa",
    name: "Mariana Costa",
    email: "mariana@exemplo.com",
    phone: "(11) 99871-0041",
    lastVisit: "11 Abr 2026",
    procedure: "Bioestimulador facial",
    lifetimeValue: "R$ 12.480",
    segment: "Premium recorrente",
    notes: "Prefere atendimento pela manha e responde melhor por WhatsApp."
  },
  {
    id: "renata-melo",
    name: "Renata Melo",
    email: "renata@exemplo.com",
    phone: "(11) 99412-8890",
    lastVisit: "09 Abr 2026",
    procedure: "Preenchimento labial",
    lifetimeValue: "R$ 6.230",
    segment: "Alto potencial",
    notes: "Aceita upgrade de protocolo quando ha explicacao visual clara."
  },
  {
    id: "carla-nunes",
    name: "Carla Nunes",
    email: "carla@exemplo.com",
    phone: "(11) 99603-7612",
    lastVisit: "05 Abr 2026",
    procedure: "Peeling quimico",
    lifetimeValue: "R$ 3.180",
    segment: "Entrada ativa",
    notes: "Em acompanhamento de conversao para plano trimestral."
  },
  {
    id: "paula-lima",
    name: "Paula Lima",
    email: "paula@exemplo.com",
    phone: "(11) 99277-4521",
    lastVisit: "02 Abr 2026",
    procedure: "Toxina botulinica",
    lifetimeValue: "R$ 9.760",
    segment: "Recorrencia forte",
    notes: "Alta taxa de indicacao, bom perfil para programa VIP."
  }
];

export const patientActivities: Record<string, Activity[]> = {
  "mariana-costa": [
    {
      id: "m1",
      title: "Bioestimulador facial",
      description: "Sessao com reforco de sustentacao em terco medio.",
      date: "11 Abr 2026",
      amount: "R$ 1.450"
    },
    {
      id: "m2",
      title: "Retorno clinico",
      description: "Acompanhamento fotografico e orientacao de skincare.",
      date: "21 Mar 2026"
    },
    {
      id: "m3",
      title: "Protocolo glow skin",
      description: "Combinacao de limpeza profunda e drug delivery.",
      date: "03 Fev 2026",
      amount: "R$ 980"
    }
  ],
  "renata-melo": [
    {
      id: "r1",
      title: "Preenchimento labial",
      description: "Ajuste de volume com foco em contorno natural.",
      date: "09 Abr 2026",
      amount: "R$ 980"
    },
    {
      id: "r2",
      title: "Consulta de planejamento",
      description: "Mapeamento para protocolo full face em 60 dias.",
      date: "17 Mar 2026"
    }
  ]
};

export const procedures: Procedure[] = [
  {
    id: "bioestimulador-facial",
    name: "Bioestimulador facial",
    category: "Rejuvenescimento",
    duration: "50 min",
    price: "R$ 1.450",
    fillRate: "84%",
    summary: "Procedimento com alto valor percebido e baixa friccao de recompra.",
    protocol: [
      "Anamnese e fotografia de base",
      "Mapeamento facial e marcacao",
      "Aplicacao guiada e orientacoes de cuidado",
      "Retorno em 21 dias"
    ]
  },
  {
    id: "toxina-full-face",
    name: "Toxina botulinica full face",
    category: "Expressao facial",
    duration: "60 min",
    price: "R$ 1.890",
    fillRate: "91%",
    summary: "Servico lider em margem e recorrencia trimestral.",
    protocol: [
      "Consulta e definicao de pontos",
      "Aplicacao por zonas de expressao",
      "Revisao de assimetrias",
      "Follow-up em 15 dias"
    ]
  },
  {
    id: "protocolo-labios",
    name: "Protocolo labios",
    category: "Harmonizacao",
    duration: "45 min",
    price: "R$ 980",
    fillRate: "76%",
    summary: "Boa porta de entrada para pacientes com potencial de upgrade.",
    protocol: [
      "Planejamento estetico",
      "Anestesia topica e marcacao",
      "Aplicacao com foco em contorno e hidratacao",
      "Instrucoes de pos-procedimento"
    ]
  }
];

export const revenueComposition = [
  { label: "Harmonizacao", value: 42 },
  { label: "Rejuvenescimento", value: 31 },
  { label: "Skincare clinico", value: 17 },
  { label: "Retornos", value: 10 }
];
