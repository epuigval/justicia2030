import { describe, expect, it } from "vitest";
import { workshopConfig } from "@/config/workshop";
import { createEmptySelections } from "@/domain/selections";
import { createIndividualStorageAdapter, INDIVIDUAL_STORAGE_KEY, parsePersistedIndividualState } from "@/persistence/individual-storage";

const participationId = "123e4567-e89b-42d3-a456-426614174000";
const writeToken = "abcdefghijklmnopqrstuvwxyzABCDEFGH1234567890_-";

function session(overrides: Record<string, unknown> = {}) {
  return {
    participationId,
    writeToken,
    collectiveId: "universidad-talento-joven",
    subprofileId: null,
    selectionsByPhase: createEmptySelections(workshopConfig),
    currentPhaseId: "justicia-actual" as const,
    completed: false,
    resultCode: null,
    completedAt: null,
    ...overrides,
  };
}

describe("persistencia Individual", () => {
  it("usa una clave aislada y recupera la participación tras recarga", () => {
    const storage = new Map<string, string>();
    const adapter = createIndividualStorageAdapter({
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => { storage.set(key, value); },
      removeItem: (key) => { storage.delete(key); },
      clear: () => storage.clear(),
      key: () => null,
      get length() { return storage.size; },
    });

    expect(adapter.write(session())).toEqual({ ok: true, value: null });
    expect(storage.has(INDIVIDUAL_STORAGE_KEY)).toBe(true);
    expect(storage.has("justicia2030:v1:team")).toBe(false);
    expect(adapter.read()).toEqual({ ok: true, value: session() });
  });

  it("serializa sólo el contrato persistido y admite subperfil opcional", () => {
    localStorage.clear();
    const adapter = createIndividualStorageAdapter(localStorage);
    adapter.write({ ...session({ subprofileId: "universidad-talento-joven--estudiante" }), hydrated: true, storageNotice: "no persistir" } as never);

    const persisted = JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!);
    expect(persisted.subprofileId).toBe("universidad-talento-joven--estudiante");
    expect(persisted.hydrated).toBeUndefined();
    expect(persisted.storageNotice).toBeUndefined();
  });

  it("conserva un resultado completado tras recarga sin persistir el token de escritura", () => {
    localStorage.clear();
    const adapter = createIndividualStorageAdapter(localStorage);
    const selectionsByPhase = Object.fromEntries(workshopConfig.phases.map((phase) => [
      phase.id,
      workshopConfig.cards.filter((card) => card.phaseId === phase.id).slice(0, 3).map((card) => card.id),
    ]));
    const completed = session({
      selectionsByPhase,
      completed: true,
      resultCode: "vision-integral",
      completedAt: "2026-10-15T10:00:00.000Z",
    });

    expect(adapter.write(completed)).toEqual({ ok: true, value: null });
    expect(JSON.parse(localStorage.getItem(INDIVIDUAL_STORAGE_KEY)!).writeToken).toBeNull();
    expect(adapter.read()).toEqual({ ok: true, value: { ...completed, writeToken: null } });
  });

  it("rechaza selecciones imposibles o tarjetas de otra fase", () => {
    const tooMany = session({
      selectionsByPhase: {
        ...createEmptySelections(workshopConfig),
        "justicia-actual": workshopConfig.cards.filter((card) => card.phaseId === "justicia-actual").slice(0, 4).map((card) => card.id),
      },
    });
    expect(parsePersistedIndividualState(JSON.stringify({ schemaVersion: 1, ...tooMany })).ok).toBe(false);

    const wrongPhase = session({
      selectionsByPhase: {
        ...createEmptySelections(workshopConfig),
        "justicia-actual": ["justicia-conectada-tarjeta-1"],
      },
    });
    expect(parsePersistedIndividualState(JSON.stringify({ schemaVersion: 1, ...wrongPhase })).ok).toBe(false);
  });
});
