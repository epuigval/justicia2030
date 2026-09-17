import { orderedCards, orderedPhases } from "./catalog";
import { isComplete } from "./selections";
import type { SelectionsByPhase, WorkshopConfig } from "./types";

export interface WorkshopEmail {
  subject: string;
  body: string;
  mailto: string;
}

export function createWorkshopEmail(
  config: WorkshopConfig,
  selections: SelectionsByPhase,
  teamName: string,
): WorkshopEmail | null {
  const normalizedTeamName = teamName.trim();
  if (!normalizedTeamName || !isComplete(config, selections)) return null;

  const subject = `${normalizedTeamName} - Resultados Workshop Justicia 2030`;
  const lines = [`Nombre equipo: ${normalizedTeamName}`, "", "Tarjetas seleccionadas:"];

  for (const phase of orderedPhases(config)) {
    lines.push(`Fase ${phase.order} - ${phase.name}:`);
    const selectedIds = new Set(selections[phase.id] ?? []);
    for (const card of orderedCards(config)) {
      if (card.phaseId === phase.id && selectedIds.has(card.id)) lines.push(`- ${card.title}`);
    }
    lines.push("");
  }

  const body = lines.join("\n").trimEnd();
  return {
    subject,
    body,
    mailto: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}