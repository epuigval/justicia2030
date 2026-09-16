import { orderedCards, orderedPhases } from "./catalog";
import type { CardId, PhaseId, SelectionsByPhase, WorkshopConfig } from "./types";

export function createEmptySelections(config: WorkshopConfig): SelectionsByPhase {
  return Object.fromEntries(orderedPhases(config).map((phase) => [phase.id, []]));
}

export function canonicalizeSelections(config: WorkshopConfig, selections: SelectionsByPhase): SelectionsByPhase {
  const order = new Map(orderedCards(config).map((card, index) => [card.id, index]));
  return Object.fromEntries(
    orderedPhases(config).map((phase) => {
      const unique = [...new Set(selections[phase.id] ?? [])];
      return [phase.id, unique.sort((a, b) => (order.get(a) ?? Infinity) - (order.get(b) ?? Infinity))];
    }),
  );
}

export function selectCard(config: WorkshopConfig, selections: SelectionsByPhase, phaseId: PhaseId, cardId: CardId): SelectionsByPhase {
  const card = config.cards.find((item) => item.id === cardId);
  const current = selections[phaseId] ?? [];
  if (!card || card.phaseId !== phaseId || current.includes(cardId) || current.length >= config.maxSelectionsPerPhase) return selections;
  return canonicalizeSelections(config, { ...selections, [phaseId]: [...current, cardId] });
}

export function deselectCard(config: WorkshopConfig, selections: SelectionsByPhase, phaseId: PhaseId, cardId: CardId): SelectionsByPhase {
  const current = selections[phaseId] ?? [];
  if (!current.includes(cardId)) return selections;
  return canonicalizeSelections(config, { ...selections, [phaseId]: current.filter((id) => id !== cardId) });
}

export function toggleCard(config: WorkshopConfig, selections: SelectionsByPhase, phaseId: PhaseId, cardId: CardId): SelectionsByPhase {
  return (selections[phaseId] ?? []).includes(cardId)
    ? deselectCard(config, selections, phaseId, cardId)
    : selectCard(config, selections, phaseId, cardId);
}

export function totalSelected(selections: SelectionsByPhase): number {
  return Object.values(selections).reduce((total, ids) => total + ids.length, 0);
}

export function isComplete(config: WorkshopConfig, selections: SelectionsByPhase): boolean {
  return orderedPhases(config).every((phase) => (selections[phase.id] ?? []).length === config.maxSelectionsPerPhase);
}

export function incompletePhaseIds(config: WorkshopConfig, selections: SelectionsByPhase): PhaseId[] {
  return orderedPhases(config)
    .filter((phase) => (selections[phase.id] ?? []).length !== config.maxSelectionsPerPhase)
    .map((phase) => phase.id);
}
