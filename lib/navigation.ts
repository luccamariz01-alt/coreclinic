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
      eyebrow: "Operacao clinica",
      title: "Agenda inteligente",
      description: "Blocos de atendimento, encaixes e leitura rapida da ocupacao."
    };
  }

  if (pathname.startsWith("/pacientes/")) {
    return {
      eyebrow: "Relacionamento",
      title: "Perfil do paciente",
      description: "Historico clinico, faturamento e proximos passos em um painel limpo."
    };
  }

  if (pathname.startsWith("/pacientes")) {
    return {
      eyebrow: "Relacionamento",
      title: "Base de pacientes",
      description: "Segmentacao, retorno e acompanhamento sem ruido visual."
    };
  }

  if (pathname.startsWith("/procedimentos/")) {
    return {
      eyebrow: "Catalogo clinico",
      title: "Detalhe do procedimento",
      description: "Contexto operacional, protocolo e posicionamento comercial."
    };
  }

  if (pathname.startsWith("/procedimentos")) {
    return {
      eyebrow: "Catalogo clinico",
      title: "Procedimentos",
      description: "Mix de servicos, ticket e performance do cardapio da clinica."
    };
  }

  return {
    eyebrow: "Visao executiva",
    title: "Dashboard clinico",
    description: "Indicadores centrais, ritmo da agenda e sinais de receita em tempo real."
  };
}
