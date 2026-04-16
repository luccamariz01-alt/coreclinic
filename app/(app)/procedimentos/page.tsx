import Link from "next/link";
import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { procedures } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Procedimentos",
  description: "Catalogo clinico com foco comercial e operacional."
};

export default function ProceduresPage() {
  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-6 md:p-8">
            <p className="eyebrow">Mix de servicos</p>
            <h1 className="font-headline mt-3 max-w-[14ch] text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
              Catalogo com leitura de margem e percepcao de valor.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Em vez de cards decorativos, a nova vitrine mostra o que importa:
              ocupacao, ticket, tempo de sala e clareza de proposta.
            </p>
          </Panel>

          <Panel className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            {[
              ["Servicos ativos", "12"],
              ["Maior ocupacao", "91%"],
              ["Ticket medio", "R$ 1.106"]
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
          </Panel>
        </section>
      </Reveal>

      <section className="grid gap-5 xl:grid-cols-3">
        {procedures.map((procedure, index) => (
          <Reveal key={procedure.id} delay={0.06 * (index + 1)}>
            <Link href={`/procedimentos/${procedure.id}`}>
              <Panel className="h-full overflow-hidden p-0">
                <div className="h-40 bg-[radial-gradient(circle_at_top_left,rgba(198,91,131,0.42),transparent_30%),linear-gradient(135deg,#8f274c_0%,#c65b83_100%)]" />
                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow">{procedure.category}</p>
                      <h2 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.05em] text-foreground">
                        {procedure.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      {procedure.fillRate}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {procedure.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.2rem] bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                        Duracao
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {procedure.duration}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                        Ticket
                      </p>
                      <p className="mt-2 font-semibold text-foreground">{procedure.price}</p>
                    </div>
                  </div>
                </div>
              </Panel>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
