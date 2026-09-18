import type { CategoryId, PhaseId, WorkshopCard, WorkshopConfig } from "./types";

const nonEmpty = (value: string) => value.trim().length > 0;

export function validateCatalog(config: WorkshopConfig): string[] {
  const errors: string[] = [];
  const phaseIds = new Set(config.phases.map((phase) => phase.id));
  const categoryIds = new Set(config.categories.map((category) => category.id));
  const cardIds = new Set(config.cards.map((card) => card.id));

  if (!nonEmpty(config.title) || !nonEmpty(config.intro)) errors.push("Los textos principales son obligatorios.");
  if (!Number.isInteger(config.maxSelectionsPerPhase) || config.maxSelectionsPerPhase < 1) errors.push("El máximo debe ser un entero positivo.");
  if (phaseIds.size !== config.phases.length) errors.push("Los IDs de fase deben ser únicos.");
  if (categoryIds.size !== config.categories.length) errors.push("Los IDs de categoría deben ser únicos.");
  if (cardIds.size !== config.cards.length) errors.push("Los IDs de tarjeta deben ser únicos.");

  for (const phase of config.phases) {
    if (!nonEmpty(phase.id) || !nonEmpty(phase.name) || !nonEmpty(phase.description)) errors.push(`Fase incompleta: ${phase.id || "sin ID"}.`);
  }
  for (const category of config.categories) {
    if (!nonEmpty(category.id) || !nonEmpty(category.name)) errors.push(`Categoría incompleta: ${category.id || "sin ID"}.`);
    if (category.id === "all" || category.id === "todas") errors.push("Todas no puede ser una categoría.");
  }
  for (const collective of config.collectives) {
    if (!nonEmpty(collective.id) || !nonEmpty(collective.name) || !nonEmpty(collective.description) || collective.prioritizationCriteria.some((criterion) => !nonEmpty(criterion))) {
      errors.push(`Colectivo incompleto: ${collective.id || "sin ID"}.`);
    }
  }
  for (const card of config.cards) {
    const fields = [card.id, card.title, card.shortDescription, card.challenge, card.solution, card.debateQuestion];
    if (fields.some((field) => !nonEmpty(field)) || card.benefits.length === 0 || card.benefits.some((benefit) => !nonEmpty(benefit))) {
      errors.push(`Tarjeta incompleta: ${card.id || "sin ID"}.`);
    }
    if (!phaseIds.has(card.phaseId)) errors.push(`Fase desconocida en ${card.id}.`);
    if (!categoryIds.has(card.categoryId)) errors.push(`Categoría desconocida en ${card.id}.`);
  }
  return errors;
}

export const orderedPhases = (config: WorkshopConfig) => [...config.phases].sort((a, b) => a.order - b.order);
export const orderedCategories = (config: WorkshopConfig) => [...config.categories].sort((a, b) => a.order - b.order);
export const orderedCards = (config: WorkshopConfig) => [...config.cards].sort((a, b) => a.order - b.order);

export function cardsForPhase(config: WorkshopConfig, phaseId: PhaseId): WorkshopCard[] {
  return orderedCards(config).filter((card) => card.phaseId === phaseId);
}

export function filterCards(config: WorkshopConfig, phaseId: PhaseId, categoryId: CategoryId | "all"): WorkshopCard[] {
  const cards = cardsForPhase(config, phaseId);
  return categoryId === "all" ? cards : cards.filter((card) => card.categoryId === categoryId);
}

export const getPhase = (config: WorkshopConfig, phaseId: PhaseId) => config.phases.find((phase) => phase.id === phaseId);
export const getCategory = (config: WorkshopConfig, categoryId: CategoryId) => config.categories.find((category) => category.id === categoryId);
export const getCard = (config: WorkshopConfig, cardId: string) => config.cards.find((card) => card.id === cardId);
