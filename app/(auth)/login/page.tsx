import Link from "next/link";
import type { Metadata } from "next";

import { Icon } from "@/components/shared/icon";
import { Panel } from "@/components/shared/panel";
import { Reveal } from "@/components/shared/reveal";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso ao painel clinico da Core Clinic."
};

const loginHighlights = [
  "Leitura executiva da agenda e da receita sem ruido.",
  "Base de pacientes organizada com foco em recorrencia.",
  "Catalogo de procedimentos com melhor clareza comercial."
];

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1360px] gap-8 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
      <Reveal className="relative overflow-hidden rounded-shell border border-border bg-brand-gradient px-6 py-10 text-white shadow-ambient md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_26%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-12">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-white/[0.66]">
              Core Clinic
            </p>
            <h1 className="font-headline mt-6 text-4xl font-semibold leading-tight tracking-[-0.06em] md:text-6xl">
              Operacao clinica com calma visual e leitura rapida.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/80 md:text-lg">
              A migracao para Next trouxe um shell unico, responsivo e pronto para
              evoluir com autenticacao, dados reais e componentes reutilizaveis.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {loginHighlights.map((item, index) => (
              <Reveal
                key={item}
                delay={0.08 * (index + 1)}
                className="rounded-[1.3rem] border border-white/[0.14] bg-white/10 p-4 backdrop-blur"
              >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-2xl bg-white/[0.14]">
                  <Icon name="spark" className="size-4 text-white" />
                </div>
                <p className="text-sm leading-6 text-white/[0.84]">{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="flex items-center justify-center">
        <Reveal delay={0.08} className="w-full max-w-[34rem]">
          <Panel className="overflow-hidden p-0">
            <div className="border-b border-border px-6 py-6 md:px-8">
              <p className="eyebrow">Acesso seguro</p>
              <h2 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                Bem-vindo de volta
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Entre para continuar a operar a clinica a partir da nova base em
                Next.js App Router.
              </p>
            </div>

            <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                  E-mail
                </span>
                <input
                  type="email"
                  placeholder="nome@clinica.com"
                  className="w-full rounded-full border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                  Senha
                </span>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full rounded-full border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                />
              </label>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <label className="flex items-center gap-3">
                  <span className="flex size-5 items-center justify-center rounded-md border border-border bg-white text-brand">
                    <Icon name="check" className="size-3" />
                  </span>
                  Manter sessao ativa
                </label>
                <button type="button" className="font-semibold text-brand">
                  Recuperar acesso
                </button>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-4 font-semibold text-white shadow-ambient transition hover:translate-y-[-1px]"
              >
                Entrar no painel
                <Icon name="arrowRight" className="size-4" />
              </button>

              <div className="rounded-[1.35rem] bg-muted px-4 py-4 text-sm leading-6 text-muted-foreground">
                {hasSupabaseEnv ? (
                  <span>
                    Credenciais do Supabase detectadas. O proximo passo e ligar
                    autenticacao real ao formulario.
                  </span>
                ) : (
                  <span>
                    Modo demonstracao ativo. Configure{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 text-xs text-foreground">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>{" "}
                    e{" "}
                    <code className="rounded bg-white px-1.5 py-0.5 text-xs text-foreground">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>{" "}
                    para plugar o backend real.
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Ver dashboard
                </Link>
                <Link
                  href="/pacientes"
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Ver pacientes
                </Link>
              </div>
            </form>
          </Panel>
        </Reveal>
      </div>
    </main>
  );
}
