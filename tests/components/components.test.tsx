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
import { SelectionTray } from "@/components/selection-tray";
import { TeamSummary } from "@/components/team-summary";
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
  const collectiveId = workshopConfig.collectives[0].id;
  const cards = workshopConfig.cards.filter((card) => card.phaseId === phase.id);

  it("no permite enviar con menos de tres tarjetas y muestra la acción con tres", () => {
    const { rerender } = render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={cards.slice(0, 2).map((card) => card.id)} />);
    expect(screen.queryByRole("button", { name: "Enviar resultados" })).not.toBeInTheDocument();
    rerender(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={cards.slice(0, 3).map((card) => card.id)} />);
    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeEnabled();
  });

  it("muestra el envío en curso, deshabilita el doble clic y solo manda los tres campos", async () => {
    let resolveRequest!: (response: { ok: boolean }) => void;
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<{ ok: boolean }>>(() => new Promise<{ ok: boolean }>((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const selectedCardIds = cards.slice(0, 3).map((card) => card.id);
    render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={selectedCardIds} />);

    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    const sending = screen.getByRole("button", { name: "Enviando..." });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string)).toEqual({ sessionId, phaseId: phase.id, collectiveId, selectedCardIds });

    resolveRequest({ ok: true });
    expect(await screen.findByText("Resultados enviados correctamente")).toBeInTheDocument();
    const sent = screen.getByRole("button", { name: "Enviar resultados" });
    expect(sent).toBeDisabled();
    await user.click(sent);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("muestra el error y permite reintentar sin alterar la selección", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const selectedCardIds = cards.slice(0, 3).map((card) => card.id);
    render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={selectedCardIds} />);

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
    const { rerender } = render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={firstSelection} />);
    await user.click(screen.getByRole("button", { name: "Enviar resultados" }));
    expect(await screen.findByText("Resultados enviados correctamente")).toBeInTheDocument();

    rerender(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={[cards[0].id, cards[1].id, cards[3].id]} />);
    expect(screen.queryByText("Resultados enviados correctamente")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeEnabled();
  });

  it("mantiene deshabilitada una combinación enviada tras volver a montar el botón", () => {
    const selectedCardIds = cards.slice(0, 3).map((card) => card.id);
    render(<PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collectiveId} selectedCardIds={selectedCardIds} selectionAlreadySent />);

    expect(screen.getByRole("button", { name: "Enviar resultados" })).toBeDisabled();
    expect(screen.getByText("Resultados enviados correctamente")).toBeInTheDocument();
  });
});

describe("componentes principales", () => {
  it("confirma el envío de una fase y la deja en modo lectura", async () => {
    const phase = workshopConfig.phases[0];
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((configuredPhase) => [configuredPhase.id, configuredPhase.id === phase.id ? workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, 3).map((card) => card.id) : []]));
    localStorage.setItem("justicia2030:v1:team", JSON.stringify({ schemaVersion: 4, sessionId: "123e4567-e89b-42d3-a456-426614174000", selectionsByPhase, collectiveId: workshopConfig.collectives[0].id, sentPhaseIds: [] }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);

    await user.click(await screen.findByRole("button", { name: "Enviar y continuar" }));
    expect(await screen.findByRole("dialog", { name: `¡Fase ${phase.order} enviada correctamente!` })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar y continuar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Quitar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Seleccionar" })).not.toBeInTheDocument();
  });

  it("muestra la confirmación final al enviar la última fase", async () => {
    const phase = workshopConfig.phases.at(-1)!;
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((configuredPhase) => [configuredPhase.id, configuredPhase.id === phase.id ? workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, 3).map((card) => card.id) : []]));
    localStorage.setItem("justicia2030:v1:team", JSON.stringify({ schemaVersion: 4, sessionId: "123e4567-e89b-42d3-a456-426614174000", selectionsByPhase, collectiveId: workshopConfig.collectives[0].id, sentPhaseIds: workshopConfig.phases.slice(0, -1).map((configuredPhase) => configuredPhase.id) }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const user = userEvent.setup();
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);

    await user.click(await screen.findByRole("button", { name: "Enviar y continuar" }));
    expect(await screen.findByRole("dialog", { name: "¡Enhorabuena! Ya habéis completado todas las fases." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aceptar" })).toBeInTheDocument();
  });

  it("muestra tarjetas de fase sin controles de envío", async () => {
    const user = userEvent.setup();
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((phase) => [phase.id, workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, workshopConfig.maxSelectionsPerPhase).map((card) => card.id)]));
    localStorage.setItem("justicia2030:v1:team", JSON.stringify({ schemaVersion: 3, sessionId: "123e4567-e89b-42d3-a456-426614174000", selectionsByPhase, collectiveId: workshopConfig.collectives[0].id }));
    render(<WorkshopProvider scope="team"><TeamSummary /></WorkshopProvider>);

    expect(await screen.findAllByRole("link", { name: "Ver tarjetas" })).toHaveLength(workshopConfig.phases.length);
    expect(screen.getByRole("list", { name: `Tarjetas seleccionadas de ${workshopConfig.phases[0].name}` })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar resultados" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fases del workshop" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Abandonar partida" }));
    expect(screen.getByRole("alertdialog", { name: "Nueva partida" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Empezar nueva partida" })).toBeInTheDocument();
  });

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
      expect(persisted.schemaVersion).toBe(4);
      expect(persisted.sessionId).not.toBe(previousSessionId);
      expect(persisted.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
      expect(persisted.sentPhaseIds).toEqual([]);
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
    expect(screen.getByRole("button", { name: "Seleccionar" })).toBeDisabled();
  });

  it("muestra el estado vacío y avance sin límite en la bandeja del dinamizador", async () => {
    const user = userEvent.setup();
    const onPreviousPhase = vi.fn();
    const onNextPhase = vi.fn();
    render(<SelectionTray config={workshopConfig} phaseId={workshopConfig.phases[0].id} selectedIds={[]} unlimited onPreviousPhase={onPreviousPhase} onNextPhase={onNextPhase} onRemove={vi.fn()} />);
    expect(screen.getByText("0 tarjetas")).toBeInTheDocument();
    expect(screen.queryByText(`0/${workshopConfig.maxSelectionsPerPhase} tarjetas`)).not.toBeInTheDocument();
    expect(screen.getByText("Seleccionad tarjetas para esta fase.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fase anterior" }));
    await user.click(screen.getByRole("button", { name: "Siguiente fase" }));
    expect(onPreviousPhase).toHaveBeenCalledOnce();
    expect(onNextPhase).toHaveBeenCalledOnce();
  });

  it("filtra tarjetas por categoría dentro del explorador", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: `FASE ${phase.order} - ${phase.name}` });
    await user.click(screen.getByRole("button", { name: "Personas" }));
    const expected = workshopConfig.cards.filter((card) => card.phaseId === phase.id && card.categoryId === "personas");
    for (const card of expected) expect(screen.getByRole("heading", { name: card.title })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Simplificación procesal" })).not.toBeInTheDocument();
  });

  it("permite seleccionar y quitar desde la bandeja", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="team"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: `FASE ${phase.order} - ${phase.name}` });
    await user.click(screen.getAllByRole("button", { name: "Seleccionar" })[0]);
    expect(screen.getByText("1/3 tarjetas")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: new RegExp(`Quitar ${workshopConfig.cards[0].title}`) }));
    expect(screen.getByText("0/3 tarjetas")).toBeInTheDocument();
  });

  it("obliga a elegir un colectivo y muestra su descripción", async () => {
    const user = userEvent.setup();
    const { container } = render(<WorkshopProvider scope="team"><CollectiveSelector /></WorkshopProvider>);
    await screen.findByLabelText("Seleccionad un colectivo");
    const start = screen.getByRole("button", { name: "Comenzar partida" });
    expect(start).toBeDisabled();
    const collective = workshopConfig.collectives[0];
    await user.selectOptions(screen.getByLabelText("Seleccionad un colectivo"), collective.id);
    expect(screen.getByText(collective.description)).toBeInTheDocument();
    expect(start).toBeEnabled();

    const fiscalia = workshopConfig.collectives.find((item) => item.name === "Fiscalía")!;
    await user.selectOptions(screen.getByLabelText("Seleccionad un colectivo"), fiscalia.id);
    expect(container.querySelector('img[src="/collectives/fiscalia/icon.svg"]')).toBeInTheDocument();
    expect(container.querySelector('img[src*="illustration"]')).toBeInTheDocument();
  });

  it("muestra el detalle como diálogo y permite cerrarlo con Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<WorkshopProvider scope="team"><CardDetailModal card={workshopConfig.cards[0]} onClose={onClose} /></WorkshopProvider>);
    expect(screen.getByRole("dialog", { name: `Detalle de ${workshopConfig.cards[0].title}` })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("oculta la selección al abrir el detalle de una fase enviada", async () => {
    const phase = workshopConfig.phases[0];
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((configuredPhase) => [configuredPhase.id, []]));
    localStorage.setItem("justicia2030:v1:team", JSON.stringify({ schemaVersion: 4, sessionId: "123e4567-e89b-42d3-a456-426614174000", selectionsByPhase, collectiveId: workshopConfig.collectives[0].id, sentPhaseIds: [phase.id] }));

    render(<WorkshopProvider scope="team"><CardDetailModal card={workshopConfig.cards.find((card) => card.phaseId === phase.id)!} onClose={vi.fn()} /></WorkshopProvider>);

    await waitFor(() => expect(screen.queryByRole("button", { name: "Seleccionar tarjeta" })).not.toBeInTheDocument());
  });

  it("permite al dinamizador seleccionar más de tres tarjetas", async () => {
    const user = userEvent.setup();
    const phase = workshopConfig.phases[0];
    render(<WorkshopProvider scope="facilitator"><PhaseExplorer phaseId={phase.id} onOpenDetail={vi.fn()} /></WorkshopProvider>);
    await screen.findByRole("heading", { name: `FASE ${phase.order} - ${phase.name}` });
    const selectButtons = screen.getAllByRole("button", { name: "Seleccionar" });
    for (const button of selectButtons.slice(0, 4)) await user.click(button);
    expect(screen.getByText("4 tarjetas")).toBeInTheDocument();
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
