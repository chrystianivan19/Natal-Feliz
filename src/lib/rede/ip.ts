import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** IP de quem chamou, com sal, em hash: serve só para limitar tentativas. */
export async function hashIp() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}:${process.env.IP_HASH_SALT ?? ""}`).digest("hex");
}
