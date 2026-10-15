import { parseCompleteIndividualParticipationPayload } from "@/domain/individual-participation";
import { completeIndividualParticipation } from "@/server/individual-participations";
import { readJsonRequest } from "@/server/json-request";
import { SupabaseIndividualParticipationStore } from "@/server/supabase-individual-participation-store";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4_096;
const INVALID_REQUEST = { error: "Solicitud no válida." };
const TOO_LARGE = { error: "Solicitud demasiado grande." };
const TOKEN_ERROR = { error: "Token de escritura no válido." };
const NOT_FOUND = { error: "Participación o catálogo no disponible." };
const CONFLICT = { error: "La participación ya fue finalizada con otro contenido." };
const SERVER_ERROR = { error: "No se pudo finalizar la participación." };

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await readJsonRequest(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return Response.json(body.reason === "too_large" ? TOO_LARGE : INVALID_REQUEST, {
      status: body.reason === "too_large" ? 413 : 400,
    });
  }

  const input = parseCompleteIndividualParticipationPayload(id, body.value);
  if (!input) return Response.json(INVALID_REQUEST, { status: 400 });

  try {
    const result = await completeIndividualParticipation(new SupabaseIndividualParticipationStore(), input);

    if (result.kind === "invalid_selection") return Response.json(INVALID_REQUEST, { status: 400 });
    if (result.kind === "token_mismatch") return Response.json(TOKEN_ERROR, { status: 403 });
    if (result.kind === "not_found" || result.kind === "catalog_not_found") {
      return Response.json(NOT_FOUND, { status: 404 });
    }
    if (result.kind === "payload_conflict" || result.kind === "state_conflict") {
      return Response.json(CONFLICT, { status: 409 });
    }

    return Response.json({
      participationId: result.participationId,
      status: "completed",
      resultCode: result.resultCode,
      completedAt: result.completedAt,
      idempotent: result.idempotent,
    });
  } catch {
    console.error("individual_participation_completion_failed");
    return Response.json(SERVER_ERROR, { status: 500 });
  }
}
