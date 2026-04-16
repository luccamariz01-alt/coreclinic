import type { ReactNode } from "react";

import { hasSupabaseEnv } from "@/lib/env";

import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-5 px-3 pb-28 pt-5 md:px-5 lg:pb-6">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Topbar demoMode={!hasSupabaseEnv} />
        <main className="flex-1">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
