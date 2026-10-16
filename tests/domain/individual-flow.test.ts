import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import {
  hasCompleteIndividualSelections,
  nextIncompleteIndividualPhase,
} from "@/domain/individual-flow";
import type { SelectionsByPhase } from "@/domain/types";

function emptySelections(): SelectionsByPhase {
  return Object.fromEntries(workshopConfig.phases.map((phase) => [phase.id, []]));
}

function completePhase(phaseId: keyof SelectionsByPhase): string[] {
  return workshopConfig.cards
    .filter((card) => card.phaseId === phaseId)
    .slice(0, 3)
    .map((card) => card.id);
}

describe("navegación libre del flujo Individual", () => {
  it("completa en orden 1 → 2 → 3 y detecta la última fase por estado", () => {
    const selections = emptySelections();
    selections["justicia-actual"] = completePhase("justicia-actual");
    expect(nextIncompleteIndividualPhase(selections, "justicia-actual")).toBe("justicia-conectada");

    selections["justicia-conectada"] = completePhase("justicia-conectada");
    expect(nextIncompleteIndividualPhase(selections, "justicia-conectada")).toBe("justicia-inteligente");

    selections["justicia-inteligente"] = completePhase("justicia-inteligente");
    expect(nextIncompleteIndividualPhase(selections, "justicia-inteligente")).toBeNull();
    expect(hasCompleteIndividualSelections(selections)).toBe(true);
  });

  it("completa en orden 3 → 1 → 2 y termina en resultado", () => {
    const selections = emptySelections();
    selections["justicia-inteligente"] = completePhase("justicia-inteligente");
    expect(nextIncompleteIndividualPhase(selections, "justicia-inteligente")).toBe("justicia-actual");

    selections["justicia-actual"] = completePhase("justicia-actual");
    expect(nextIncompleteIndividualPhase(selections, "justicia-actual")).toBe("justicia-conectada");

    selections["justicia-conectada"] = completePhase("justicia-conectada");
    expect(nextIncompleteIndividualPhase(selections, "justicia-conectada")).toBeNull();
    expect(hasCompleteIndividualSelections(selections)).toBe(true);
  });

  it("completa en orden 2 → 3 → 1 y termina en resultado", () => {
    const selections = emptySelections();
    selections["justicia-conectada"] = completePhase("justicia-conectada");
    expect(nextIncompleteIndividualPhase(selections, "justicia-conectada")).toBe("justicia-inteligente");

    selections["justicia-inteligente"] = completePhase("justicia-inteligente");
    expect(nextIncompleteIndividualPhase(selections, "justicia-inteligente")).toBe("justicia-actual");

    selections["justicia-actual"] = completePhase("justicia-actual");
    expect(nextIncompleteIndividualPhase(selections, "justicia-actual")).toBeNull();
    expect(hasCompleteIndividualSelections(selections)).toBe(true);
  });
});
