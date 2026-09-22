import { workshopConfig } from "@/config/workshop";
import { validatePhaseResultPayload } from "@/domain/workshop-email";
import { readPhaseResultEmailConfig, sendPhaseResultEmail } from "@/server/phase-result-email";

export const runtime = "nodejs";

const INVALID_REQUEST = { error: "Solicitud no válida." };
const SEND_ERROR = { error: "No se pudieron enviar los resultados." };

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(INVALID_REQUEST, { status: 400 });
  }

  const result = validatePhaseResultPayload(workshopConfig, payload);
  if (!result) return Response.json(INVALID_REQUEST, { status: 400 });

  const emailConfig = readPhaseResultEmailConfig();
  if (!emailConfig) return Response.json(SEND_ERROR, { status: 500 });

  try {
    if (!await sendPhaseResultEmail(emailConfig, result)) {
      console.error("resend_send_failed");
      return Response.json(SEND_ERROR, { status: 500 });
    }
  } catch {
    console.error("resend_send_failed");
    return Response.json(SEND_ERROR, { status: 500 });
  }

  return Response.json({ ok: true });
}
