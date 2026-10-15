import { INDIVIDUAL_PHASE_IDS, type IndividualPhaseId, type InterpretationResultCode } from "./individual-participation";
import type { SelectionsByPhase } from "./types";

export interface IndividualCollectiveOption {
  id: string;
  name: string;
}

export interface IndividualSubprofileOption {
  id: string;
  collectiveId: string;
  name: string;
}

export interface IndividualCatalog {
  collectives: IndividualCollectiveOption[];
  subprofiles: IndividualSubprofileOption[];
}

export interface IndividualSessionState {
  participationId: string | null;
  writeToken: string | null;
  collectiveId: string | null;
  subprofileId: string | null;
  selectionsByPhase: SelectionsByPhase;
  currentPhaseId: IndividualPhaseId;
  completed: boolean;
  resultCode: InterpretationResultCode | null;
  completedAt: string | null;
}

export interface PersistedIndividualStateV1 extends Omit<IndividualSessionState, "participationId" | "writeToken" | "collectiveId"> {
  schemaVersion: 1;
  participationId: string;
  writeToken: string | null;
  collectiveId: string;
}

export function orderedIndividualCardIds(selections: SelectionsByPhase): string[] {
  return INDIVIDUAL_PHASE_IDS.flatMap((phaseId) => selections[phaseId] ?? []);
}

export function firstIncompleteIndividualPhase(selections: SelectionsByPhase): IndividualPhaseId | null {
  return INDIVIDUAL_PHASE_IDS.find((phaseId) => (selections[phaseId] ?? []).length !== 3) ?? null;
}

export function hasCompleteIndividualSelections(selections: SelectionsByPhase): boolean {
  return INDIVIDUAL_PHASE_IDS.every((phaseId) => (selections[phaseId] ?? []).length === 3)
    && new Set(orderedIndividualCardIds(selections)).size === 9;
}

export function individualResumeHref(state: IndividualSessionState): string {
  return state.completed ? "/individual/result" : "/individual/overview";
}
