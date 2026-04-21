export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: "dashboard" | "agenda" | "patients" | "procedures";
};

export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: "dashboard"
  },
  {
    href: "/agenda",
    label: "Agenda",
    shortLabel: "Agenda",
    icon: "agenda"
  },
  {
    href: "/pacientes",
    label: "Pacientes",
    shortLabel: "Pacientes",
    icon: "patients"
  },
  {
    href: "/procedimentos",
    label: "Procedimentos",
    shortLabel: "Servicos",
    icon: "procedures"
  }
];

export function getRouteMeta(pathname: string) {
  if (pathname.startsWith("/agenda")) {
    return {
      eyebrow: "Operacao",
      title: "Agenda operacional",
      description: "Blocos de atendimento, encaixes e leitura rapida de capacidade."
    };
  }

  if (pathname.startsWith("/pacientes/")) {
    return {
      eyebrow: "CRM e receita",
      title: "Perfil do paciente",
      description: "Historico, faturamento e proximos passos comerciais em um painel limpo."
    };
  }

  if (pathname.startsWith("/pacientes")) {
    return {
      eyebrow: "CRM e receita",
      title: "Base de clientes",
      description: "Segmentacao, retorno e acompanhamento com foco em crescimento."
    };
  }

  if (pathname.startsWith("/procedimentos/")) {
    return {
      eyebrow: "Catalogo comercial",
      title: "Detalhe do servico",
      description: "Contexto operacional, protocolo e posicionamento de margem."
    };
  }

  if (pathname.startsWith("/procedimentos")) {
    return {
      eyebrow: "Catalogo comercial",
      title: "Servicos",
      description: "Mix de servicos, ticket e performance do portfolio da empresa."
    };
  }

  return {
    eyebrow: "Visao executiva",
    title: "Dashboard de gestao",
    description: "Indicadores centrais, ritmo da agenda e sinais de receita em tempo real."
  };
}
