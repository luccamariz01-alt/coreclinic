import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUserSafe } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesso ao painel de gestao da Core Clinic."
};

export default async function LoginPage() {
  if (hasSupabaseEnv) {
    const user = await getCurrentUserSafe();

    if (user) {
      redirect("/dashboard");
    }
  }

  return <LoginForm hasSupabaseEnv={hasSupabaseEnv} />;
}
