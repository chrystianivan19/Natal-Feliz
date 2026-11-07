import QRCode from "qrcode";

/** QR Code do payload Pix como SVG (gerado no servidor, sem serviço externo). */
export function qrPix(payload: string): Promise<string> {
  return QRCode.toString(payload, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: "#2B2620", light: "#FFFFFF" } });
}
