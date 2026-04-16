import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { patientActivities, patients } from "@/lib/demo-data";

type PatientDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: PatientDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const patient = patients.find((item) => item.id === id);

  return {
    title: patient ? patient.name : "Paciente"
  };
}

export default async function PatientDetailPage({
  params
}: PatientDetailPageProps) {
  const { id } = await params;
  const patient = patients.find((item) => item.id === id);

  if (!patient) {
    notFound();
  }

  const activities = patientActivities[id] ?? [];

  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <Panel className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center rounded-[2rem] bg-brand text-2xl font-bold text-white">
                {patient.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </div>
              <div>
                <p className="eyebrow">Paciente ativa</p>
                <h1 className="font-headline mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                  {patient.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{patient.segment}</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[
                ["Contato", patient.phone],
                ["E-mail", patient.email],
                ["Ultima visita", patient.lastVisit],
                ["Lifetime value", patient.lifetimeValue]
              ].map((item) => (
                <div key={item[0]} className="rounded-[1.2rem] bg-muted px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                    {item[0]}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{item[1]}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Resumo clinico</p>
                <h2 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                  Contexto pronto para a proxima acao
                </h2>
              </div>
              <Link
                href="/agenda"
                className="rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-ambient"
              >
                Agendar retorno
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Procedimento lider", patient.procedure],
                ["Observacao chave", patient.notes],
                ["Proxima melhor acao", "Oferecer pacote trimestral com retorno ja reservado"]
              ].map((item) => (
                <div key={item[0]} className="rounded-[1.3rem] border border-border bg-white/[0.82] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    {item[0]}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{item[1]}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <Panel className="p-6 md:p-8">
          <div className="mb-6">
            <p className="eyebrow">Historico recente</p>
            <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Linha do tempo do relacionamento
            </h2>
          </div>

          <div className="space-y-4">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-[1.3rem] border border-border bg-white/[0.82] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{activity.title}</p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{activity.date}</p>
                    {activity.amount ? (
                      <p className="mt-1 text-sm text-brand">{activity.amount}</p>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
