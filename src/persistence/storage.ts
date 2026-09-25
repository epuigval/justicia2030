import type { PersistedWorkshopStateV4, SelectionsByPhase, WorkshopConfig, WorkshopSessionState } from "@/domain/types";
import { createEmptySelections } from "@/domain/selections";
import { createSessionId, isValidSessionId } from "@/domain/session";

export type StorageResult<T> = { ok: true; value: T } | { ok: false; value: T; message: string };

export interface WorkshopStorageAdapter {
  read(config: WorkshopConfig): StorageResult<WorkshopSessionState>;
  write(state: WorkshopSessionState): StorageResult<null>;
  remove(): StorageResult<null>;
}

function emptySession(config: WorkshopConfig): WorkshopSessionState {
  return { sessionId: createSessionId(), selectionsByPhase: createEmptySelections(config), collectiveId: null, sentPhaseIds: [] };
}

export function parsePersistedState(value: string, config: WorkshopConfig): StorageResult<WorkshopSessionState> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") throw new Error("shape");
    const candidate = parsed as { schemaVersion?: unknown; sessionId?: unknown; selectionsByPhase?: SelectionsByPhase; collectiveId?: unknown; sentPhaseIds?: unknown };
    if ((candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2 && candidate.schemaVersion !== 3 && candidate.schemaVersion !== 4) || !candidate.selectionsByPhase || typeof candidate.selectionsByPhase !== "object") throw new Error("version");
    const entries = config.phases.map((phase) => {
      const ids = candidate.selectionsByPhase?.[phase.id];
      if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) throw new Error("phase");
      return [phase.id, ids] as const;
    });
    const collectiveId = (candidate.schemaVersion === 2 || candidate.schemaVersion === 3 || candidate.schemaVersion === 4) && typeof candidate.collectiveId === "string" && config.collectives.some((item) => item.id === candidate.collectiveId)
      ? candidate.collectiveId
      : null;
    if ((candidate.schemaVersion === 3 || candidate.schemaVersion === 4) && !isValidSessionId(candidate.sessionId)) throw new Error("session");
    const sessionId = candidate.schemaVersion === 3 || candidate.schemaVersion === 4 ? candidate.sessionId as string : createSessionId();
    const sentPhaseIds = candidate.schemaVersion === 4 && Array.isArray(candidate.sentPhaseIds) && candidate.sentPhaseIds.every((id) => typeof id === "string" && config.phases.some((phase) => phase.id === id))
      ? [...new Set(candidate.sentPhaseIds)]
      : [];
    return { ok: true, value: { sessionId, selectionsByPhase: Object.fromEntries(entries), collectiveId, sentPhaseIds } };
  } catch {
    return { ok: false, value: emptySession(config), message: "No se pudieron recuperar las selecciones guardadas. Se ha iniciado un estado vacío." };
  }
}

export function createStorageAdapter(storage: Storage, key: string): WorkshopStorageAdapter {
  return {
    read(config) {
      try {
        const raw = storage.getItem(key);
        return raw === null ? { ok: true, value: emptySession(config) } : parsePersistedState(raw, config);
      } catch {
        return { ok: false, value: emptySession(config), message: "El almacenamiento del navegador no está disponible. Puedes continuar en esta pestaña." };
      }
    },
    write(state) {
      try {
        storage.setItem(key, JSON.stringify({ schemaVersion: 4, ...state } satisfies PersistedWorkshopStateV4));
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
