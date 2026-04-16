"use client";

import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/shared/icon";
import { getRouteMeta } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/client";

type TopbarProps = {
  demoMode: boolean;
};

export function Topbar({ demoMode }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const meta = getRouteMeta(pathname);

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  }

  return (
    <header className="shell-surface sticky top-4 z-30 rounded-shell border border-border px-4 py-4 shadow-soft md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">{meta.eyebrow}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="font-headline text-2xl font-semibold tracking-[-0.05em] text-foreground md:text-3xl">
              {meta.title}
            </h2>
            {demoMode ? (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                Demo mode
              </span>
            ) : null}
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {meta.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[16rem] items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-muted-foreground">
            <Icon name="search" className="size-4" />
            <input
              aria-label="Buscar"
              placeholder="Buscar paciente, agenda ou procedimento"
              className="w-full border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground"
            />
          </label>

          <button className="flex size-11 items-center justify-center rounded-full border border-border bg-white/80 text-muted-foreground transition hover:border-brand/20 hover:text-brand">
            <Icon name="bell" />
          </button>

          {!demoMode ? (
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="rounded-full border border-border bg-white/80 px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:border-brand/20 hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saindo..." : "Sair"}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
