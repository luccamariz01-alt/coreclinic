import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import { StaggerGroup } from "@/components/shared/stagger-group";
import { todayAppointments } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda operacional da empresa."
};

const weekColumns = [
  {
    label: "Segunda",
    total: "06 blocos",
    appointments: todayAppointments.slice(0, 2)
  },
  {
    label: "Terca",
    total: "08 blocos",
    appointments: todayAppointments.slice(1, 3)
  },
  {
    label: "Quarta",
    total: "05 blocos",
    appointments: todayAppointments.slice(0, 1)
  }
];

export default function AgendaPage() {
  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6 md:p-8">
            <p className="eyebrow">Recorte de hoje</p>
            <h1 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
              Janela de ocupacao organizada por prioridade.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
              A nova agenda evita o efeito de calendario pesado. Em vez disso,
              mostra carga, encaixes e impacto de receita em blocos mais claros.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Ocupacao", "82%"],
                ["Encaixes possiveis", "3"],
                ["Receita estimada", "R$ 6.120"]
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
                <p className="eyebrow">Faixa de maior margem</p>
                <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Turnos mais valiosos
                </h2>
              </div>
              <StatusBadge trend="up" label="+15% potencial" />
            </div>

            <div className="space-y-4">
              {[
                ["09:00 - 12:00", "Toxina, labios e retornos rapidos", "R$ 3.280"],
                ["14:00 - 17:00", "Bioestimuladores e protocolos compostos", "R$ 4.960"],
                ["17:00 - 19:00", "Janela ideal para upgrade de ticket", "R$ 2.140"]
              ].map((item) => (
                <div key={item[0]} className="card-surface rounded-[1rem] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item[0]}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item[1]}</p>
                    </div>
                    <p className="font-headline text-xl font-semibold tracking-[-0.05em] text-foreground">
                      {item[2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </Reveal>

      <StaggerGroup className="grid gap-5 xl:grid-cols-3" delay={0.05}>
        {weekColumns.map((column, index) => (
          <Reveal key={column.label} delay={0.06 * (index + 1)}>
            <Panel className="p-5 md:p-6">
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="eyebrow">{column.label}</p>
                  <h2 className="font-headline mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                    {column.total}
                  </h2>
                </div>
                <button className="interactive-surface card-surface rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  Ajustar
                </button>
              </div>

              <div className="space-y-3">
                {column.appointments.map((appointment) => (
                  <article key={`${column.label}-${appointment.id}`} className="card-surface rounded-[1rem] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{appointment.patient}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {appointment.procedure}
                        </p>
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
    </div>
  );
}
