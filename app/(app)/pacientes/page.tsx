import Link from "next/link";
import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { patients } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { getPatients } from "@/lib/supabase/data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pacientes",
  description: "Base de pacientes com leitura premium."
};

export default async function PatientsPage() {
  let currentPatients = patients;

  if (hasSupabaseEnv) {
    const supabase = await createClient();
    const dbPatients = await getPatients(supabase);
    currentPatients = dbPatients.length ? dbPatients : patients;
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow">Relacionamento e recorrencia</p>
                <h1 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                  Base limpa para decidir quem ativar agora.
                </h1>
              </div>

              <div className="rounded-full border border-border bg-white/90 px-5 py-3 text-sm text-muted-foreground">
                148 pacientes ativos - 12 em janela de retorno
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["Novos no mes", "18"],
                ["Premium recorrente", "34"],
                ["Reengajamento", "12 contatos"]
              ].map((item) => (
                <div key={item[0]} className="rounded-[1.3rem] bg-muted p-4">
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
            <p className="eyebrow">Segmentos vivos</p>
            <div className="mt-5 space-y-3">
              {[
                ["Premium recorrente", "Paciente com alto ticket e recompra previsivel"],
                ["Alto potencial", "Boa resposta comercial e margem para upgrade"],
                ["Entrada ativa", "Precisa de ritual de retorno e educacao visual"]
              ].map((item) => (
                <div key={item[0]} className="rounded-[1.3rem] border border-border bg-white/[0.82] p-4">
                  <p className="font-semibold text-foreground">{item[0]}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item[1]}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <Panel className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b border-border px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Leitura operacional</p>
              <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                Pacientes com contexto visivel
              </h2>
            </div>

            <div className="w-full max-w-md rounded-full border border-border bg-white/90 px-4 py-3 text-sm text-muted-foreground">
              Buscar por nome, contato ou procedimento recente
            </div>
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-muted/75 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Ultima visita
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Procedimento
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Segmento
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Lifetime value
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient.id} className="border-t border-border/80">
                    <td className="px-6 py-5">
                      <Link href={`/pacientes/${patient.id}`} className="block">
                        <p className="font-semibold text-foreground">{patient.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{patient.email}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">{patient.lastVisit}</td>
                    <td className="px-6 py-5 text-sm text-muted-foreground">{patient.procedure}</td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                        {patient.segment}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-semibold text-foreground">
                      {patient.lifetimeValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {currentPatients.map((patient) => (
              <Link
                key={patient.id}
                href={`/pacientes/${patient.id}`}
                className="rounded-[1.3rem] border border-border bg-white/[0.82] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{patient.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{patient.procedure}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {patient.lifetimeValue}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
