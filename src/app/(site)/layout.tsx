import { MargemCaderno, Folha } from "@/components/papel/Caderno";
import { MenuInferior } from "@/components/navegacao/MenuInferior";
import { BotaoAjuda } from "@/components/navegacao/BotaoAjuda";

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MargemCaderno />
      <MenuInferior />
      <BotaoAjuda />
      <Folha>
        <main>{children}</main>
      </Folha>
    </>
  );
}
