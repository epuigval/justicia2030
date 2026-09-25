import { describe, expect, it, vi } from "vitest";
import { storageKeys, workshopConfig } from "@/config/workshop";
import { createEmptySelections } from "@/domain/selections";
import { isValidSessionId } from "@/domain/session";
import { createStorageAdapter, parsePersistedState } from "@/persistence/storage";

const SESSION_ID = "123e4567-e89b-42d3-a456-426614174000";

describe("persistencia V3", () => {
  it("serializa y restaura un estado válido", () => {
    const storage = window.localStorage;
    storage.clear();
    const selectionsByPhase = createEmptySelections(workshopConfig);
    selectionsByPhase[workshopConfig.phases[0].id] = [workshopConfig.cards[0].id];
    const adapter = createStorageAdapter(storage, storageKeys.team);
    const session = { sessionId: SESSION_ID, selectionsByPhase, collectiveId: workshopConfig.collectives[0].id, sentPhaseIds: [workshopConfig.phases[0].id] };
    expect(adapter.write(session).ok).toBe(true);
    expect(adapter.read(workshopConfig)).toEqual({ ok: true, value: session });
  });

  it("migra V1 a V3 conservando selecciones y creando sesión", () => {
    const selectionsByPhase = createEmptySelections(workshopConfig);
    selectionsByPhase[workshopConfig.phases[0].id] = [workshopConfig.cards[0].id];
    const result = parsePersistedState(JSON.stringify({ schemaVersion: 1, selectionsByPhase }), workshopConfig);
    expect(result.value.selectionsByPhase).toEqual(selectionsByPhase);
    expect(result.value.collectiveId).toBeNull();
    expect(isValidSessionId(result.value.sessionId)).toBe(true);
  });

  it("migra V2 conservando selecciones y colectivo", () => {
    const selectionsByPhase = createEmptySelections(workshopConfig);
    const collectiveId = workshopConfig.collectives[0].id;
    const result = parsePersistedState(JSON.stringify({ schemaVersion: 2, selectionsByPhase, collectiveId }), workshopConfig);
    expect(result.value.selectionsByPhase).toEqual(selectionsByPhase);
    expect(result.value.collectiveId).toBe(collectiveId);
    expect(isValidSessionId(result.value.sessionId)).toBe(true);
  });

  it("V3 conserva un sessionId válido", () => {
    const selectionsByPhase = createEmptySelections(workshopConfig);
    expect(parsePersistedState(JSON.stringify({ schemaVersion: 3, sessionId: SESSION_ID, selectionsByPhase, collectiveId: null }), workshopConfig).value.sessionId).toBe(SESSION_ID);
  });

  it("una nueva partida obtiene un UUID distinto", () => {
    localStorage.clear();
    const adapter = createStorageAdapter(localStorage, storageKeys.team);
    const first = adapter.read(workshopConfig).value.sessionId;
    adapter.remove();
    const second = adapter.read(workshopConfig).value.sessionId;
    expect(isValidSessionId(first)).toBe(true);
    expect(isValidSessionId(second)).toBe(true);
    expect(second).not.toBe(first);
  });

  it("usa claves separadas", () => expect(storageKeys.team).not.toBe(storageKeys.facilitator));

  it("reiniciar equipo no modifica dinamizador", () => {
    localStorage.clear();
    localStorage.setItem(storageKeys.team, "team");
    localStorage.setItem(storageKeys.facilitator, "facilitator");
    createStorageAdapter(localStorage, storageKeys.team).remove();
    expect(localStorage.getItem(storageKeys.team)).toBeNull();
    expect(localStorage.getItem(storageKeys.facilitator)).toBe("facilitator");
  });

  it("reiniciar dinamizador no modifica equipo", () => {
    localStorage.clear();
    localStorage.setItem(storageKeys.team, "team");
    localStorage.setItem(storageKeys.facilitator, "facilitator");
    createStorageAdapter(localStorage, storageKeys.facilitator).remove();
    expect(localStorage.getItem(storageKeys.team)).toBe("team");
    expect(localStorage.getItem(storageKeys.facilitator)).toBeNull();
  });

  it("descarta JSON ilegible sin lanzar", () => {
    const result = parsePersistedState("{no", workshopConfig);
    expect(result.ok).toBe(false);
    expect(result.value.selectionsByPhase).toEqual(createEmptySelections(workshopConfig));
    expect(result.value.collectiveId).toBeNull();
    expect(isValidSessionId(result.value.sessionId)).toBe(true);
  });

  it("descarta una versión o sesión incompatible", () => {
    expect(parsePersistedState(JSON.stringify({ schemaVersion: 4 }), workshopConfig).ok).toBe(false);
    expect(parsePersistedState(JSON.stringify({ schemaVersion: 3, sessionId: "inválida", selectionsByPhase: createEmptySelections(workshopConfig), collectiveId: null }), workshopConfig).ok).toBe(false);
  });

  it("sobrevive a una excepción básica de almacenamiento", () => {
    const storage = { getItem: vi.fn(() => { throw new Error("blocked"); }) } as unknown as Storage;
    expect(createStorageAdapter(storage, storageKeys.team).read(workshopConfig).ok).toBe(false);
  });

  it("persiste versión, sesión, selecciones, colectivo y fases enviadas", () => {
    localStorage.clear();
    createStorageAdapter(localStorage, storageKeys.team).write({ sessionId: SESSION_ID, selectionsByPhase: createEmptySelections(workshopConfig), collectiveId: null, sentPhaseIds: [] });
    expect(Object.keys(JSON.parse(localStorage.getItem(storageKeys.team)!))).toEqual(["schemaVersion", "sessionId", "selectionsByPhase", "collectiveId", "sentPhaseIds"]);
  });
});
