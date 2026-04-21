import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import "@/app/globals.css";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "Core Clinic Gestao",
    template: "%s | Core Clinic Gestao"
  },
  description:
    "Plataforma de gestao empresarial para agenda, pacientes, servicos e receita.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
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
