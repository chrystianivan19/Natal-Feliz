import type { Metadata } from "next";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Painel dos voluntários", robots: { index: false, follow: false } };

export default function PaginaLogin() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
      <div>
        <p className="manuscrita text-2xl text-vermelho">Natal Feliz</p>
        <h1 className="text-5xl">Painel dos voluntários</h1>
      </div>
      <FormLogin />
    </div>
  );
}
