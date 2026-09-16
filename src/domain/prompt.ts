import { PROMPT_TEMPLATE } from "@/config/prompt-template";
import { getCategory, orderedCards, orderedPhases } from "./catalog";
import { isComplete } from "./selections";
import type { SelectionsByPhase, WorkshopConfig } from "./types";

export function generatePrompt(config: WorkshopConfig, selections: SelectionsByPhase): string | null {
  if (!isComplete(config, selections)) return null;

  const parts: string[] = [
    ...PROMPT_TEMPLATE.introduction,
    "",
    PROMPT_TEMPLATE.rulesTitle,
    ...PROMPT_TEMPLATE.rules.map((rule) => `- ${rule}`),
    "",
    PROMPT_TEMPLATE.structureTitle,
    ...PROMPT_TEMPLATE.structure.map((item, index) => `${index + 1}. ${item}`),
    "",
    PROMPT_TEMPLATE.cardsTitle,
  ];

  for (const phase of orderedPhases(config)) {
    parts.push("", `## ${phase.name}`);
    const selected = new Set(selections[phase.id]);
    for (const card of orderedCards(config).filter((item) => item.phaseId === phase.id && selected.has(item.id))) {
      const category = getCategory(config, card.categoryId);
      parts.push(
        "",
        `### ${card.title}`,
        `Categoría: ${category?.name ?? ""}`,
        "",
        "Reto:",
        card.challenge,
        "",
        "Solución:",
        card.solution,
        "",
        "Beneficios:",
        ...card.benefits.map((benefit) => `- ${benefit}`),
        "",
        "Pregunta para el debate:",
        card.debateQuestion,
      );
    }
  }

  return `${parts.join("\n").trim()}\n`;
}
