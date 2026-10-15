import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardView } from "@/components/dashboard";
import {
  aggregateDashboardMetrics,
  type DashboardCollectiveMetricsDto,
  type DashboardDateRange,
  type DashboardDto,
  type DashboardPhasePrioritiesDto,
  type DashboardPriorityItemDto,
} from "@/domain/dashboard";

const range: DashboardDateRange = { from: "", to: "", fromUtc: null, toExclusiveUtc: null };
const collectives = [
  { id: "universidad-talento-joven", name: "Universidad y talento joven" },
  { id: "profesionales-juridicos", name: "Profesionales jurídicos" },
];

function priority(cardId: string, title: string, rank: number, selectionCount: number, participantPercentage: number): DashboardPriorityItemDto {
  return { cardId, title, rank, selectionCount, participantPercentage };
}

function phase(
  phaseId: string,
  phaseName: string,
  phaseOrder: number,
  accent: DashboardPhasePrioritiesDto["accent"],
  priorities: DashboardPriorityItemDto[],
): DashboardPhasePrioritiesDto {
  return { phaseId, phaseName, phaseOrder, accent, completedParticipants: 13, priorities };
}

const phaseDefinitions = [
  ["justicia-actual", "Justicia Actual", 1, "orange"],
  ["justicia-conectada", "Justicia Conectada", 2, "green"],
  ["justicia-inteligente", "Justicia Inteligente", 3, "violet"],
] as const;

function collectiveMetric(index: number, completedParticipations = 4): DashboardCollectiveMetricsDto {
  return {
    collectiveId: `colectivo-${index}`,
    collectiveName: `Colectivo ${index}`,
    completedParticipations,
    phasePriorities: phaseDefinitions.map(([phaseId, phaseName, phaseOrder, accent]) => phase(
      phaseId,
      phaseName,
      phaseOrder,
      accent,
      completedParticipations === 0 ? [] : [
        priority(`${phaseId}-${index}-1`, `${phaseName} prioridad ${index}`, 1, 3, 75),
        priority(`${phaseId}-${index}-2`, `${phaseName} alternativa ${index}`, 2, 2, 50),
        priority(`${phaseId}-${index}-3`, `${phaseName} tercera ${index}`, 3, 1, 25),
      ],
    )),
    totalSelections: completedParticipations === 0 ? 0 : 12,
    categoryDistribution: [],
  };
}

function visualDashboardData(): DashboardDto {
  const collectiveMetrics = [1, 2, 3, 4].map((index) => collectiveMetric(index));
  collectiveMetrics.push(collectiveMetric(5, 0));
  collectiveMetrics[0].phasePriorities[0].priorities.unshift(
    priority("actual-1-tie", "Justicia Actual prioridad empatada", 1, 3, 75),
  );

  return {
    range: { from: "", to: "" },
    summary: { startedParticipations: 18, completedParticipations: 13 },
    globalPhasePriorities: [
      phase("justicia-actual", "Justicia Actual", 1, "orange", [
        priority("global-a", "Mejora de la atención", 1, 11, 84.6),
        priority("global-b", "Capacitación", 2, 9, 69.2),
        priority("global-c", "Simplificación", 3, 7, 53.8),
        priority("global-d", "Interoperabilidad", 3, 7, 53.8),
      ]),
      phase("justicia-conectada", "Justicia Conectada", 2, "green", [priority("global-e", "Conexión", 1, 8, 61.5)]),
      phase("justicia-inteligente", "Justicia Inteligente", 3, "violet", [priority("global-f", "Inteligencia", 1, 6, 46.2)]),
    ],
    collectiveMetrics,
  };
}

afterEach(cleanup);

describe("dashboard", () => {
  it("renderiza estado global vacío sin NaN ni Infinity", () => {
    const data = aggregateDashboardMetrics({ range, participations: [], selections: [], collectives });
    const { container } = render(<DashboardView data={data} from="" to="" origin={null} />);

    expect(screen.getByRole("heading", { name: "Resultados de participación" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sin datos en este periodo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
    expect(container.textContent).not.toMatch(/NaN|Infinity/);
  });

  it("renderiza error de lectura y mantiene el filtro utilizable", () => {
    render(<DashboardView data={null} from="2026-10-14" to="2026-10-15" origin="home" error="Error controlado" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Error controlado");
    expect(screen.getByLabelText("Desde")).toHaveValue("2026-10-14");
    expect(screen.getByLabelText("Hasta")).toHaveValue("2026-10-15");
    expect(screen.getByRole("link", { name: "Limpiar filtro" })).toHaveAttribute("href", "/dashboard?origin=home");
  });

  it("muestra estado sin completed y estados vacíos por colectivo", () => {
    const data = aggregateDashboardMetrics({
      range,
      participations: [{ participationId: "started", status: "started", collectiveId: collectives[0].id, startedAt: "2026-10-15T10:00:00.000Z" }],
      selections: [],
      collectives,
    });
    render(<DashboardView data={data} from="" to="" origin="home" />);

    expect(screen.getByRole("status")).toHaveTextContent("ninguna completada");
    expect(screen.getAllByText("Sin participaciones completadas en este periodo.")).toHaveLength(3);
    expect(screen.getAllByText("Sin datos")).toHaveLength(4);
  });

  it("usa retorno explícito a resultados sin acción de escritura", () => {
    const data = aggregateDashboardMetrics({ range, participations: [], selections: [], collectives });
    render(<DashboardView data={data} from="" to="" origin="result" />);

    expect(screen.getByRole("link", { name: "Volver a resultado individual" })).toHaveAttribute("href", "/individual/result");
    expect(screen.queryByRole("button", { name: /Finalizar|Completar/ })).not.toBeInTheDocument();
  });

  it("presenta resumen y datos agregados sin contenido individual", () => {
    const data = aggregateDashboardMetrics({
      range,
      participations: [{ participationId: "private-id", status: "completed", collectiveId: collectives[0].id, startedAt: "2026-10-15T10:00:00.000Z" }],
      selections: [],
      collectives,
    });
    const { container } = render(<DashboardView data={data} from="" to="" origin={null} />);
    const summary = screen.getByRole("heading", { name: "Resumen general" }).closest("section")!;

    expect(within(summary).getByText("Participaciones iniciadas")).toBeInTheDocument();
    expect(within(summary).getByText("Participaciones completadas")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prioridades globales" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Prioridades por colectivo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Distribución por tipología" })).toBeInTheDocument();
    expect(container.textContent).not.toContain("private-id");
  });

  it("presenta ranks, empates, counts, porcentajes y barras globales sin alterar valores", () => {
    render(<DashboardView data={visualDashboardData()} from="" to="" origin={null} />);

    const actual = screen.getByRole("article", { name: "Justicia Actual" });
    expect(within(actual).getAllByLabelText("Posición 3")).toHaveLength(2);
    expect(within(actual).getByText("Mejora de la atención")).toBeInTheDocument();
    expect(within(actual).getByText("11 selecciones")).toBeInTheDocument();
    expect(within(actual).getByText("84,6%")).toBeInTheDocument();
    expect(within(actual).getByRole("progressbar", { name: "Mejora de la atención: 84,6%" })).toHaveStyle({ width: "84.6%" });
    expect(within(actual).getByRole("progressbar", { name: "Interoperabilidad: 53,8%" })).toHaveStyle({ width: "53.8%" });
  });

  it("compara cinco colectivos por fase, conserva empates y muestra colectivos sin datos", async () => {
    const user = userEvent.setup();
    render(<DashboardView data={visualDashboardData()} from="" to="" origin={null} />);

    expect(screen.getByRole("heading", { name: "Prioridades por colectivo" })).toBeInTheDocument();
    expect(screen.getByText("Consulta las prioridades más seleccionadas por cada colectivo en cada fase.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Detalle por colectivo" })).not.toBeInTheDocument();

    const actualTable = screen.getByRole("table", { name: "Prioridades de Justicia Actual por colectivo" });
    expect(within(actualTable).getAllByRole("rowheader")).toHaveLength(5);
    const firstCollective = within(actualTable).getByRole("row", { name: /Colectivo 1/ });
    expect(within(firstCollective).getByText("Justicia Actual prioridad 1")).toBeInTheDocument();
    expect(within(firstCollective).getByText("Justicia Actual prioridad empatada")).toBeInTheDocument();
    expect(within(firstCollective).getAllByText("75%")).toHaveLength(2);
    expect(within(within(actualTable).getByRole("row", { name: /Colectivo 5/ })).getByText("Sin datos")).toBeInTheDocument();

    const connectedButton = screen.getByRole("button", { name: "Justicia Conectada" });
    connectedButton.focus();
    await user.keyboard("{Enter}");
    expect(connectedButton).toHaveAttribute("aria-pressed", "true");
    const connectedTable = screen.getByRole("table", { name: "Prioridades de Justicia Conectada por colectivo" });
    expect(within(connectedTable).getByText("Justicia Conectada prioridad 1")).toBeInTheDocument();
    expect(within(connectedTable).queryByText("Justicia Actual prioridad empatada")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Justicia Inteligente" }));
    expect(screen.getByRole("table", { name: "Prioridades de Justicia Inteligente por colectivo" })).toBeInTheDocument();
  });
});
