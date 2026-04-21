import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "@/app/globals.css";
import { metadataBase } from "@/lib/env";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const headlineFont = Sora({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Core Clinic Gestao",
    template: "%s | Core Clinic Gestao"
  },
  description:
    "Plataforma de gestao empresarial para agenda, pacientes, servicos e receita.",
  metadataBase,
  openGraph: {
    title: "Core Clinic Gestao",
    description:
      "Painel executivo para controle operacional, comercial e financeiro da operacao.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headlineFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
