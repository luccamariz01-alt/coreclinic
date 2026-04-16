import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export default function AuthenticatedLayout({
  children
}: {
  children: ReactNode;
}) {
  if (hasSupabaseEnv) {
    return <AuthenticatedLayoutWithSession>{children}</AuthenticatedLayoutWithSession>;
  }

  return <AppShell>{children}</AppShell>;
}

async function AuthenticatedLayoutWithSession({
  children
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
