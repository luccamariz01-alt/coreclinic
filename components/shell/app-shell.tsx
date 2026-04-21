import type { ReactNode } from "react";

import { hasSupabaseEnv } from "@/lib/env";

import { MobileNav } from "@/components/shell/mobile-nav";
import { RouteTransition } from "@/components/shell/route-transition";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1640px] gap-4 px-3 pb-28 pt-4 md:gap-5 md:px-5 lg:pb-6">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-5">
        <Topbar demoMode={!hasSupabaseEnv} />
        <RouteTransition>{children}</RouteTransition>
      </div>

      <MobileNav />
    </div>
  );
}
