"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon } from "@/components/shared/icon";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="shell-surface fixed inset-x-3 bottom-3 z-40 rounded-[1.6rem] border border-border p-2 shadow-ambient lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-[1.25rem] px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
                active
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:bg-white/75"
              )}
            >
              <Icon name={item.icon} className="mb-1 size-[1.125rem]" />
              {item.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
