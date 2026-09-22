import { orderedCards } from "./catalog";
import { isValidSessionId } from "./session";
import type { CardId, WorkshopCard, WorkshopConfig, WorkshopPhase } from "./types";

export interface PhaseResultRequest {
  sessionId: string;
  phaseId: string;
  selectedCardIds: CardId[];
}

export interface ValidatedPhaseResult extends PhaseResultRequest {
  phase: WorkshopPhase;
  cards: WorkshopCard[];
}

export interface WorkshopEmail {
  subject: string;
  text: string;
}

export function validatePhaseResultPayload(config: WorkshopConfig, payload: unknown): ValidatedPhaseResult | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const candidate = payload as Record<string, unknown>;
  if (!isValidSessionId(candidate.sessionId) || typeof candidate.phaseId !== "string" || !Array.isArray(candidate.selectedCardIds)) return null;
  if (candidate.selectedCardIds.length !== config.maxSelectionsPerPhase || candidate.selectedCardIds.some((id) => typeof id !== "string")) return null;

  const phase = config.phases.find((item) => item.id === candidate.phaseId);
  if (!phase) return null;

  const selectedIds = candidate.selectedCardIds as string[];
  const uniqueIds = new Set(selectedIds);
  if (uniqueIds.size !== selectedIds.length) return null;

  const cards = orderedCards(config).filter((card) => uniqueIds.has(card.id));
  if (cards.length !== selectedIds.length || cards.some((card) => card.phaseId !== phase.id)) return null;

  return {
    sessionId: candidate.sessionId,
    phaseId: phase.id,
    selectedCardIds: cards.map((card) => card.id),
    phase,
    cards,
  };
}

export function createPhaseResultEmail(result: ValidatedPhaseResult): WorkshopEmail {
  return {
    subject: `Justicia 2030 · ${result.phase.name}`,
    text: [
      "JUSTICIA 2030",
      "",
      "Fase:",
      result.phase.name,
      "",
      "Tarjetas seleccionadas:",
      "",
      ...result.cards.map((card) => `- ${card.title}`),
    ].join("\n"),
  };
}
