import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProcedureEditor } from "@/components/procedures/procedure-editor";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ProcedureRecord } from "@/lib/types";

type ProcedureDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: ProcedureDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const procedure = await getProcedureById(id);

  return {
    title: procedure ? procedure.nome : "Procedimento"
  };
}

export default async function ProcedureDetailPage({ params }: ProcedureDetailPageProps) {
  const { id } = await params;
  const procedure = await getProcedureById(id);

  if (!procedure) {
    notFound();
  }

  return <ProcedureEditor mode="edit" initialProcedure={procedure} />;
}

async function getProcedureById(id: string): Promise<ProcedureRecord | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("procedimentos").select("*").eq("id", id).maybeSingle();
  return (data as ProcedureRecord | null) ?? null;
}
