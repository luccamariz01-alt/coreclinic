"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SupportedTable = "pacientes" | "procedimentos" | "agendamentos";

type DeleteEntityActionProps = {
  table: SupportedTable;
  id: string;
  entityLabel: string;
  redirectTo?: string;
};

export function DeleteEntityAction({
  table,
  id,
  entityLabel,
  redirectTo
}: DeleteEntityActionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDelete() {
    startTransition(async () => {
      setErrorMessage(null);

      const supabase = createClient();
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.refresh();
      }
    });
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 transition hover:bg-rose-100"
      >
        Excluir
      </button>
    );
  }

  return (
    <div className="rounded-[1rem] border border-rose-200 bg-rose-50 p-4">
      <p className="text-sm font-semibold text-rose-800">Confirmar exclusao</p>
      <p className="mt-2 text-sm leading-6 text-rose-700">
        Esta acao remove <strong>{entityLabel}</strong> de forma permanente.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Excluindo..." : "Confirmar exclusao"}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setErrorMessage(null);
          }}
          disabled={isPending}
          className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-3 text-xs leading-5 text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}
