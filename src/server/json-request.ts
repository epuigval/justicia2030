import "server-only";

export type JsonRequestResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "invalid" | "too_large" };

export async function readJsonRequest(request: Request, maxBytes: number): Promise<JsonRequestResult> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxBytes) return { ok: false, reason: "too_large" };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) return { ok: false, reason: "too_large" };

  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}
