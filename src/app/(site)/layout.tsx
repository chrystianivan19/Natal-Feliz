import { MargemCaderno, Folha } from "@/components/papel/Caderno";
import { MenuInferior } from "@/components/navegacao/MenuInferior";

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MargemCaderno />
      <MenuInferior />
      <Folha>
        <main>{children}</main>
      </Folha>
    </>
  );
}
