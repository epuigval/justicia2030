import { parseStartIndividualParticipationPayload } from "@/domain/individual-participation";
import { startIndividualParticipation } from "@/server/individual-participations";
import { readJsonRequest } from "@/server/json-request";
import { SupabaseIndividualParticipationStore } from "@/server/supabase-individual-participation-store";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 4_096;
const INVALID_REQUEST = { error: "Solicitud no válida." };
const TOO_LARGE = { error: "Solicitud demasiado grande." };
const CATALOG_NOT_FOUND = { error: "Colectivo o subperfil no disponible." };
const CONFLICT = { error: "El identificador ya pertenece a otra participación." };
const SERVER_ERROR = { error: "No se pudo iniciar la participación." };

export async function POST(request: Request) {
  const body = await readJsonRequest(request, MAX_BODY_BYTES);
  if (!body.ok) {
    return Response.json(body.reason === "too_large" ? TOO_LARGE : INVALID_REQUEST, {
      status: body.reason === "too_large" ? 413 : 400,
    });
  }

  const input = parseStartIndividualParticipationPayload(body.value);
  if (!input) return Response.json(INVALID_REQUEST, { status: 400 });

  try {
    const result = await startIndividualParticipation(new SupabaseIndividualParticipationStore(), input);

    if (result.kind === "catalog_not_found") return Response.json(CATALOG_NOT_FOUND, { status: 404 });
    if (result.kind === "conflict") return Response.json(CONFLICT, { status: 409 });

    return Response.json({
      participationId: result.participationId,
      status: result.status,
      idempotent: result.kind === "existing",
    }, { status: result.kind === "created" ? 201 : 200 });
  } catch {
    console.error("individual_participation_start_failed");
    return Response.json(SERVER_ERROR, { status: 500 });
  }
}
