import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { procedures } from "@/lib/demo-data";

type ProcedureDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: ProcedureDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const procedure = procedures.find((item) => item.id === id);

  return {
    title: procedure ? procedure.name : "Procedimento"
  };
}

export default async function ProcedureDetailPage({
  params
}: ProcedureDetailPageProps) {
  const { id } = await params;
  const procedure = procedures.find((item) => item.id === id);

  if (!procedure) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="overflow-hidden p-0">
            <div className="h-56 bg-[radial-gradient(circle_at_top_left,rgba(198,91,131,0.42),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_20%),linear-gradient(135deg,#8f274c_0%,#c65b83_100%)]" />
            <div className="p-6 md:p-8">
              <p className="eyebrow">{procedure.category}</p>
              <h1 className="font-headline mt-3 text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {procedure.name}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                {procedure.summary}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["Duracao", procedure.duration],
                  ["Ticket", procedure.price],
                  ["Ocupacao", procedure.fillRate]
                ].map((item) => (
                  <div key={item[0]} className="rounded-[1.25rem] bg-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                      {item[0]}
                    </p>
                    <p className="font-headline mt-2 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                      {item[1]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel className="p-6 md:p-8">
            <p className="eyebrow">Leitura comercial</p>
            <div className="mt-5 space-y-4">
              {[
                ["Valor percebido", "Alto, com narrativa de resultado clara e comparavel."],
                ["Friccao operacional", "Baixa, com tempo controlado e preparo simples."],
                ["Papel no funil", "Servico de margem forte e boa alavanca de recorrencia."]
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
        <Panel className="p-6 md:p-8">
          <p className="eyebrow">Fluxo sugerido</p>
          <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
            Protocolo em etapas
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {procedure.protocol.map((step, index) => (
              <div key={step} className="rounded-[1.3rem] border border-border bg-white/[0.82] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                  Etapa {index + 1}
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
