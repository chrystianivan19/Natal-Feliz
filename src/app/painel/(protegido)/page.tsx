import { redirect } from "next/navigation";

// Sem etapa de aprovação: a tela inicial do painel é a lista de padrinhos.
export default function InicioPainel() {
  redirect("/painel/padrinhos");
}
