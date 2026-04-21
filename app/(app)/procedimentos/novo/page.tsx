import type { Metadata } from "next";

import { ProcedureEditor } from "@/components/procedures/procedure-editor";

export const metadata: Metadata = {
  title: "Novo procedimento",
  description: "Cadastro de novo servico no catalogo comercial."
};

export default function NewProcedurePage() {
  return <ProcedureEditor mode="create" />;
}
