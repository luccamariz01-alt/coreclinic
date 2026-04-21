import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10">
      <section className="panel-surface w-full rounded-shell p-8 text-center md:p-12">
        <p className="eyebrow">Rota nao encontrada</p>
        <h1 className="font-headline mt-4 text-4xl font-semibold tracking-[-0.06em] text-foreground">
          Essa tela nao existe na nova estrutura.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          A migracao consolidou as telas antigas em rotas responsivas. Volte para
          o dashboard e siga dali.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="cta-primary interactive-surface rounded-full px-5 py-3 text-sm font-semibold"
          >
            Ir para dashboard
          </Link>
          <Link
            href="/login"
            className="interactive-surface card-surface rounded-full px-5 py-3 text-sm font-semibold text-foreground"
          >
            Ir para login
          </Link>
        </div>
      </section>
    </main>
  );
}
