import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { createEmptySelections, selectCard } from "@/domain/selections";
import { createWorkshopEmail } from "@/domain/workshop-email";
import type { SelectionsByPhase } from "@/domain/types";

function completeSelections(reverse = false): SelectionsByPhase {
  let selections = createEmptySelections(workshopConfig);
  for (const phase of workshopConfig.phases) {
    const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, workshopConfig.maxSelectionsPerPhase);
    for (const card of reverse ? [...cards].reverse() : cards) {
      selections = selectCard(workshopConfig, selections, phase.id, card.id);
    }
  }
  return selections;
}

describe("correo de resultados del workshop", () => {
  it("no genera un correo sin nombre o con selecciones incompletas", () => {
    expect(createWorkshopEmail(workshopConfig, completeSelections(), "   ")).toBeNull();
    expect(createWorkshopEmail(workshopConfig, createEmptySelections(workshopConfig), "Equipo Alfa")).toBeNull();
  });

  it("genera el asunto y el encabezado solicitados", () => {
    const email = createWorkshopEmail(workshopConfig, completeSelections(), " Equipo Alfa ")!;
    expect(email.subject).toBe("Equipo Alfa - Resultados Workshop Justicia 2030");
    expect(email.body).toMatch(/^Nombre equipo: Equipo Alfa\n\nTarjetas seleccionadas:/);
  });

  it("agrupa tres títulos bajo cada fase y respeta el orden del catálogo", () => {
    const email = createWorkshopEmail(workshopConfig, completeSelections(true), "Equipo Alfa")!;
    const phasePositions = workshopConfig.phases.map((phase) => email.body.indexOf(`Fase ${phase.order} - ${phase.name}:`));
    expect(phasePositions).toEqual([...phasePositions].sort((left, right) => left - right));
    for (const phase of workshopConfig.phases) {
      const selectedTitles = workshopConfig.cards
        .filter((card) => card.phaseId === phase.id)
        .slice(0, workshopConfig.maxSelectionsPerPhase)
        .map((card) => `- ${card.title}`);
      for (const title of selectedTitles) expect(email.body).toContain(title);
    }
    expect(email.body.match(/^- /gm)).toHaveLength(9);
  });

  it("codifica asunto y cuerpo en un enlace mailto", () => {
    const email = createWorkshopEmail(workshopConfig, completeSelections(), "Equipo Ágil")!;
    const query = new URLSearchParams(email.mailto.slice("mailto:?".length));
    expect(query.get("subject")).toBe(email.subject);
    expect(query.get("body")).toBe(email.body);
  });
});