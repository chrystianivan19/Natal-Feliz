import { dimensoesAlvo } from "./dimensoes";

const LIMITE = 300 * 1024;

/**
 * No navegador: reduz a foto para no máximo 1600 px de largura e WebP de ~300 KB.
 * Baixa a qualidade aos poucos até caber no limite (mínimo 0.5).
 */
export async function comprimirParaWebp(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const { largura, altura } = dimensoesAlvo(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  let qualidade = 0.85;
  let blob = await paraBlob(canvas, qualidade);
  while (blob.size > LIMITE && qualidade > 0.5) {
    qualidade -= 0.1;
    blob = await paraBlob(canvas, qualidade);
  }
  return blob;
}

function paraBlob(canvas: HTMLCanvasElement, qualidade: number) {
  return new Promise<Blob>((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error("Falha ao converter a imagem"))), "image/webp", qualidade),
  );
}

/** Envia a foto já comprimida para o storage do Supabase com a sessão do voluntário. */
export async function enviarFoto(
  supabase: { storage: { from: (b: string) => { upload: (p: string, f: Blob, o: object) => Promise<{ error: unknown }> } } },
  bucket: string,
  caminho: string,
  arquivo: File,
) {
  const blob = await comprimirParaWebp(arquivo);
  const { error } = await supabase.storage.from(bucket).upload(caminho, blob, {
    upsert: true,
    contentType: "image/webp",
    cacheControl: "3600",
  });
  if (error) throw new Error(`Falha ao enviar ${arquivo.name}`);
  return caminho;
}
