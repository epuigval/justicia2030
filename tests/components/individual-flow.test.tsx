import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";
import IndividualLayout from "@/app/individual/layout";
import { AppShell } from "@/components/app-shell";
import { HomeActions } from "@/components/home-actions";
import { splitInterpretationText } from "@/components/individual-completion-modal";
import { IndividualOverview } from "@/components/individual-overview";
import { IndividualPhase } from "@/components/individual-phase";
import { IndividualResult } from "@/components/individual-result";
import { IndividualStart } from "@/components/individual-start";
import { individualResultTextsV1 } from "@/config/individual-results";
import { storageKeys, workshopConfig } from "@/config/workshop";
import { IndividualProvider, useIndividualParticipation } from "@/context/individual-context";
import type { IndividualCatalog, IndividualSessionState } from "@/domain/individual-flow";
import { INDIVIDUAL_STORAGE_KEY } from "@/persistence/individual-storage";

const navigation = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
const credentials = vi.hoisted(() => ({
  participationId: "123e4567-e89b-42d3-a456-426614174000",
  writeToken: "abcdefghijklmnopqrstuvwxyzABCDEFGH1234567890_-",
}));

vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
vi.mock("@/domain/individual-credentials", () => ({ createIndividualCredentials: () => credentials }));

const catalog: IndividualCatalog = {
  collectives: [
    { id: "universidad-talento-joven", name: "Universidad y talento joven" },
    { id: "profesionales-juridicos", name: "Profesionales jurídicos" },
  ],
  subprofiles: [
    { id: "universidad-talento-joven--estudiante", collectiveId: "universidad-talento-joven", name: "Estudiante" },
    { id: "profesionales-juridicos--abogacia", collectiveId: "profesionales-juridicos", name: "Abogacía" },
  ],
};

function selectedCardIds() {
  return Object.fromEntries(workshopConfig.phases.map((phase) => [
    phase.id,
    workshopConfig.cards.filter((card) => card.phaseId === phase.id && [1, 3, 5].includes(((card.order - 1) % 8) + 1)).map((card) => card.id),
  ]));
}

function persistedState(overrides: Partial<IndividualSessionState> = {}) {
  return {
    schemaVersion: 1,
    participationId: credentials.participationId,
    writeToken: credentials.writeToken,
    collectiveId: "universidad-talento-joven",
    subprofileId: null,
    selectionsByPhase: Object.fromEntries(workshopConfig.phases.map((phase) => [phase.id, []])),
    currentPhaseId: "justicia-actual",
    completed: false,
    resultCode: null,
    completedAt: null,
    ...overrides,
  };
}

function completedState(overrides: Partial<IndividualSessionState> = {}) {
  return persistedState({
    writeToken: null,
    selectionsByPhase: selectedCardIds(),
    completed: true,
    resultCode: "vision-integral",
    completedAt: "2026-10-15T10:00:00.000Z",
    ...overrides,
  });
}

function ReloadProbe() {
  const state = useIndividualParticipation();
  if (!state.hydrated) return null;
  return <output>{state.participationId}:{Object.values(state.selectionsByPhase).flat().length}</output>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
  navigation.push.mockReset();
  navigation.replace.mockReset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("inicio Individual", () => {
  it("exige colectivo, filtra perfiles y permite iniciar sin perfil", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualStart catalog={catalog} /></IndividualProvider>);

    const begin = await screen.findByRole("button", { name: "Continuar" });
    expect(begin).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Colectivo")).toHaveClass("appearance-none", "pr-11");
    expect(screen.getByLabelText("Perfil (opcional)")).toHaveClass("appearance-none", "pr-11");

    await user.selectOptions(screen.getByLabelText("Colectivo"), "universidad-talento-joven");
    expect(screen.getByText("Estudiante, docente o investigador interesado en el ámbito de la Justicia y en cómo la innovación, el conocimiento y las nuevas tecnologías pueden contribuir a su evolución.")).toBeInTheDocument();
    const subprofile = screen.getByLabelText("Perfil (opcional)");
    expect(within(subprofile).getByRole("option", { name: "Estudiante" })).toBeInTheDocument();
    expect(within(subprofile).queryByRole("option", { name: "Abogacía" })).not.toBeInTheDocument();
    await user.click(begin);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/individual/participations");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      ...credentials,
      collectiveId: "universidad-talento-joven",
      subprofileId: null,
    });
    expect(navigation.push).toHaveBeenCalledWith("/individual/overview");
    await waitFor(() => expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).not.toBeNull());
    expect(fetchMock.mock.calls.some(([url]) => url === "/api/send-phase-result")).toBe(false);
  });

  it("envía sólo un perfil perteneciente al colectivo seleccionado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualStart catalog={catalog} /></IndividualProvider>);

    await user.selectOptions(await screen.findByLabelText("Colectivo"), "profesionales-juridicos");
    expect(document.querySelector('img[src*="operadores-juridicos"]')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Perfil (opcional)"), "profesionales-juridicos--abogacia");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subprofileId).toBe("profesionales-juridicos--abogacia");
  });

  it("recupera estado Individual desde almacenamiento al volver a montar", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({
      selectionsByPhase: { ...persistedState().selectionsByPhase, "justicia-actual": ["justicia-actual-tarjeta-1"] },
    })));
    render(<IndividualProvider><ReloadProbe /></IndividualProvider>);
    expect(await screen.findByText(`${credentials.participationId}:1`)).toBeInTheDocument();
  });

  it("redirige una participación started existente a la Vista principal", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState()));
    render(<IndividualProvider><IndividualStart catalog={catalog} /></IndividualProvider>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/individual/overview"));
  });
});

describe("entrada y cabecera Individual", () => {
  it("mantiene enlazado el logo del flujo Actual", () => {
    const { container } = render(<AppShell><span>Actual</span></AppShell>);
    expect(container.querySelector('header a[href="/"]')).toBeInTheDocument();
  });

  it("muestra el logo Individual sin navegación", () => {
    const { container } = render(<IndividualLayout><span>Individual</span></IndividualLayout>);
    expect(container.querySelector('header a')).not.toBeInTheDocument();
    expect(screen.getByText("JUSTICIA")).toBeInTheDocument();
  });

  it("muestra el nuevo copy, selector, placeholder y las tres modalidades", async () => {
    render(<HomePage />);

    expect(screen.getByText("Explora las propuestas y selecciona 3 prioridades por cada fase para construir tu visión de la justicia del futuro.")).toBeInTheDocument();
    const select = await screen.findByLabelText("Elige cómo quieres participar");
    expect(select).toHaveValue("");
    expect(within(select).getByRole("option", { name: "Seleccionar una opción" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Equipo" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Participante individual" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Dinamizador" })).toBeInTheDocument();
    expect(select).toHaveClass("appearance-none", "pr-12");
    expect(screen.getByRole("button", { name: "Iniciar partida" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Ver resultados generales" })).toHaveAttribute("href", "/dashboard?origin=home");
  });

  it("inicia Equipo y Dinamizador sin borrar la participación Individual", async () => {
    const persisted = JSON.stringify(persistedState());
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, persisted);
    const user = userEvent.setup();
    render(<HomeActions />);

    const select = await screen.findByLabelText("Elige cómo quieres participar");
    await user.selectOptions(select, "team");
    await user.click(screen.getByRole("button", { name: "Iniciar partida" }));
    expect(navigation.push).toHaveBeenLastCalledWith("/team");
    expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).toBe(persisted);

    await user.selectOptions(select, "facilitator");
    await user.click(screen.getByRole("button", { name: "Iniciar partida" }));
    expect(navigation.push).toHaveBeenLastCalledWith("/facilitator");
    expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).toBe(persisted);
  });

  it("muestra Continuar partida para un Equipo que ya eligió colectivo", async () => {
    localStorage.setItem(storageKeys.team, JSON.stringify({
      schemaVersion: 4,
      sessionId: credentials.participationId,
      selectionsByPhase: Object.fromEntries(workshopConfig.phases.map((phase) => [phase.id, []])),
      collectiveId: workshopConfig.collectives[0].id,
      sentPhaseIds: [],
    }));
    const user = userEvent.setup();
    render(<HomeActions />);

    await user.selectOptions(await screen.findByLabelText("Elige cómo quieres participar"), "team");
    await user.click(screen.getByRole("button", { name: "Continuar partida" }));

    expect(navigation.push).toHaveBeenCalledWith("/team");
  });

  it("inicia Individual sin estado local", async () => {
    const user = userEvent.setup();
    render(<HomeActions />);

    await user.selectOptions(await screen.findByLabelText("Elige cómo quieres participar"), "individual");
    await user.click(screen.getByRole("button", { name: "Iniciar partida" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual");
  });

  it("continúa una participación Individual started desde la Vista principal", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase: selectedCardIds() })));
    const user = userEvent.setup();

    render(<HomeActions />);
    await user.selectOptions(await screen.findByLabelText("Elige cómo quieres participar"), "individual");
    await user.click(screen.getByRole("button", { name: "Continuar partida" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual/overview");
  });

  it("muestra el resultado conservado de una participación Individual completed", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(completedState()));
    const user = userEvent.setup();

    render(<HomeActions />);
    await user.selectOptions(await screen.findByLabelText("Elige cómo quieres participar"), "individual");
    await user.click(screen.getByRole("button", { name: "Ver resultado" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual/result");
  });
});

describe("Vista principal Individual", () => {
  it("muestra Ver tarjetas en las tres fases, permite abrirlas y conserva selecciones", async () => {
    const selectionsByPhase = persistedState().selectionsByPhase;
    selectionsByPhase["justicia-actual"] = ["justicia-actual-tarjeta-1", "justicia-actual-tarjeta-2", "justicia-actual-tarjeta-3"];
    selectionsByPhase["justicia-conectada"] = ["justicia-conectada-tarjeta-1"];
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase })));

    render(<IndividualProvider><IndividualOverview /></IndividualProvider>);

    expect(await screen.findByRole("heading", { name: "Tu camino hacia Justicia 2030" })).toBeInTheDocument();
    for (const phase of workshopConfig.phases) expect(screen.getByRole("heading", { name: phase.name })).toBeInTheDocument();
    expect(screen.getByText(workshopConfig.cards.find((card) => card.id === "justicia-actual-tarjeta-1")!.title)).toBeInTheDocument();
    expect(screen.getByText(workshopConfig.cards.find((card) => card.id === "justicia-conectada-tarjeta-1")!.title)).toBeInTheDocument();
    const phaseLinks = screen.getAllByRole("link", { name: "Ver tarjetas" });
    expect(phaseLinks).toHaveLength(3);
    expect(phaseLinks[0]).toHaveAttribute("href", "/individual/phase/justicia-actual");
    expect(phaseLinks[1]).toHaveAttribute("href", "/individual/phase/justicia-conectada");
    expect(phaseLinks[2]).toHaveAttribute("href", "/individual/phase/justicia-inteligente");
    await waitFor(() => expect(JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!).selectionsByPhase).toEqual(selectionsByPhase));
  });

  it("mantiene las tres fases editables desde overview cuando hay nueve selecciones started", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase: selectedCardIds() })));
    render(<IndividualProvider><IndividualOverview /></IndividualProvider>);

    expect(await screen.findAllByRole("link", { name: "Ver tarjetas" })).toHaveLength(3);
    expect(screen.queryByRole("link", { name: "Ver resultado" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abandonar participación" })).toBeInTheDocument();
  });

  it("redirige un resultado completed sin permitir editarlo", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(completedState()));
    render(<IndividualProvider><IndividualOverview /></IndividualProvider>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/individual/result"));
    expect(screen.queryByRole("link", { name: "Ver tarjetas" })).not.toBeInTheDocument();
  });
});

describe("fases Individual", () => {
  it("abre el detalle sin depender de WorkshopProvider", async () => {
    const persisted = JSON.stringify(persistedState());
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, persisted);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    expect(await screen.findByRole("link", { name: "Volver a Vista Principal" })).toHaveAttribute("href", "/individual/overview");
    expect(screen.getByText("Aún no has seleccionado ninguna tarjeta.")).toBeInTheDocument();
    expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).toBe(persisted);
    await user.click((await screen.findAllByRole("button", { name: "Ver detalle" }))[0]);
    const card = workshopConfig.cards.find((item) => item.phaseId === "justicia-actual")!;
    const dialog = screen.getByRole("dialog", { name: `Detalle de ${card.title}` });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: "El reto" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Seleccionar tarjeta" }));
    expect(within(dialog).getByText("Seleccionada")).toBeInTheDocument();
  });

  it("muestra Guardar y continuar y avanza a una fase incompleta sin completar en remoto", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState()));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    const selectButtons = await screen.findAllByRole("button", { name: "Seleccionar" });
    await user.click(selectButtons[0]);
    await user.click(selectButtons[1]);
    await user.click(selectButtons[2]);

    expect(screen.getAllByText("Seleccionada")).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: "Seleccionar" })[0]).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Guardar y continuar" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual/phase/justicia-conectada");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("abre el modal al completar la última fase pendiente aunque sea la fase 1", async () => {
    const selectionsByPhase = selectedCardIds();
    selectionsByPhase["justicia-actual"] = selectionsByPhase["justicia-actual"].slice(0, 2);
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase, currentPhaseId: "justicia-actual" })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    const replacement = workshopConfig.cards.find((card) => card.phaseId === "justicia-actual" && !selectionsByPhase["justicia-actual"].includes(card.id))!;
    const replacementArticle = (await screen.findByRole("heading", { name: replacement.title })).closest("article")!;
    await user.click(within(replacementArticle).getByRole("button", { name: "Seleccionar" }));

    const save = screen.getByRole("button", { name: "Guardar y continuar" });
    expect(save).toBeEnabled();
    await user.click(save);

    const dialog = screen.getByRole("dialog");
    const modalTitle = within(dialog).getByRole("heading").textContent;
    const matchingInterpretation = Object.values(individualResultTextsV1).find((text) => text.startsWith(modalTitle ?? ""));
    expect(matchingInterpretation).toBeDefined();
    expect(dialog.querySelector("#individual-completion-body")?.textContent).toBe(matchingInterpretation!.slice(modalTitle!.length).trim());
    expect(dialog.querySelector('img[src="/icons/check_circle.svg"]')).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Editar tarjetas" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Guardar y finalizar" })).toBeInTheDocument();
    expect(navigation.push).not.toHaveBeenCalledWith("/individual/result");
  });

  it("permite entrar directamente en las fases 2 y 3", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState()));
    const connected = render(<IndividualProvider><IndividualPhase phaseId="justicia-conectada" /></IndividualProvider>);
    expect(await screen.findByRole("heading", { name: /FASE 2 - Justicia Conectada/ })).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalledWith("/individual/phase/justicia-actual");

    connected.unmount();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-inteligente" /></IndividualProvider>);
    expect(await screen.findByRole("heading", { name: /FASE 3 - Justicia Inteligente/ })).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalledWith("/individual/phase/justicia-actual");
  });

  it("hace wrap y avanza desde la fase 3 a la siguiente fase incompleta", async () => {
    const selectionsByPhase = persistedState().selectionsByPhase;
    selectionsByPhase["justicia-inteligente"] = selectedCardIds()["justicia-inteligente"];
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase, currentPhaseId: "justicia-inteligente" })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-inteligente" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual/phase/justicia-actual");
  });

  it("salta fases completas y nunca vuelve a enviarlas como siguiente destino", async () => {
    const selectionsByPhase = persistedState().selectionsByPhase;
    const completeSelections = selectedCardIds();
    selectionsByPhase["justicia-conectada"] = completeSelections["justicia-conectada"];
    selectionsByPhase["justicia-inteligente"] = completeSelections["justicia-inteligente"];
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase, currentPhaseId: "justicia-conectada" })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-conectada" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));
    expect(navigation.push).toHaveBeenCalledWith("/individual/phase/justicia-actual");
  });

  it("Editar tarjetas conserva selecciones y vuelve a overview sin escribir en remoto", async () => {
    const selectionsByPhase = selectedCardIds();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Editar tarjetas" }));

    expect(navigation.push).toHaveBeenCalledWith("/individual/overview");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!).selectionsByPhase).toEqual(selectionsByPhase);
  });

  it("recalcula la interpretación después de editar una tarjeta", async () => {
    const selectionsByPhase = selectedCardIds();
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    const phaseCards = workshopConfig.cards.filter((card) => card.phaseId === "justicia-actual");
    const selectedCard = phaseCards.find((card) => selectionsByPhase["justicia-actual"].includes(card.id))!;
    const replacementCard = phaseCards.find((card) => !selectionsByPhase["justicia-actual"].includes(card.id))!;
    await user.click(within(screen.getByRole("heading", { name: selectedCard.title }).closest("article")!).getByRole("button", { name: "Quitar" }));
    await user.click(within(screen.getByRole("heading", { name: replacementCard.title }).closest("article")!).getByRole("button", { name: "Seleccionar" }));
    await user.click(screen.getByRole("button", { name: "Guardar y continuar" }));

    const expectedIds = Object.values({ ...selectionsByPhase, "justicia-actual": selectionsByPhase["justicia-actual"].filter((id) => id !== selectedCard.id).concat(replacementCard.id) }).flat();
    const expectedCode = (await import("@/domain/individual-participation")).calculateInterpretationV1(expectedIds.map((id) => workshopConfig.cards.find((card) => card.id === id)!.categoryId));
    expect(expectedCode).not.toBeNull();
    const expectedText = splitInterpretationText(individualResultTextsV1[expectedCode!]);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: expectedText.title })).toBeInTheDocument();
    expect(within(dialog).getByText(expectedText.body)).toBeInTheDocument();
  });

  it.each(["justicia-actual", "justicia-conectada", "justicia-inteligente"] as const)("abre el modal si la última fase pendiente es %s", async (phaseId) => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase: selectedCardIds(), currentPhaseId: phaseId })));
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId={phaseId} /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Guardar y finalizar llama una sola vez, persiste completed y navega al resultado", async () => {
    const selectionsByPhase = selectedCardIds();
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase })));
    let resolveRequest!: (response: { ok: boolean; json: () => Promise<Record<string, string>> }) => void;
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<{ ok: boolean; json: () => Promise<Record<string, string>> }>>(() => new Promise((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-inteligente" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));
    await user.click(screen.getByRole("button", { name: "Guardar y finalizar" }));
    expect(screen.getByRole("button", { name: "Guardar y finalizar" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Guardar y finalizar" }));
    expect(fetchMock).toHaveBeenCalledOnce();

    resolveRequest({
      ok: true,
      json: async () => ({ status: "completed", resultCode: "vision-integral", completedAt: "2026-10-15T10:00:00.000Z" }),
    });

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/individual/result"));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/individual/participations/${credentials.participationId}/complete`);
    expect(JSON.parse(fetchMock.mock.calls[0]![1]!.body as string)).toEqual({ writeToken: credentials.writeToken, selectedCardIds: Object.values(selectionsByPhase).flat() });
    await waitFor(() => {
      const persisted = JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!);
      expect(persisted.completed).toBe(true);
      expect(persisted.writeToken).toBeNull();
      expect(persisted.selectionsByPhase).toEqual(selectionsByPhase);
    });
  });

  it("mantiene el modal y permite reintentar si complete falla", async () => {
    const selectionsByPhase = selectedCardIds();
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase })));
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "completed", resultCode: "vision-integral", completedAt: "2026-10-15T10:00:00.000Z" }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-inteligente" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Guardar y continuar" }));
    await user.click(screen.getByRole("button", { name: "Guardar y finalizar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo finalizar la participación");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar y finalizar" })).toBeEnabled();
    expect(JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!).completed).toBe(false);
    expect(navigation.push).not.toHaveBeenCalledWith("/individual/result");

    await user.click(screen.getByRole("button", { name: "Guardar y finalizar" }));
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/individual/result"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("abandona desde una fase sin completar ni modificar la participación remota", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState()));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    await user.click(await screen.findByRole("button", { name: "Abandonar participación" }));
    const dialog = screen.getByRole("alertdialog", { name: "Abandonar participación" });
    await user.click(within(dialog).getByRole("button", { name: "Abandonar participación" }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).toBeNull();
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith("/");
  });

  it("redirige una participación completed a resultado sin permitir editar la fase", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(completedState()));
    render(<IndividualProvider><IndividualPhase phaseId="justicia-actual" /></IndividualProvider>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/individual/result"));
    expect(screen.queryByRole("button", { name: "Quitar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Seleccionar" })).not.toBeInTheDocument();
  });
});

describe("resultado Individual", () => {
  it("muestra completed en solo lectura, sin complete ni acciones de partida", async () => {
    const selectionsByPhase = selectedCardIds();
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(completedState({ selectionsByPhase })));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<IndividualProvider><IndividualResult /></IndividualProvider>);

    expect(await screen.findByRole("heading", { name: "Así imaginas la Justicia del futuro" })).toBeInTheDocument();
    expect(screen.getByText(individualResultTextsV1["vision-integral"])).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.queryByRole("button", { name: "Finalizar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Abandonar participación" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Modificar selección" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar nueva partida" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver resultados generales" })).toHaveAttribute("href", "/dashboard?origin=result");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("recupera completed tras recarga, queda en solo lectura y permite iniciar otra participación", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(completedState()));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<IndividualProvider><IndividualResult /></IndividualProvider>);

    expect(await screen.findByRole("button", { name: "Iniciar nueva partida" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Así imaginas la Justicia del futuro" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(9);
    expect(screen.queryByRole("link", { name: "Modificar selección" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Finalizar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver resultados generales" })).toHaveAttribute("href", "/dashboard?origin=result");
    expect(screen.queryByText("Participación completada")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Iniciar nueva partida" }));
    expect(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)).toBeNull();
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith("/individual");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirige una participación started a overview sin completar automáticamente", async () => {
    localStorage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persistedState({ selectionsByPhase: selectedCardIds() })));
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<IndividualProvider><IndividualResult /></IndividualProvider>);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/individual/overview"));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Así imaginas la Justicia del futuro" })).not.toBeInTheDocument();
  });
});

describe("configuración de resultados", () => {
  it("incluye los once códigos estables de interpretation-v1", () => {
    expect(Object.keys(individualResultTextsV1)).toHaveLength(11);
    expect(Object.values(individualResultTextsV1).every((text) => text.length > 100)).toBe(true);
  });
});
