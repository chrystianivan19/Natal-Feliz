import type { Metadata, Viewport } from "next";
import { Caveat, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--fonte-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--fonte-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://natalfeliz2026.vercel.app"),
  title: {
    default: "NATAL FELIZ – 4ª Edição · Gama-DF",
    template: "%s · NATAL FELIZ",
  },
  description:
    "Crianças do Gama escreveram cartinhas de Natal. Escolha uma, compre o presente e entregue até 23/12 num ponto de coleta.",
};

export const viewport: Viewport = {
  themeColor: "#fbf6ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${caveat.variable} ${sourceSerif.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
