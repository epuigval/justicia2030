import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilters } from "@/components/category-filters";
import { CardTile } from "@/components/card-tile";
import { ResetConfirm } from "@/components/reset-confirm";
import { PhaseExplorer } from "@/components/phase-explorer";
import { WorkshopEmail } from "@/components/workshop-email";
import { WorkshopProvider } from "@/context/workshop-context";
import { workshopConfig } from "@/config/workshop";
import { createEmptySelections, selectCard } from "@/domain/selections";
import type { SelectionsByPhase } from "@/domain/types";

function completeSelections(): SelectionsByPhase {
  let selections = createEmptySelections(workshopConfig);
  for (const phase of workshopConfig.phases) {
    const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, workshopConfig.maxSelectionsPerPhase);
    for (const card of cards) selections = selectCard(workshopConfig, selections, phase.id, card.id);
  }
  return selections;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("componentes principales", () => {
  it("genera Todas y los filtros configurados", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CategoryFilters config={workshopConfig} active="all" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "true");
    for (const category of workshopConfig.categories) expect(screen.getByRole("button", { name: category.name })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Personas" }));
    expect(onChange).toHaveBeenCalledWith("personas");
  });

  it("deshabilita una tarjeta no seleccionada al alcanzar el máximo", () => {
    render(<CardTile config={workshopConfig} card={workshopConfig.cards[0]} selected={false} atLimit onToggle={vi.fn()} onOpenDetail={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Seleccionar tarjeta" })).toBeDisabled();
    expect(screen.getByText(/Máximo 3 tarjetas/)).toBeInTheDocument();
  });

  it("filtra tarjetas por categoría dentro del explorador", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: phase.name });
    await user.click(screen.getByRole("button", { name: "Personas" }));
    const expected = workshopConfig.cards.filter((card) => card.phaseId === phase.id && card.categoryId === "personas");
    for (const card of expected) expect(screen.getByRole("heading", { name: card.title })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Simplificación procesal" })).not.toBeInTheDocument();
  });

  it("permite seleccionar y quitar desde la bandeja", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: phase.name });
    await user.click(screen.getAllByRole("button", { name: "Seleccionar tarjeta" })[0]);
    expect(screen.getByText("1/3 tarjetas · mismo peso")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Quitar" }));
    expect(screen.getByText("0/3 tarjetas · mismo peso")).toBeInTheDocument();
  });

  it("habilita el envío cuando el workshop está completo y hay nombre de equipo", async () => {
    const user = userEvent.setup();
    render(<WorkshopEmail selections={completeSelections()} />);
    const button = screen.getByRole("button", { name: "Enviar resultado por correo" });
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText("Nombre del equipo"), "Equipo Alfa");
    expect(button).toBeEnabled();
  });

  it("mantiene el envío deshabilitado sin nombre de equipo", async () => {
    const user = userEvent.setup();
    render(<WorkshopEmail selections={completeSelections()} />);
    const input = screen.getByLabelText("Nombre del equipo");
    await user.type(input, "   ");
    expect(screen.getByRole("button", { name: "Enviar resultado por correo" })).toBeDisabled();
  });

  it("mantiene el envío deshabilitado si faltan selecciones", async () => {
    const user = userEvent.setup();
    render(<WorkshopEmail selections={createEmptySelections(workshopConfig)} />);
    await user.type(screen.getByLabelText("Nombre del equipo"), "Equipo Alfa");
    expect(screen.getByRole("button", { name: "Enviar resultado por correo" })).toBeDisabled();
  });

  it("confirma y permite cancelar un reinicio", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ResetConfirm triggerLabel="Comenzar nueva partida" message="Se eliminarán las selecciones." confirmLabel="Borrar y empezar" onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Comenzar nueva partida" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Comenzar nueva partida" }));
    await user.click(screen.getByRole("button", { name: "Borrar y empezar" }));
    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
  });
});
