import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { createEmptySelections, deselectCard, incompletePhaseIds, isComplete, selectCard, toggleCard, totalSelected } from "@/domain/selections";

describe("reglas de selección", () => {
  const phase = workshopConfig.phases[0];
  const phaseCards = workshopConfig.cards.filter((card) => card.phaseId === phase.id);

  it("selecciona desde cero hasta el máximo configurado", () => {
    let state = createEmptySelections(workshopConfig);
    for (const card of phaseCards.slice(0, workshopConfig.maxSelectionsPerPhase)) state = selectCard(workshopConfig, state, phase.id, card.id);
    expect(state[phase.id]).toHaveLength(workshopConfig.maxSelectionsPerPhase);
  });

  it("impide una cuarta selección con el fixture", () => {
    let state = createEmptySelections(workshopConfig);
    for (const card of phaseCards.slice(0, 4)) state = selectCard(workshopConfig, state, phase.id, card.id);
    expect(state[phase.id]).toHaveLength(workshopConfig.maxSelectionsPerPhase);
    expect(state[phase.id]).not.toContain(phaseCards[3].id);
  });

  it("permite desactivar el límite para el dinamizador", () => {
    let state = createEmptySelections(workshopConfig);
    for (const card of phaseCards) state = selectCard(workshopConfig, state, phase.id, card.id, null);
    expect(state[phase.id]).toHaveLength(phaseCards.length);
  });

  it("no crea duplicados", () => {
    let state = createEmptySelections(workshopConfig);
    state = selectCard(workshopConfig, state, phase.id, phaseCards[0].id);
    state = selectCard(workshopConfig, state, phase.id, phaseCards[0].id);
    expect(state[phase.id]).toEqual([phaseCards[0].id]);
  });

  it("deselecciona y alterna", () => {
    let state = selectCard(workshopConfig, createEmptySelections(workshopConfig), phase.id, phaseCards[0].id);
    state = deselectCard(workshopConfig, state, phase.id, phaseCards[0].id);
    expect(state[phase.id]).toEqual([]);
    state = toggleCard(workshopConfig, state, phase.id, phaseCards[0].id);
    expect(state[phase.id]).toEqual([phaseCards[0].id]);
  });

  it("mantiene independencia entre fases", () => {
    const other = workshopConfig.phases[1];
    const otherCard = workshopConfig.cards.find((card) => card.phaseId === other.id)!;
    const state = selectCard(workshopConfig, createEmptySelections(workshopConfig), other.id, otherCard.id);
    expect(state[phase.id]).toEqual([]);
    expect(state[other.id]).toEqual([otherCard.id]);
  });

  it("rechaza tarjetas de otra fase", () => {
    const otherCard = workshopConfig.cards.find((card) => card.phaseId !== phase.id)!;
    const state = createEmptySelections(workshopConfig);
    expect(selectCard(workshopConfig, state, phase.id, otherCard.id)).toBe(state);
  });

  it("usa orden canónico y no el orden de clic", () => {
    let state = createEmptySelections(workshopConfig);
    state = selectCard(workshopConfig, state, phase.id, phaseCards[2].id);
    state = selectCard(workshopConfig, state, phase.id, phaseCards[0].id);
    expect(state[phase.id]).toEqual([phaseCards[0].id, phaseCards[2].id]);
  });

  it("calcula completitud y progreso desde la configuración", () => {
    let state = createEmptySelections(workshopConfig);
    for (const configuredPhase of workshopConfig.phases) {
      const cards = workshopConfig.cards.filter((card) => card.phaseId === configuredPhase.id).slice(0, workshopConfig.maxSelectionsPerPhase);
      for (const card of cards) state = selectCard(workshopConfig, state, configuredPhase.id, card.id);
    }
    expect(isComplete(workshopConfig, state)).toBe(true);
    expect(incompletePhaseIds(workshopConfig, state)).toEqual([]);
    expect(totalSelected(state)).toBe(workshopConfig.phases.length * workshopConfig.maxSelectionsPerPhase);
  });
});
