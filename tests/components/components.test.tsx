import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryFilters } from "@/components/category-filters";
import { CardDetailModal } from "@/components/card-detail-modal";
import { CardTile } from "@/components/card-tile";
import { CollectiveSelector } from "@/components/collective-selector";
import { ResetConfirm } from "@/components/reset-confirm";
import { PhaseExplorer } from "@/components/phase-explorer";
import { PhaseResultSender } from "@/components/phase-result-sender";
import { WorkshopProvider, useWorkshop } from "@/context/workshop-context";
import { workshopConfig } from "@/config/workshop";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function SessionResetProbe() {
  const { hydrated, sessionId, reset } = useWorkshop();
  if (!hydrated) return null;
  return <><output>{sessionId}</output><button type="button" onClick={reset}>Reiniciar sesión de prueba</button></>;
}

describe("envío del resultado de fase", () => {
  const sessionId = "123e4567-e89b-42d3-a456-426614174000";
  const phase = workshopConfig.phases[0];
  const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id);

  it("no permite enviar con menos de tres tarjetas y muestra la acción con tres", () => {
    const { rerender } = render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={cards.slice(0, 2).map((card) => card.id)} />);
    expect(screen.queryByRole("button", { name: "Enviar resultados" })).not.toBeInTheDocument();
    rerender(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={cards.slice(0, 3).map((card) => card.id)} />);
    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeEnabled();
  });

  it("muestra el envío en curso, deshabilita el doble clic y solo manda los tres campos", async () => {
    let resolveRequest!: (response: { ok: boolean }) => void;
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<{ ok: boolean }>>(() => new Promise<{ ok: boolean }>((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const selectedCardIds = cards.slice(0, 3).map((card) => card.id);
    render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={selectedCardIds} />);

    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    const sending = screen.getByRole("button", { name: "Enviando..." });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({ sessionId, phaseId: phase.id, selectedCardIds });

    resolveRequest({ ok: true });
    expect(await screen.findByText("Resultados enviados correctamente")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeEnabled();
  });

  it("muestra el error y permite reintentar sin alterar la selección", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const selectedCardIds = cards.slice(0, 3).map((card) => card.id);
    render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={selectedCardIds} />);

    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    expect(await screen.findByText("No se pudieron enviar los resultados. Inténtalo de nuevo.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    expect(await screen.findByText("Resultados enviados correctamente")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1]!.body as string).selectedCardIds).toEqual(selectedCardIds);
  });

  it("oculta el éxito anterior al cambiar la combinación", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();
    const firstSelection = cards.slice(0, 3).map((card) => card.id);
    const { rerender } = render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={firstSelection} />);
    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    expect(await screen.findByText("Resultados enviados correctamente")).toBeInTheDocument();

    rerender(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} selectedCardIds={[cards[0].id, cards[1].id, cards[3].id]} />);
    expect(screen.queryByText("Resultados enviados correctamente")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeEnabled();
  });
});

describe("componentes principales", () => {
  it("persiste un UUID nuevo al reiniciar el equipo", async () => {
    const previousSessionId = "123e4567-e89b-42d3-a456-426614174000";
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((phase) => [phase.id, []]));
    localStorage.setItem("justicia2030:v1:team", JSON.stringify({ schemaVersion: 3, sessionId: previousSessionId, selectionsByPhase, collectiveId: null }));
    const user = userEvent.setup();
    render(<WorkshopProvider scope="team"><SessionResetProbe /></WorkshopProvider>);
    expect(await screen.findByText(previousSessionId)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reiniciar sesión de prueba" }));
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem("justicia2030:v1:team")!);
      expect(persisted.schemaVersion).toBe(3);
      expect(persisted.sessionId).not.toBe(previousSessionId);
      expect(persisted.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

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

  it("obliga a elegir un colectivo y muestra su descripción", async () => {
    const user = userEvent.setup();
    render(<WorkshopProvider scope="team"><CollectiveSelector /></WorkshopProvider>);
    await screen.findByLabelText("Equipo o colectivo");
    const start = screen.getByRole("button", { name: "Comenzar partida" });
    expect(start).toBeDisabled();
    const collective = workshopConfig.collectives[0];
    await user.selectOptions(screen.getByLabelText("Equipo o colectivo"), collective.id);
    expect(screen.getByText(collective.description)).toBeInTheDocument();
    expect(start).toBeEnabled();
  });

  it("muestra el detalle como diálogo y permite cerrarlo con Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WorkshopProvider scope="team"><CardDetailModal card={workshopConfig.cards[0]} onClose={onClose} /></WorkshopProvider>);
    expect(screen.getByRole("dialog", { name: `Detalle de ${workshopConfig.cards[0].title}` })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("permite al dinamizador seleccionar más de tres tarjetas", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="facilitator"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: phase.name });
    const selectButtons = screen.getAllByRole("button", { name: "Seleccionar tarjeta" });
    for (const button of selectButtons.slice(0, 4)) await user.click(button);
    expect(screen.getByText("4 tarjetas · mismo peso")).toBeInTheDocument();
    expect(selectButtons[3]).not.toBeDisabled();
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
