import { describe, expect, it } from "vitest";

import { workshopConfig } from "@/config/workshop";
import {
  aggregateDashboardMetrics,
  parseDashboardDateRange,
  type DashboardCollectiveSource,
  type DashboardDateRange,
  type DashboardParticipationSource,
  type DashboardSelectionSource,
} from "@/domain/dashboard";

const allTime: DashboardDateRange = { from: "", to: "", fromUtc: null, toExclusiveUtc: null };
const collectives: DashboardCollectiveSource[] = [
  { id: "colectivo-a", name: "Colectivo A" },
  { id: "colectivo-b", name: "Colectivo B" },
];

function participation(
  participationId: string,
  status: "started" | "completed" = "completed",
  collectiveId = "colectivo-a",
  startedAt = "2026-10-15T10:00:00.000Z",
): DashboardParticipationSource {
  return { participationId, status, collectiveId, startedAt };
}

function selection(participationId: string, cardId: string): DashboardSelectionSource {
  const card = workshopConfig.cards.find((item) => item.id === cardId)!;
  return { participationId, cardId, phaseId: card.phaseId, categoryId: card.categoryId };
}

function phaseCards(phaseId: string) {
  return workshopConfig.cards.filter((card) => card.phaseId === phaseId);
}

function aggregate(
  participations: DashboardParticipationSource[],
  selections: DashboardSelectionSource[] = [],
  range = allTime,
) {
  return aggregateDashboardMetrics({ range, participations, selections, collectives });
}

describe("filtro temporal del dashboard", () => {
  it("convierte sólo Desde al inicio del día Europe/Madrid", () => {
    const result = parseDashboardDateRange("2026-10-15", undefined);
    expect(result).toEqual({
      ok: true,
      value: {
        from: "2026-10-15",
        to: "",
        fromUtc: "2026-10-14T22:00:00.000Z",
        toExclusiveUtc: null,
      },
    });
  });

  it("convierte sólo Hasta en límite exclusivo del día siguiente", () => {
    const result = parseDashboardDateRange(undefined, "2026-10-15");
    expect(result).toEqual({
      ok: true,
      value: {
        from: "",
        to: "2026-10-15",
        fromUtc: null,
        toExclusiveUtc: "2026-10-15T22:00:00.000Z",
      },
    });
  });

  it("convierte Desde y Hasta y respeta días de 23 horas por cambio horario", () => {
    const result = parseDashboardDateRange("2026-03-29", "2026-03-29");
    expect(result).toEqual({
      ok: true,
      value: {
        from: "2026-03-29",
        to: "2026-03-29",
        fromUtc: "2026-03-28T23:00:00.000Z",
        toExclusiveUtc: "2026-03-29T22:00:00.000Z",
      },
    });
  });

  it("rechaza fechas inexistentes, parámetros repetidos y rangos invertidos", () => {
    expect(parseDashboardDateRange("2026-02-30", undefined).ok).toBe(false);
    expect(parseDashboardDateRange(["2026-10-14", "2026-10-15"], undefined).ok).toBe(false);
    expect(parseDashboardDateRange("2026-10-16", "2026-10-15")).toMatchObject({
      ok: false,
      message: "La fecha Desde no puede ser posterior a la fecha Hasta.",
    });
  });
});

describe("resumen del dashboard", () => {
  it("cuenta como iniciadas tanto started como completed y sólo completed como completadas", () => {
    const result = aggregate([
      participation("started", "started"),
      participation("completed", "completed"),
    ]);

    expect(result.summary).toEqual({ startedParticipations: 2, completedParticipations: 1 });
  });

  it("aplica el rango a started_at, no a completed_at", () => {
    const parsed = parseDashboardDateRange("2026-10-15", "2026-10-15");
    if (!parsed.ok) throw new Error("unexpected invalid range");
    const rows = [
      { ...participation("outside", "completed", "colectivo-a", "2026-10-14T10:00:00.000Z"), completedAt: "2026-10-15T10:00:00.000Z" },
      { ...participation("inside", "completed", "colectivo-a", "2026-10-15T21:59:59.999Z"), completedAt: "2026-10-16T10:00:00.000Z" },
      participation("exclusive-end", "started", "colectivo-a", "2026-10-15T22:00:00.000Z"),
    ];

    expect(aggregate(rows, [], parsed.value).summary).toEqual({ startedParticipations: 1, completedParticipations: 1 });
  });
});

describe("prioridades globales", () => {
  it("sólo usa completed y calcula porcentaje sobre participantes completados", () => {
    const card = phaseCards("justicia-actual")[0];
    const result = aggregate(
      [participation("one"), participation("two"), participation("pending", "started")],
      [selection("one", card.id), selection("pending", card.id)],
    );
    const priority = result.globalPhasePriorities[0].priorities[0];

    expect(priority).toMatchObject({ selectionCount: 1, participantPercentage: 50 });
  });

  it("devuelve tres posiciones normales y excluye la cuarta", () => {
    const cards = phaseCards("justicia-actual");
    const participants = ["p1", "p2", "p3", "p4"].map((id) => participation(id));
    const selected = [
      ...["p1", "p2", "p3", "p4"].map((id) => selection(id, cards[0].id)),
      ...["p1", "p2", "p3"].map((id) => selection(id, cards[1].id)),
      ...["p1", "p2"].map((id) => selection(id, cards[2].id)),
      selection("p1", cards[3].id),
    ];
    const priorities = aggregate(participants, selected).globalPhasePriorities[0].priorities;

    expect(priorities.map((item) => [item.cardId, item.rank])).toEqual([
      [cards[0].id, 1],
      [cards[1].id, 2],
      [cards[2].id, 3],
    ]);
  });

  it("aplica DENSE_RANK y devuelve todos los empates en tercera posición con orden de catálogo", () => {
    const cards = phaseCards("justicia-actual");
    const participants = ["p1", "p2", "p3"].map((id) => participation(id));
    const selected = [
      ...["p1", "p2", "p3"].map((id) => selection(id, cards[0].id)),
      ...["p1", "p2"].map((id) => selection(id, cards[1].id)),
      selection("p1", cards[4].id),
      selection("p2", cards[3].id),
      selection("p3", cards[2].id),
    ];
    const priorities = aggregate(participants, selected).globalPhasePriorities[0].priorities;

    expect(priorities).toHaveLength(5);
    expect(priorities.slice(2).map((item) => [item.cardId, item.rank])).toEqual([
      [cards[2].id, 3],
      [cards[3].id, 3],
      [cards[4].id, 3],
    ]);
  });

  it("calcula cada fase de forma independiente", () => {
    const actual = phaseCards("justicia-actual")[0];
    const connected = phaseCards("justicia-conectada")[2];
    const intelligent = phaseCards("justicia-inteligente")[4];
    const result = aggregate(
      [participation("p1")],
      [selection("p1", actual.id), selection("p1", connected.id), selection("p1", intelligent.id)],
    );

    expect(result.globalPhasePriorities.map((phase) => phase.priorities[0].cardId)).toEqual([
      actual.id,
      connected.id,
      intelligent.id,
    ]);
  });
});

describe("prioridades por colectivo", () => {
  it("restringe el universo y usa denominador propio de cada colectivo", () => {
    const card = phaseCards("justicia-actual")[0];
    const result = aggregate(
      [participation("a1"), participation("a2"), participation("b1", "completed", "colectivo-b")],
      [selection("a1", card.id), selection("b1", card.id)],
    );
    const metricA = result.collectiveMetrics[0];
    const metricB = result.collectiveMetrics[1];

    expect(metricA.phasePriorities[0].priorities[0]).toMatchObject({ selectionCount: 1, participantPercentage: 50 });
    expect(metricB.phasePriorities[0].priorities[0]).toMatchObject({ selectionCount: 1, participantPercentage: 100 });
  });

  it("representa colectivos sin completed sin porcentajes inválidos", () => {
    const result = aggregate([participation("pending", "started", "colectivo-b")]);
    const metric = result.collectiveMetrics[1];

    expect(metric.completedParticipations).toBe(0);
    expect(metric.phasePriorities.every((phase) => phase.priorities.length === 0)).toBe(true);
    expect(metric.categoryDistribution.every((category) => category.percentage === 0)).toBe(true);
  });
});

describe("distribución por tipología", () => {
  it("usa sólo selecciones completed y calcula sobre total de selecciones", () => {
    const categoryCards = workshopConfig.categories.map((category) => workshopConfig.cards.find((card) => card.categoryId === category.id)!);
    const result = aggregate(
      [participation("done"), participation("pending", "started")],
      [
        ...categoryCards.map((card) => selection("done", card.id)),
        selection("pending", categoryCards[0].id),
      ],
    );
    const metric = result.collectiveMetrics[0];

    expect(metric.totalSelections).toBe(4);
    expect(metric.categoryDistribution.map((category) => category.selectionCount)).toEqual([1, 1, 1, 1]);
    expect(metric.categoryDistribution.map((category) => category.percentage)).toEqual([25, 25, 25, 25]);
    expect(metric.categoryDistribution.reduce((sum, category) => sum + category.percentage, 0)).toBeCloseTo(100, 1);
  });

  it("devuelve distribución vacía segura para colectivo sin selecciones", () => {
    const metric = aggregate([]).collectiveMetrics[0];
    expect(metric.totalSelections).toBe(0);
    expect(metric.categoryDistribution).toHaveLength(4);
    expect(metric.categoryDistribution.every((category) => category.selectionCount === 0 && category.percentage === 0)).toBe(true);
  });
});

describe("privacidad del DTO", () => {
  it("no contiene identificadores ni campos individuales de participaciones", () => {
    const sensitiveParticipation = {
      ...participation("participation-secret-id"),
      writeTokenHash: "secret-hash",
      collectiveNameSnapshot: "private-snapshot",
    } as DashboardParticipationSource;
    const card = phaseCards("justicia-actual")[0];
    const serialized = JSON.stringify(aggregate([sensitiveParticipation], [selection("participation-secret-id", card.id)]));

    expect(serialized).not.toContain("participation-secret-id");
    expect(serialized).not.toContain("secret-hash");
    expect(serialized).not.toContain("private-snapshot");
    expect(serialized).not.toContain("participationId");
  });
});
