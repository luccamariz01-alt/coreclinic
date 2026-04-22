"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
          <section className="panel-surface w-full rounded-shell p-8 text-center md:p-12">
            <p className="eyebrow">Erro inesperado</p>
            <h1 className="font-headline mt-4 text-3xl font-semibold tracking-[-0.06em] text-foreground md:text-4xl">
              Nao foi possivel carregar esta tela.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
              A aplicacao encontrou um erro durante a renderizacao. Tente recarregar
              ou voltar para uma rota segura.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="cta-primary interactive-surface rounded-full px-5 py-3 text-sm font-semibold"
              >
                Tentar novamente
              </button>
              <Link
                href="/login"
                className="interactive-surface card-surface rounded-full px-5 py-3 text-sm font-semibold text-foreground"
              >
                Ir para login
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
