"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { workshopConfig } from "@/config/workshop";
import type { IndividualPhaseId } from "@/domain/individual-participation";
import type { IndividualSessionState } from "@/domain/individual-flow";
import { toggleCard } from "@/domain/selections";
import { createEmptyIndividualSession, createIndividualStorageAdapter } from "@/persistence/individual-storage";

interface IndividualContextState extends IndividualSessionState {
  hydrated: boolean;
  leaving: boolean;
  storageNotice: string | null;
}

type Action =
  | { type: "hydrate"; session: IndividualSessionState | null; notice: string | null }
  | { type: "start"; participationId: string; writeToken: string; collectiveId: string; subprofileId: string | null }
  | { type: "toggle"; phaseId: IndividualPhaseId; cardId: string }
  | { type: "set-phase"; phaseId: IndividualPhaseId }
  | { type: "complete"; resultCode: IndividualSessionState["resultCode"]; completedAt: string }
  | { type: "clear" }
  | { type: "storage-error"; notice: string }
  | { type: "dismiss-notice" };

function reducer(state: IndividualContextState, action: Action): IndividualContextState {
  switch (action.type) {
    case "hydrate":
      return { ...(action.session ?? createEmptyIndividualSession()), hydrated: true, leaving: false, storageNotice: action.notice };
    case "start":
      return {
        ...createEmptyIndividualSession(),
        hydrated: true,
        leaving: false,
        storageNotice: null,
        participationId: action.participationId,
        writeToken: action.writeToken,
        collectiveId: action.collectiveId,
        subprofileId: action.subprofileId,
      };
    case "toggle":
      if (state.completed) return state;
      return { ...state, selectionsByPhase: toggleCard(workshopConfig, state.selectionsByPhase, action.phaseId, action.cardId, 3) };
    case "set-phase":
      return state.currentPhaseId === action.phaseId ? state : { ...state, currentPhaseId: action.phaseId };
    case "complete":
      if (state.completed || !action.resultCode) return state;
      return { ...state, completed: true, completedAt: action.completedAt, resultCode: action.resultCode, writeToken: null };
    case "clear":
      return { ...createEmptyIndividualSession(), hydrated: true, leaving: true, storageNotice: null };
    case "storage-error":
      return { ...state, storageNotice: action.notice };
    case "dismiss-notice":
      return { ...state, storageNotice: null };
  }
}

export interface IndividualContextValue extends IndividualContextState {
  start: (input: { participationId: string; writeToken: string; collectiveId: string; subprofileId: string | null }) => void;
  toggle: (phaseId: IndividualPhaseId, cardId: string) => void;
  setCurrentPhase: (phaseId: IndividualPhaseId) => void;
  markCompleted: (resultCode: NonNullable<IndividualSessionState["resultCode"]>, completedAt: string) => void;
  clear: () => boolean;
  dismissNotice: () => void;
}

const IndividualContext = createContext<IndividualContextValue | null>(null);

function createInitialState(): IndividualContextState {
  return { ...createEmptyIndividualSession(), hydrated: false, leaving: false, storageNotice: null };
}

export function IndividualProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const {
    collectiveId,
    completed,
    completedAt,
    currentPhaseId,
    hydrated,
    participationId,
    resultCode,
    selectionsByPhase,
    subprofileId,
    writeToken,
  } = state;

  useEffect(() => {
    const result = createIndividualStorageAdapter(window.localStorage).read();
    dispatch({ type: "hydrate", session: result.value, notice: result.ok ? null : result.message });
  }, []);

  useEffect(() => {
    if (!hydrated || !participationId) return;
    const result = createIndividualStorageAdapter(window.localStorage).write({
      participationId,
      writeToken,
      collectiveId,
      subprofileId,
      selectionsByPhase,
      currentPhaseId,
      completed,
      resultCode,
      completedAt,
    });
    if (!result.ok) dispatch({ type: "storage-error", notice: result.message });
  }, [collectiveId, completed, completedAt, currentPhaseId, hydrated, participationId, resultCode, selectionsByPhase, subprofileId, writeToken]);

  const start = useCallback((input: { participationId: string; writeToken: string; collectiveId: string; subprofileId: string | null }) => {
    dispatch({ type: "start", ...input });
  }, []);

  const toggle = useCallback((phaseId: IndividualPhaseId, cardId: string) => dispatch({ type: "toggle", phaseId, cardId }), []);
  const setCurrentPhase = useCallback((phaseId: IndividualPhaseId) => dispatch({ type: "set-phase", phaseId }), []);
  const markCompleted = useCallback((resultCode: NonNullable<IndividualSessionState["resultCode"]>, completedAt: string) => {
    dispatch({ type: "complete", resultCode, completedAt });
  }, []);
  const clear = useCallback(() => {
    const result = createIndividualStorageAdapter(window.localStorage).remove();
    if (!result.ok) {
      dispatch({ type: "storage-error", notice: result.message });
      return false;
    }
    dispatch({ type: "clear" });
    return true;
  }, []);
  const dismissNotice = useCallback(() => dispatch({ type: "dismiss-notice" }), []);

  const value = useMemo<IndividualContextValue>(() => ({
    ...state,
    start,
    toggle,
    setCurrentPhase,
    markCompleted,
    clear,
    dismissNotice,
  }), [clear, dismissNotice, markCompleted, setCurrentPhase, start, state, toggle]);

  return <IndividualContext.Provider value={value}>{children}</IndividualContext.Provider>;
}

export function useIndividualParticipation(): IndividualContextValue {
  const context = useContext(IndividualContext);
  if (!context) throw new Error("useIndividualParticipation debe utilizarse dentro de IndividualProvider");
  return context;
}
