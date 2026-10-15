import { isInterpretationResultCode } from "@/config/individual-results";
import { workshopConfig } from "@/config/workshop";
import { INDIVIDUAL_PHASE_IDS, isCatalogId, isWriteToken, type IndividualPhaseId } from "@/domain/individual-participation";
import { hasCompleteIndividualSelections, type IndividualSessionState, type PersistedIndividualStateV1 } from "@/domain/individual-flow";
import { createEmptySelections } from "@/domain/selections";
import { isValidSessionId } from "@/domain/session";
import type { SelectionsByPhase } from "@/domain/types";
import type { StorageResult } from "./storage";

export const INDIVIDUAL_STORAGE_KEY = "justicia2030:v1:individual";

export interface IndividualStorageAdapter {
  read(): StorageResult<IndividualSessionState | null>;
  write(state: IndividualSessionState): StorageResult<null>;
  remove(): StorageResult<null>;
}

function parseSelections(value: unknown): SelectionsByPhase | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const entries: Array<[IndividualPhaseId, string[]]> = [];

  for (const phaseId of INDIVIDUAL_PHASE_IDS) {
    const ids = candidate[phaseId];
    if (!Array.isArray(ids) || ids.length > 3 || ids.some((id) => typeof id !== "string")) return null;
    const uniqueIds = [...new Set(ids as string[])];
    if (uniqueIds.length !== ids.length) return null;
    if (uniqueIds.some((id) => !workshopConfig.cards.some((card) => card.id === id && card.phaseId === phaseId))) return null;
    entries.push([phaseId, uniqueIds]);
  }

  return Object.fromEntries(entries);
}

function isValidCompletedAt(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && Number.isFinite(Date.parse(value));
}

export function parsePersistedIndividualState(value: string): StorageResult<IndividualSessionState | null> {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    const candidate = parsed as Record<string, unknown>;
    if (candidate.schemaVersion !== 1) throw new Error("version");
    if (!isValidSessionId(candidate.participationId) || !isWriteToken(candidate.writeToken) || !isCatalogId(candidate.collectiveId)) throw new Error("identity");
    if (candidate.subprofileId !== null && !isCatalogId(candidate.subprofileId)) throw new Error("subprofile");
    if (!INDIVIDUAL_PHASE_IDS.includes(candidate.currentPhaseId as IndividualPhaseId)) throw new Error("phase");

    const selectionsByPhase = parseSelections(candidate.selectionsByPhase);
    if (!selectionsByPhase || typeof candidate.completed !== "boolean") throw new Error("selections");

    if (candidate.completed) {
      if (!hasCompleteIndividualSelections(selectionsByPhase) || !isInterpretationResultCode(candidate.resultCode) || !isValidCompletedAt(candidate.completedAt)) throw new Error("completion");
    } else if (candidate.resultCode !== null || candidate.completedAt !== null) {
      throw new Error("started");
    }

    return {
      ok: true,
      value: {
        participationId: candidate.participationId,
        writeToken: candidate.writeToken,
        collectiveId: candidate.collectiveId,
        subprofileId: candidate.subprofileId,
        selectionsByPhase,
        currentPhaseId: candidate.currentPhaseId as IndividualPhaseId,
        completed: candidate.completed,
        resultCode: candidate.completed && isInterpretationResultCode(candidate.resultCode) ? candidate.resultCode : null,
        completedAt: candidate.completed && isValidCompletedAt(candidate.completedAt) ? candidate.completedAt : null,
      },
    };
  } catch {
    return { ok: false, value: null, message: "No se pudo recuperar la participación individual guardada. Vuelve a iniciarla." };
  }
}

export function createIndividualStorageAdapter(storage: Storage): IndividualStorageAdapter {
  return {
    read() {
      try {
        const raw = storage.getItem(INDIVIDUAL_STORAGE_KEY);
        return raw === null ? { ok: true, value: null } : parsePersistedIndividualState(raw);
      } catch {
        return { ok: false, value: null, message: "El almacenamiento del navegador no está disponible. No se puede recuperar la participación." };
      }
    },
    write(state) {
      if (!state.participationId || !state.writeToken || !state.collectiveId) {
        return { ok: false, value: null, message: "No se pudo guardar una participación incompleta." };
      }
      try {
        const persisted: PersistedIndividualStateV1 = {
          schemaVersion: 1,
          participationId: state.participationId,
          writeToken: state.writeToken,
          collectiveId: state.collectiveId,
          subprofileId: state.subprofileId,
          selectionsByPhase: state.selectionsByPhase,
          currentPhaseId: state.currentPhaseId,
          completed: state.completed,
          resultCode: state.resultCode,
          completedAt: state.completedAt,
        };
        storage.setItem(INDIVIDUAL_STORAGE_KEY, JSON.stringify(persisted));
        return { ok: true, value: null };
      } catch {
        return { ok: false, value: null, message: "No se pudieron guardar los cambios. Inténtalo de nuevo antes de continuar." };
      }
    },
    remove() {
      try {
        storage.removeItem(INDIVIDUAL_STORAGE_KEY);
        return { ok: true, value: null };
      } catch {
        return { ok: false, value: null, message: "No se pudo borrar la participación individual guardada." };
      }
    },
  };
}

export function createEmptyIndividualSession(): IndividualSessionState {
  return {
    participationId: null,
    writeToken: null,
    collectiveId: null,
    subprofileId: null,
    selectionsByPhase: createEmptySelections(workshopConfig),
    currentPhaseId: INDIVIDUAL_PHASE_IDS[0],
    completed: false,
    resultCode: null,
    completedAt: null,
  };
}
