import Link from "next/link";
import type { Metadata } from "next";

import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ProcedureRecord } from "@/lib/types";

export const metadata: Metadata = {
  title: "Procedimentos",
  description: "Catalogo clinico com foco comercial e operacional."
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatMinutes(value: number) {
  return `${Math.round(value || 0)} min`;
}

const fallbackImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCB6Vnpn5-GpXY4X2ItYvcu2fsFzdW2ZgsnVCUq06MVignpb4H2A3br__pc7ZQHiOl8eBbJBpRH3IJqZg86afvAHX5yy4BX6upDb6IsukePfexhApcpP_DuDv8B0wj2HYCaE5-zLC2bOOHcaQ2TEXjzTrpbNvrKT2C6sS1q-HKCMJ9SgcpBAYuQk2nMJPh2c5Ou9AC4JXWpfYWsnD2PGW4PMmsCTqKXWrccM3nofUZulRCXlLdNJFGnztTTSmVp6CMuFZZ_8i2aNcSd";

export default async function ProceduresPage() {
  const procedures = await getProcedures();
  const activeCount = procedures.length;
  const highestValue =
    procedures.length > 0 ? Math.max(...procedures.map((item) => Number(item.valor || 0))) : 0;
  const avgDuration =
    procedures.length > 0
      ? procedures.reduce((acc, item) => acc + Number(item.duracao_minutos || 0), 0) /
        procedures.length
      : 0;
  const avgTicket =
    procedures.length > 0
      ? procedures.reduce((acc, item) => acc + Number(item.valor || 0), 0) / procedures.length
      : 0;

  return (
    <div className="space-y-5">
      <Reveal>
        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-6 md:p-8">
            <p className="eyebrow">Catalogo de servicos</p>
            <h1 className="font-headline mt-3 max-w-[14ch] text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
              Procedimentos reais conectados ao banco.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
              Edite os procedimentos existentes, cadastre novos e mantenha imagem, ticket e duracao
              sincronizados em um unico fluxo.
            </p>
          </Panel>

          <Panel className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            {[
              ["Servicos ativos", String(activeCount)],
              ["Maior ticket", formatCurrency(highestValue)],
              ["Tempo medio", formatMinutes(avgDuration)]
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

      <section className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Ticket medio atual: <span className="font-semibold text-foreground">{formatCurrency(avgTicket)}</span>
        </p>
        <Link
          href="/procedimentos/novo"
          className="hidden rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-ambient md:inline-flex"
        >
          Novo procedimento
        </Link>
      </section>

      {procedures.length ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {procedures.map((procedure, index) => (
            <Reveal key={procedure.id} delay={0.06 * (index + 1)}>
              <Panel className="h-full overflow-hidden p-0">
                <div className="relative h-40">
                  <img
                    src={procedure.imagem_url || fallbackImage}
                    alt={procedure.nome}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand">
                    {procedure.categoria || "Geral"}
                  </span>
                </div>
                <div className="space-y-5 p-6">
                  <div>
                    <h2 className="font-headline text-2xl font-semibold tracking-[-0.05em] text-foreground">
                      {procedure.nome}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {procedure.descricao || "Sem descricao detalhada."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.2rem] bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                        Duracao
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {formatMinutes(Number(procedure.duracao_minutos || 0))}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] bg-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                        Ticket
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {formatCurrency(Number(procedure.valor || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/procedimentos/${procedure.id}`}
                      className="flex-1 rounded-full bg-brand-gradient px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Ver detalhes
                    </Link>
                    <Link
                      href={`/procedimentos/${procedure.id}`}
                      className="rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </Panel>
            </Reveal>
          ))}
        </section>
      ) : (
        <Panel className="p-8 text-center">
          <h2 className="font-headline text-2xl font-semibold tracking-[-0.05em] text-foreground">
            Nenhum procedimento cadastrado
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Crie o primeiro procedimento para alimentar o catalogo.
          </p>
          <div className="mt-5">
            <Link
              href="/procedimentos/novo"
              className="inline-flex rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white"
            >
              Cadastrar primeiro procedimento
            </Link>
          </div>
        </Panel>
      )}

      <Link
        href="/procedimentos/novo"
        className="fixed bottom-24 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-3xl text-white shadow-ambient md:hidden"
        aria-label="Novo procedimento"
      >
        +
      </Link>
    </div>
  );
}

async function getProcedures(): Promise<ProcedureRecord[]> {
  if (!hasSupabaseEnv) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("procedimentos")
    .select("*")
    .eq("ativo", true)
    .order("nome", { ascending: true });

  return (data as ProcedureRecord[]) ?? [];
}
