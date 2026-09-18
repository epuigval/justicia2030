import { orderedCards } from "./catalog";
import type { CardId, WorkshopCollective, WorkshopConfig, WorkshopPhase } from "./types";

export interface WorkshopEmail {
  subject: string;
  body: string;
  mailto: string;
}

export function createPhaseSelectionEmail(
  config: WorkshopConfig,
  selectedIds: CardId[],
  collective: WorkshopCollective,
  phase: WorkshopPhase,
): WorkshopEmail | null {
  const selected = new Set(selectedIds);
  const titles = orderedCards(config).filter((card) => card.phaseId === phase.id && selected.has(card.id)).map((card) => card.title);
  if (titles.length === 0) return null;

  const subject = `${collective.name} - ${phase.name}`;
  const body = [`Grupo: ${collective.name}`, `Fase: ${phase.name}`, "", "Tarjetas seleccionadas:", ...titles.map((title) => `- ${title}`)].join("\n");
  return {
    subject,
    body,
    mailto: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}