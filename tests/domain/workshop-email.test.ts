import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { createPhaseSelectionEmail } from "@/domain/workshop-email";

describe("correo de selección parcial", () => {
  const collective = workshopConfig.collectives[0];
  const phase = workshopConfig.phases[0];
  const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id);

  it("no genera un correo sin tarjetas seleccionadas", () => {
    expect(createPhaseSelectionEmail(workshopConfig, [], collective, phase)).toBeNull();
  });

  it("incluye el grupo y la fase en el asunto", () => {
    const email = createPhaseSelectionEmail(workshopConfig, [cards[0].id], collective, phase)!;
    expect(email.subject).toBe(`${collective.name} - ${phase.name}`);
    expect(email.body).toContain(`Grupo: ${collective.name}\nFase: ${phase.name}`);
  });

  it("incluye solo los títulos seleccionados en orden de catálogo", () => {
    const email = createPhaseSelectionEmail(workshopConfig, [cards[2].id, cards[0].id], collective, phase)!;
    expect(email.body).toContain(`- ${cards[0].title}`);
    expect(email.body).toContain(`- ${cards[2].title}`);
    expect(email.body.indexOf(cards[0].title)).toBeLessThan(email.body.indexOf(cards[2].title));
    expect(email.body).not.toContain(cards[1].title);
  });

  it("codifica asunto y cuerpo en un enlace mailto", () => {
    const email = createPhaseSelectionEmail(workshopConfig, [cards[0].id], collective, phase)!;
    const query = new URLSearchParams(email.mailto.slice("mailto:?".length));
    expect(query.get("subject")).toBe(email.subject);
    expect(query.get("body")).toBe(email.body);
  });
});