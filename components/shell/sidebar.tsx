"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/shared/icon";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="shell-surface sticky top-4 hidden h-[calc(100vh-2rem)] w-[17rem] shrink-0 rounded-shell border border-border p-3.5 shadow-soft lg:flex lg:flex-col">
      <div className="rounded-[1.2rem] bg-gradient-to-br from-brand via-brand to-brand-soft p-5 text-brand-contrast shadow-ambient">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          Core Clinic Gestao
        </p>
        <h1 className="font-headline mt-3 text-2xl font-semibold tracking-[-0.045em]">
          Gestao empresarial com leitura rapida.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/[0.82]">
          Operacao, clientes e receita conectados em uma visao unica.
        </p>
      </div>

      <nav className="mt-5 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "interactive-surface flex items-center gap-3 rounded-[1rem] border border-transparent px-4 py-3 text-sm font-semibold",
                active
                  ? "border-brand/15 bg-white text-brand shadow-soft"
                  : "text-muted-foreground hover:border-border hover:bg-white/78"
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl border",
                  active
                    ? "border-brand/20 bg-brand/[0.12] text-brand"
                    : "border-border bg-white/70 text-muted-foreground"
                )}
              >
                <Icon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="panel-surface rounded-[1rem] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
          Unidade ativa
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white">
            LC
          </div>
          <div>
            <p className="font-semibold text-foreground">Lucca Clinic</p>
            <p className="text-sm text-muted-foreground">Gestao operacional</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
