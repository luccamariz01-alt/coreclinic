import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProcedureEditor } from "@/components/procedures/procedure-editor";
import { DeleteEntityAction } from "@/components/shared/delete-entity-action";
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

  return (
    <div className="space-y-5">
      <ProcedureEditor mode="edit" initialProcedure={procedure} />

      <section className="card-surface rounded-[1.2rem] border border-rose-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          Zona de risco
        </p>
        <h2 className="mt-2 text-lg font-semibold text-rose-900">Excluir procedimento</h2>
        <p className="mt-2 text-sm leading-6 text-rose-800">
          Ao excluir, este procedimento sai do catalogo imediatamente.
        </p>
        <div className="mt-4">
          <DeleteEntityAction
            table="procedimentos"
            id={procedure.id}
            entityLabel={`o procedimento ${procedure.nome}`}
            redirectTo="/procedimentos"
          />
        </div>
      </section>
    </div>
  );
}

async function getProcedureById(id: string): Promise<ProcedureRecord | null> {
  if (!hasSupabaseEnv) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("procedimentos").select("*").eq("id", id).maybeSingle();
  return (data as ProcedureRecord | null) ?? null;
}
