import type { PersistedWorkshopStateV1, SelectionsByPhase, WorkshopConfig } from "@/domain/types";
import { createEmptySelections } from "@/domain/selections";

export type StorageResult<T> = { ok: true; value: T } | { ok: false; value: T; message: string };

export interface WorkshopStorageAdapter {
  read(config: WorkshopConfig): StorageResult<SelectionsByPhase>;
  write(selections: SelectionsByPhase): StorageResult<null>;
  remove(): StorageResult<null>;
}

export function parsePersistedState(value: string, config: WorkshopConfig): StorageResult<SelectionsByPhase> {
  const empty = createEmptySelections(config);
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") throw new Error("shape");
    const candidate = parsed as Partial<PersistedWorkshopStateV1>;
    if (candidate.schemaVersion !== 1 || !candidate.selectionsByPhase || typeof candidate.selectionsByPhase !== "object") throw new Error("version");
    const entries = config.phases.map((phase) => {
      const ids = candidate.selectionsByPhase?.[phase.id];
      if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) throw new Error("phase");
      return [phase.id, ids] as const;
    });
    return { ok: true, value: Object.fromEntries(entries) };
  } catch {
    return { ok: false, value: empty, message: "No se pudieron recuperar las selecciones guardadas. Se ha iniciado un estado vacío." };
  }
}

export function createStorageAdapter(storage: Storage, key: string): WorkshopStorageAdapter {
  return {
    read(config) {
      try {
        const raw = storage.getItem(key);
        return raw === null ? { ok: true, value: createEmptySelections(config) } : parsePersistedState(raw, config);
      } catch {
        return { ok: false, value: createEmptySelections(config), message: "El almacenamiento del navegador no está disponible. Puedes continuar en esta pestaña." };
      }
    },
    write(selections) {
      try {
        storage.setItem(key, JSON.stringify({ schemaVersion: 1, selectionsByPhase: selections } satisfies PersistedWorkshopStateV1));
        return { ok: true, value: null };
      } catch {
        return { ok: false, value: null, message: "No se pudieron guardar los cambios. Puedes continuar, pero podrían perderse al recargar." };
      }
    },
    remove() {
      try {
        storage.removeItem(key);
        return { ok: true, value: null };
      } catch {
        return { ok: false, value: null, message: "No se pudo borrar el estado guardado, pero la sesión se ha reiniciado en memoria." };
      }
    },
  };
}
