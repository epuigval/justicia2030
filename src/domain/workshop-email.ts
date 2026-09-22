import { orderedCards } from "./catalog";
import { isValidSessionId } from "./session";
import type { CardId, WorkshopCard, WorkshopCollective, WorkshopConfig, WorkshopPhase } from "./types";

export interface PhaseResultRequest {
  sessionId: string;
  phaseId: string;
  collectiveId: string;
  selectedCardIds: CardId[];
}

export interface ValidatedPhaseResult extends PhaseResultRequest {
  phase: WorkshopPhase;
  collective: WorkshopCollective;
  cards: WorkshopCard[];
}

export interface WorkshopEmail {
  subject: string;
  text: string;
}

export function validatePhaseResultPayload(config: WorkshopConfig, payload: unknown): ValidatedPhaseResult | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const candidate = payload as Record<string, unknown>;
  if (!isValidSessionId(candidate.sessionId) || typeof candidate.phaseId !== "string" || typeof candidate.collectiveId !== "string" || !Array.isArray(candidate.selectedCardIds)) return null;
  if (candidate.selectedCardIds.length !== config.maxSelectionsPerPhase || candidate.selectedCardIds.some((id) => typeof id !== "string")) return null;

  const phase = config.phases.find((item) => item.id === candidate.phaseId);
  const collective = config.collectives.find((item) => item.id === candidate.collectiveId);
  if (!phase || !collective) return null;

  const selectedIds = candidate.selectedCardIds as string[];
  const uniqueIds = new Set(selectedIds);
  if (uniqueIds.size !== selectedIds.length) return null;

  const cards = orderedCards(config).filter((card) => uniqueIds.has(card.id));
  if (cards.length !== selectedIds.length || cards.some((card) => card.phaseId !== phase.id)) return null;

  return {
    sessionId: candidate.sessionId,
    phaseId: phase.id,
    collectiveId: collective.id,
    selectedCardIds: cards.map((card) => card.id),
    phase,
    collective,
    cards,
  };
}

export function createPhaseResultEmail(result: ValidatedPhaseResult): WorkshopEmail {
  return {
    subject: `Justicia 2030 · ${result.collective.name} · ${result.phase.name}`,
    text: [
      "JUSTICIA 2030",
      "",
      `Grupo: ${result.collective.name}`,
      "",
      `Fase: ${result.phase.name}`,
      "",
      "Tarjetas seleccionadas:",
      "",
      ...result.cards.map((card) => `- ${card.title}`),
    ].join("\n"),
  };
}
