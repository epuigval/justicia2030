import { describe, expect, it } from "vitest";
import { PROMPT_TEMPLATE } from "@/config/prompt-template";
import { workshopConfig } from "@/config/workshop";
import { generatePrompt } from "@/domain/prompt";
import { createEmptySelections, selectCard } from "@/domain/selections";
import type { SelectionsByPhase } from "@/domain/types";

function completeSelections(reverse = false): SelectionsByPhase {
  let state = createEmptySelections(workshopConfig);
  for (const phase of workshopConfig.phases) {
    const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, workshopConfig.maxSelectionsPerPhase);
    for (const card of reverse ? [...cards].reverse() : cards) state = selectCard(workshopConfig, state, phase.id, card.id);
  }
  return state;
}

describe("generador de prompt", () => {
  it("no genera un prompt parcial", () => expect(generatePrompt(workshopConfig, createEmptySelections(workshopConfig))).toBeNull());

  it("incluye nueve tarjetas y una cabecera exacta por fase", () => {
    const prompt = generatePrompt(workshopConfig, completeSelections())!;
    expect(prompt.match(/^## .+$/gm)).toHaveLength(workshopConfig.phases.length);
    expect(prompt.match(/^### .+$/gm)).toHaveLength(workshopConfig.phases.length * workshopConfig.maxSelectionsPerPhase);
  });

  it("no confunde cabeceras de tarjeta y fase", () => {
    const lines = generatePrompt(workshopConfig, completeSelections())!.split("\n");
    expect(lines.filter((line) => line.startsWith("## "))).toHaveLength(workshopConfig.phases.length);
    expect(lines.filter((line) => line.startsWith("### "))).toHaveLength(9);
  });

  it("incluye los campos aprobados y omite descripción breve e IDs", () => {
    const selected = completeSelections();
    const card = workshopConfig.cards.find((item) => selected[item.phaseId].includes(item.id))!;
    const prompt = generatePrompt(workshopConfig, selected)!;
    expect(prompt).toContain(card.title);
    expect(prompt).toContain(card.challenge);
    expect(prompt).toContain(card.solution);
    expect(prompt).toContain(card.benefits[0]);
    expect(prompt).toContain(card.debateQuestion);
    expect(prompt).not.toContain(card.shortDescription);
    expect(prompt).not.toContain(card.id);
  });

  it("declara igualdad de peso y usa la plantilla central", () => {
    const prompt = generatePrompt(workshopConfig, completeSelections())!;
    expect(prompt).toContain(PROMPT_TEMPLATE.rules[0]);
    expect(prompt).toContain(PROMPT_TEMPLATE.cardsTitle);
  });

  it("es determinista e ignora el orden temporal", () => {
    expect(generatePrompt(workshopConfig, completeSelections(true))).toBe(generatePrompt(workshopConfig, completeSelections(false)));
  });

  it("agrupa cada tarjeta bajo su fase en orden configurado", () => {
    const prompt = generatePrompt(workshopConfig, completeSelections())!;
    const phasePositions = workshopConfig.phases.map((phase) => prompt.indexOf(`## ${phase.name}`));
    expect(phasePositions).toEqual([...phasePositions].sort((a, b) => a - b));
    for (const phase of workshopConfig.phases) expect(prompt.match(new RegExp(`^## ${phase.name}$`, "gm"))).toHaveLength(1);
  });
});
