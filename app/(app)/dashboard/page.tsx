import Link from "next/link";
import type { Metadata } from "next";

import { MetricCard } from "@/components/shared/metric-card";
import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { StatusBadge } from "@/components/shared/status-badge";
import { Icon } from "@/components/shared/icon";
import {
  dashboardMetrics,
  revenueComposition,
  scheduleFocus,
  todayAppointments,
  weeklyLoad
} from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visao executiva da operacao clinica."
};

export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
          <Panel className="overflow-hidden p-6 md:p-8">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="eyebrow">Panorama do dia</p>
                <h1 className="font-headline mt-4 max-w-[14ch] text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-5xl">
                  A clinica esta cheia, mas a leitura continua leve.
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  A nova interface concentra agenda, receita e recorrencia em
                  superficies mais calmas. O ganho aqui nao e so visual: e de
                  velocidade cognitiva para decidir melhor.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                {scheduleFocus.map((item, index) => (
                  <Reveal key={item.label} delay={0.06 * (index + 1)}>
                    <div className="rounded-[1.35rem] border border-border bg-muted p-4">
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

            <div className="mt-8 rounded-[1.35rem] bg-brand px-5 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/[0.65]">
                Insight da semana
              </p>
              <p className="mt-3 text-sm leading-6 text-white/[0.84]">
                Sexta sustenta o maior pico de ocupacao. Vale abrir janela premium
                no fim da tarde em vez de pulverizar encaixes mais baratos.
              </p>
            </div>
          </Panel>
        </section>
      </Reveal>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((metric, index) => (
          <Reveal key={metric.label} delay={0.06 * (index + 1)}>
            <MetricCard metric={metric} />
          </Reveal>
        ))}
      </section>

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
              {weeklyLoad.map((bar) => (
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
                <p className="eyebrow">Agenda de hoje</p>
                <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                  Sequencia do dia
                </h2>
              </div>
              <Link href="/agenda" className="text-sm font-semibold text-brand">
                Ver agenda
              </Link>
            </div>

            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-[1.35rem] border border-border bg-white/[0.82] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </Reveal>
      </section>
    </div>
  );
}
