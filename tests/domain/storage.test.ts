import { describe, expect, it, vi } from "vitest";
import { storageKeys, workshopConfig } from "@/config/workshop";
import { createEmptySelections } from "@/domain/selections";
import { createStorageAdapter, parsePersistedState } from "@/persistence/storage";

describe("persistencia básica V1", () => {
  it("serializa y restaura un estado válido", () => {
    const storage = window.localStorage;
    storage.clear();
    const state = createEmptySelections(workshopConfig);
    state[workshopConfig.phases[0].id] = [workshopConfig.cards[0].id];
    const adapter = createStorageAdapter(storage, storageKeys.team);
    expect(adapter.write(state).ok).toBe(true);
    expect(adapter.read(workshopConfig)).toEqual({ ok: true, value: state });
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
    expect(result.value).toEqual(createEmptySelections(workshopConfig));
  });

  it("descarta una forma distinta de V1", () => expect(parsePersistedState(JSON.stringify({ schemaVersion: 2 }), workshopConfig).ok).toBe(false));

  it("sobrevive a una excepción básica de almacenamiento", () => {
    const storage = { getItem: vi.fn(() => { throw new Error("blocked"); }) } as unknown as Storage;
    expect(createStorageAdapter(storage, storageKeys.team).read(workshopConfig).ok).toBe(false);
  });

  it("persiste únicamente versión y selecciones", () => {
    localStorage.clear();
    createStorageAdapter(localStorage, storageKeys.team).write(createEmptySelections(workshopConfig));
    expect(Object.keys(JSON.parse(localStorage.getItem(storageKeys.team)!))).toEqual(["schemaVersion", "selectionsByPhase"]);
  });
});
