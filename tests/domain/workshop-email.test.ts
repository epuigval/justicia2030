import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { createPhaseResultEmail, validatePhaseResultPayload } from "@/domain/workshop-email";
import { createPhaseResultIdempotencyKey } from "@/server/phase-result-email";

const SESSION_ID = "123e4567-e89b-42d3-a456-426614174000";

describe("resultado de una fase", () => {
  const phase = workshopConfig.phases[0];
  const collective = workshopConfig.collectives[0];
  const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id);
  const validPayload = { sessionId: SESSION_ID, phaseId: phase.id, collectiveId: collective.id, selectedCardIds: [cards[2].id, cards[0].id, cards[1].id] };

  it("rechaza menos tarjetas que el máximo configurado", () => {
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, selectedCardIds: validPayload.selectedCardIds.slice(0, 2) })).toBeNull();
  });

  it("acepta exactamente el máximo y normaliza el orden del catálogo", () => {
    expect(validatePhaseResultPayload(workshopConfig, validPayload)?.selectedCardIds).toEqual([cards[0].id, cards[1].id, cards[2].id]);
  });

  it("rechaza duplicados, tarjetas inexistentes y tarjetas de otra fase", () => {
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, selectedCardIds: [cards[0].id, cards[0].id, cards[1].id] })).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, selectedCardIds: [cards[0].id, cards[1].id, "inexistente"] })).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, selectedCardIds: [cards[0].id, cards[1].id, workshopConfig.cards.find((card) => card.phaseId !== phase.id)!.id] })).toBeNull();
  });

  it("rechaza sessionId ausente o inválido", () => {
    expect(validatePhaseResultPayload(workshopConfig, { phaseId: phase.id, selectedCardIds: validPayload.selectedCardIds })).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, sessionId: "no-es-uuid" })).toBeNull();
  });

  it("rechaza una forma no objeto, una fase desconocida o una selección que no sea array", () => {
    expect(validatePhaseResultPayload(workshopConfig, null)).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, phaseId: "fase-inexistente" })).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, selectedCardIds: "no-es-array" })).toBeNull();
  });

  it("rechaza un colectivo ausente o desconocido", () => {
    const withoutCollective = { sessionId: validPayload.sessionId, phaseId: validPayload.phaseId, selectedCardIds: validPayload.selectedCardIds };
    expect(validatePhaseResultPayload(workshopConfig, withoutCollective)).toBeNull();
    expect(validatePhaseResultPayload(workshopConfig, { ...validPayload, collectiveId: "colectivo-inyectado" })).toBeNull();
  });

  it("ignora perfil y campos de email añadidos por el cliente", () => {
    const result = validatePhaseResultPayload(workshopConfig, {
      ...validPayload,
      profileId: "perfil-inyectado",
      to: "ataque@example.com",
      from: "ataque@example.com",
      subject: "Asunto manipulado",
      text: "Contenido manipulado",
    });
    expect(result).not.toBeNull();
    expect(result?.collective).toBe(collective);
    expect(result).not.toHaveProperty("profileId");
    expect(result).not.toHaveProperty("to");
  });

  it("construye asunto y texto exactos desde el catálogo", () => {
    const result = validatePhaseResultPayload(workshopConfig, validPayload)!;
    const email = createPhaseResultEmail(result);
    expect(email.subject).toBe(`Justicia 2030 · ${collective.name} · ${phase.name}`);
    expect(email.text).toBe([
      "JUSTICIA 2030",
      "",
      "Grupo:",
      collective.name,
      "",
      "Fase:",
      phase.name,
      "",
      "Tarjetas seleccionadas:",
      "",
      `- ${cards[0].title}`,
      `- ${cards[1].title}`,
      `- ${cards[2].title}`,
    ].join("\n"));
    expect(email.text.match(/^- /gm)).toHaveLength(3);
    for (const card of cards.slice(0, 3)) {
      expect(email.text).not.toContain(card.id);
      expect(email.text).not.toContain(card.challenge);
      expect(email.text).not.toContain(card.solution);
      for (const benefit of card.benefits) expect(email.text).not.toContain(benefit);
    }
    expect(`${email.subject}\n${email.text}`).toContain(collective.name);
  });
});

describe("idempotencia del resultado", () => {
  const firstPhase = workshopConfig.phases[0];
  const secondPhase = workshopConfig.phases[1];
  const firstCollective = workshopConfig.collectives[0];
  const secondCollective = workshopConfig.collectives[1];
  const firstCards = workshopConfig.cards.filter((card) => card.phaseId === firstPhase.id);
  const secondCards = workshopConfig.cards.filter((card) => card.phaseId === secondPhase.id);

  function result(sessionId: string, phaseId: string, selectedCardIds: string[], extra: Record<string, unknown> = {}) {
    return validatePhaseResultPayload(workshopConfig, { sessionId, phaseId, collectiveId: firstCollective.id, selectedCardIds, ...extra })!;
  }

  it("mantiene la clave para la misma selección en distinto orden", () => {
    const first = result(SESSION_ID, firstPhase.id, [firstCards[0].id, firstCards[1].id, firstCards[2].id]);
    const reordered = result(SESSION_ID, firstPhase.id, [firstCards[2].id, firstCards[0].id, firstCards[1].id]);
    expect(createPhaseResultIdempotencyKey(first)).toBe(createPhaseResultIdempotencyKey(reordered));
  });

  it("cambia al cambiar tarjeta, fase o sesión", () => {
    const base = createPhaseResultIdempotencyKey(result(SESSION_ID, firstPhase.id, firstCards.slice(0, 3).map((card) => card.id)));
    expect(createPhaseResultIdempotencyKey(result(SESSION_ID, firstPhase.id, [firstCards[0].id, firstCards[1].id, firstCards[3].id]))).not.toBe(base);
    expect(createPhaseResultIdempotencyKey(result(SESSION_ID, secondPhase.id, secondCards.slice(0, 3).map((card) => card.id)))).not.toBe(base);
    expect(createPhaseResultIdempotencyKey(result("123e4567-e89b-42d3-a456-426614174001", firstPhase.id, firstCards.slice(0, 3).map((card) => card.id)))).not.toBe(base);
  });

  it("cambia al cambiar colectivo y nunca supera 256 caracteres", () => {
    const selectedCardIds = firstCards.slice(0, 3).map((card) => card.id);
    const first = result(SESSION_ID, firstPhase.id, selectedCardIds);
    const second = result(SESSION_ID, firstPhase.id, selectedCardIds, { collectiveId: secondCollective.id });
    expect(createPhaseResultIdempotencyKey(first)).not.toBe(createPhaseResultIdempotencyKey(second));
    expect(createPhaseResultIdempotencyKey(first).length).toBeLessThanOrEqual(256);
  });
});
