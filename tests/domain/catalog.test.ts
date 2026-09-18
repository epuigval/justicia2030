import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { cardsForPhase, filterCards, orderedCategories, orderedPhases, validateCatalog } from "@/domain/catalog";
import { createEmptySelections, totalSelected } from "@/domain/selections";
import type { WorkshopConfig } from "@/domain/types";

describe("fixture inicial", () => {
  it("cumple los conteos aprobados", () => {
    expect(workshopConfig.phases).toHaveLength(3);
    expect(workshopConfig.categories).toHaveLength(4);
    expect(workshopConfig.cards).toHaveLength(24);
    expect(workshopConfig.collectives).toHaveLength(5);
  });

  it.each(workshopConfig.phases)("contiene ocho tarjetas en $name", (phase) => {
    expect(cardsForPhase(workshopConfig, phase.id)).toHaveLength(8);
  });

  it("contiene dos tarjetas por combinación de fase y categoría", () => {
    for (const phase of workshopConfig.phases) {
      for (const category of workshopConfig.categories) {
        expect(workshopConfig.cards.filter((card) => card.phaseId === phase.id && card.categoryId === category.id)).toHaveLength(2);
      }
    }
  });

  it("contiene campos y beneficios significativos", () => {
    for (const card of workshopConfig.cards) {
      expect([card.title, card.shortDescription, card.challenge, card.solution, card.debateQuestion].every((value) => value.trim().length > 0)).toBe(true);
      expect(card.benefits.length).toBeGreaterThanOrEqual(2);
      expect(card.benefits.length).toBeLessThanOrEqual(4);
    }
  });

  it("contiene la descripción y los criterios de cada perfil", () => {
    for (const collective of workshopConfig.collectives) {
      expect(collective.description.trim()).not.toBe("");
      expect(collective.prioritizationCriteria).toHaveLength(4);
    }
  });

  it("pasa el validador genérico", () => expect(validateCatalog(workshopConfig)).toEqual([]));
});

describe("arquitectura data-driven", () => {
  const synthetic: WorkshopConfig = {
    title: "Prueba",
    intro: "Configuración distinta",
    maxSelectionsPerPhase: 2,
    collectives: [],
    phases: [
      { id: "b", name: "B", shortName: "B", description: "Segunda", order: 2, accent: "blue" },
      { id: "a", name: "A", shortName: "A", description: "Primera", order: 1, accent: "green" },
    ],
    categories: [
      { id: "y", name: "Y", order: 2 },
      { id: "x", name: "X", order: 1 },
    ],
    cards: [],
  };

  it("deriva orden, estado y filtros sin conteos del fixture", () => {
    expect(orderedPhases(synthetic).map((phase) => phase.id)).toEqual(["a", "b"]);
    expect(orderedCategories(synthetic).map((category) => category.id)).toEqual(["x", "y"]);
    expect(createEmptySelections(synthetic)).toEqual({ a: [], b: [] });
    expect(filterCards(synthetic, "a", "all")).toEqual([]);
    expect(totalSelected({ a: ["one"], b: ["two"] })).toBe(2);
  });

  it("detecta IDs duplicados y referencias inválidas", () => {
    const invalid = { ...synthetic, phases: [...synthetic.phases, synthetic.phases[0]] };
    expect(validateCatalog(invalid)).toContain("Los IDs de fase deben ser únicos.");
  });
});
