"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Panel } from "@/components/shared/panel";
import { createClient } from "@/lib/supabase/client";
import type { ProcedureRecord } from "@/lib/types";

const categories = [
  "Estetica Facial",
  "Injetaveis",
  "Renovacao",
  "Harmonizacao",
  "Corporal",
  "Capilar",
  "Geral"
];

type ProcedureEditorProps = {
  mode: "create" | "edit";
  initialProcedure?: ProcedureRecord;
};

type FormState = {
  nome: string;
  descricao: string;
  categoria: string;
  valor: string;
  duracao: string;
  caracteristicas: string;
  preparacao: string;
  cuidadosPos: string;
};

function mapInitialState(initialProcedure?: ProcedureRecord): FormState {
  return {
    nome: initialProcedure?.nome ?? "",
    descricao: initialProcedure?.descricao ?? "",
    categoria: initialProcedure?.categoria ?? "",
    valor:
      typeof initialProcedure?.valor === "number"
        ? initialProcedure.valor.toFixed(2).replace(".", ",")
        : "",
    duracao:
      typeof initialProcedure?.duracao_minutos === "number"
        ? String(initialProcedure.duracao_minutos)
        : "",
    caracteristicas: initialProcedure?.caracteristicas ?? "",
    preparacao: initialProcedure?.preparacao ?? "",
    cuidadosPos: initialProcedure?.cuidados_pos ?? ""
  };
}

function sanitizeMoney(value: string) {
  return Number(value.replace(/\./g, "").replace(",", ".")) || 0;
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  const byMime = file.type.split("/")[1];
  return byMime || "jpg";
}

export function ProcedureEditor({ mode, initialProcedure }: ProcedureEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(mapInitialState(initialProcedure));
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; message: string } | null>(
    null
  );

  const previewUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }

    return initialProcedure?.imagem_url ?? null;
  }, [initialProcedure?.imagem_url, selectedImage]);

  useEffect(() => {
    if (!selectedImage || !previewUrl) return;
    const objectUrl = previewUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [previewUrl, selectedImage]);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadProcedureImage(supabase: ReturnType<typeof createClient>, procedureId: string) {
    if (!selectedImage) return null;

    const ext = getFileExtension(selectedImage);
    const filePath = `procedimentos/${procedureId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("procedimentos-imagens")
      .upload(filePath, selectedImage, {
        upsert: true,
        contentType: selectedImage.type
      });

    if (uploadError) {
      throw new Error(`Falha no upload da imagem: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("procedimentos-imagens").getPublicUrl(filePath);
    return data.publicUrl;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.nome.trim()) {
      setFeedback({ type: "error", message: "Nome do procedimento e obrigatorio." });
      return;
    }

    startTransition(async () => {
      try {
        setFeedback(null);
        const supabase = createClient();

        const basePayload = {
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          categoria: form.categoria.trim() || null,
          valor: sanitizeMoney(form.valor),
          duracao_minutos: Number(form.duracao) || 0,
          caracteristicas: form.caracteristicas.trim() || null,
          preparacao: form.preparacao.trim() || null,
          cuidados_pos: form.cuidadosPos.trim() || null
        };

        let procedureId = initialProcedure?.id;

        if (mode === "edit" && procedureId) {
          const payloadWithImage = { ...basePayload } as Record<string, string | number | null>;
          if (selectedImage) {
            payloadWithImage.imagem_url = await uploadProcedureImage(supabase, procedureId);
          }

          const { error } = await supabase
            .from("procedimentos")
            .update(payloadWithImage)
            .eq("id", procedureId);

          if (error) throw new Error(error.message);
        } else {
          const { data, error } = await supabase
            .from("procedimentos")
            .insert({ ...basePayload, ativo: true })
            .select("*")
            .single();

          if (error || !data) throw new Error(error?.message || "Falha ao criar procedimento.");
          procedureId = data.id;

          if (selectedImage) {
            const imageUrl = await uploadProcedureImage(supabase, procedureId as string);
            const { error: imageUpdateError } = await supabase
              .from("procedimentos")
              .update({ imagem_url: imageUrl })
              .eq("id", procedureId);

            if (imageUpdateError) throw new Error(imageUpdateError.message);
          }
        }

        setFeedback({ type: "ok", message: "Procedimento salvo com sucesso." });
        router.replace(`/procedimentos/${procedureId}`);
        router.refresh();
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro ao salvar procedimento."
        });
      }
    });
  }

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden p-0">
        <div className="h-44 bg-[radial-gradient(circle_at_top_left,rgba(198,91,131,0.42),transparent_30%),linear-gradient(135deg,#8f274c_0%,#c65b83_100%)]" />
        <div className="px-6 py-6 md:px-8">
          <p className="eyebrow">{mode === "edit" ? "Editar procedimento" : "Novo procedimento"}</p>
          <h1 className="font-headline mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
            {mode === "edit" ? form.nome || "Atualizar dados" : "Cadastrar no catalogo"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            Use esta pagina para manter seu catalogo sincronizado com o banco real e com imagem de capa.
          </p>
        </div>
      </Panel>

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-5 p-6 md:p-8">
          <p className="eyebrow">Imagem</p>
          <div className="relative overflow-hidden rounded-[1.35rem] border border-border bg-muted">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview do procedimento"
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="flex h-72 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(198,91,131,0.16),transparent_30%),linear-gradient(135deg,rgba(143,39,76,0.08)_0%,rgba(198,91,131,0.18)_100%)] px-6 text-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand/60">
                    Nenhuma capa cadastrada
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Envie uma imagem para salvar este procedimento com capa no catalogo.
                  </p>
                </div>
              </div>
            )}
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
              Arquivo
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
              className="block w-full rounded-[1rem] border border-border bg-white px-4 py-3 text-sm text-muted-foreground"
            />
          </label>

          <p className="text-xs leading-6 text-muted-foreground">
            Bucket esperado: <code>procedimentos-imagens</code>. Formatos recomendados: JPG, PNG ou WEBP.
          </p>
        </Panel>

        <Panel className="space-y-5 p-6 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Nome
              </span>
              <input
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                placeholder="Nome do procedimento"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Valor (R$)
              </span>
              <input
                value={form.valor}
                onChange={(event) => updateField("valor", event.target.value)}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                placeholder="0,00"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Duracao (min)
              </span>
              <input
                type="number"
                value={form.duracao}
                onChange={(event) => updateField("duracao", event.target.value)}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                placeholder="0"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Categoria
              </span>
              <select
                value={form.categoria}
                onChange={(event) => updateField("categoria", event.target.value)}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
              >
                <option value="">Selecionar categoria</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Descricao
              </span>
              <textarea
                value={form.descricao}
                onChange={(event) => updateField("descricao", event.target.value)}
                rows={4}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
                placeholder="Descreva o procedimento"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Caracteristicas
              </span>
              <textarea
                value={form.caracteristicas}
                onChange={(event) => updateField("caracteristicas", event.target.value)}
                rows={4}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Preparacao
              </span>
              <textarea
                value={form.preparacao}
                onChange={(event) => updateField("preparacao", event.target.value)}
                rows={4}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-brand/60">
                Cuidados pos-procedimento
              </span>
              <textarea
                value={form.cuidadosPos}
                onChange={(event) => updateField("cuidadosPos", event.target.value)}
                rows={4}
                className="w-full rounded-[1rem] border border-border bg-white px-5 py-4 outline-none transition focus:border-brand/30 focus:ring-4 focus:ring-brand/10"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-ambient disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Salvando..." : "Salvar alteracoes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/procedimentos")}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground"
            >
              Voltar para lista
            </button>
          </div>

          {feedback ? (
            <div
              className={
                feedback.type === "ok"
                  ? "rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                  : "rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              }
            >
              {feedback.message}
            </div>
          ) : null}
        </Panel>
      </form>
    </div>
  );
}
