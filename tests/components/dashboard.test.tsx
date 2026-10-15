import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DashboardView } from "@/components/dashboard";
import { aggregateDashboardMetrics, type DashboardDateRange } from "@/domain/dashboard";

const range: DashboardDateRange = { from: "", to: "", fromUtc: null, toExclusiveUtc: null };
const collectives = [
  { id: "universidad-talento-joven", name: "Universidad y talento joven" },
  { id: "profesionales-juridicos", name: "Profesionales jurídicos" },
];

afterEach(cleanup);

describe("dashboard", () => {
  it("renderiza estado global vacío sin NaN ni Infinity", () => {
    const data = aggregateDashboardMetrics({ range, participations: [], selections: [], collectives });
    const { container } = render(<DashboardView data={data} from="" to="" origin={null} />);

    expect(screen.getByRole("heading", { name: "Métricas de participación" })).toBeInTheDocument();
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
    expect(screen.getAllByText("Sin selecciones completadas en este periodo.")).toHaveLength(2);
  });

  it("usa retorno explícito a resultados sin acción de escritura", () => {
    const data = aggregateDashboardMetrics({ range, participations: [], selections: [], collectives });
    render(<DashboardView data={data} from="" to="" origin="result" />);

    expect(screen.getByRole("link", { name: "Volver a resultados" })).toHaveAttribute("href", "/individual/result");
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
});
