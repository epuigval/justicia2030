"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { workshopConfig, storageKeys } from "@/config/workshop";
import { createEmptySelections, toggleCard } from "@/domain/selections";
import { createSessionId } from "@/domain/session";
import type { CardId, PhaseId, SelectionsByPhase, WorkshopScope } from "@/domain/types";
import { createStorageAdapter } from "@/persistence/storage";

interface WorkshopState {
  hydrated: boolean;
  sessionId: string;
  selectionsByPhase: SelectionsByPhase;
  collectiveId: string | null;
  storageNotice: string | null;
}

type Action =
  | { type: "hydrate"; sessionId: string; selections: SelectionsByPhase; collectiveId: string | null; notice: string | null }
  | { type: "toggle"; phaseId: PhaseId; cardId: CardId; unlimited: boolean }
  | { type: "select-collective"; collectiveId: string }
  | { type: "reset"; notice: string | null }
  | { type: "storage-error"; notice: string }
  | { type: "dismiss-notice" };

function reducer(state: WorkshopState, action: Action): WorkshopState {
  switch (action.type) {
    case "hydrate":
      return { hydrated: true, sessionId: action.sessionId, selectionsByPhase: action.selections, collectiveId: action.collectiveId, storageNotice: action.notice };
    case "toggle":
      return { ...state, selectionsByPhase: toggleCard(workshopConfig, state.selectionsByPhase, action.phaseId, action.cardId, action.unlimited ? null : workshopConfig.maxSelectionsPerPhase) };
    case "select-collective":
      return { ...state, collectiveId: action.collectiveId };
    case "reset":
      return { ...state, sessionId: createSessionId(), selectionsByPhase: createEmptySelections(workshopConfig), collectiveId: null, storageNotice: action.notice };
    case "storage-error":
      return { ...state, storageNotice: action.notice };
    case "dismiss-notice":
      return { ...state, storageNotice: null };
  }
}

interface WorkshopContextValue extends WorkshopState {
  scope: WorkshopScope;
  toggle: (phaseId: PhaseId, cardId: CardId) => void;
  selectCollective: (collectiveId: string) => void;
  reset: () => void;
  dismissNotice: () => void;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

function createInitialState(): WorkshopState {
  return {
    hydrated: false,
    sessionId: createSessionId(),
    selectionsByPhase: createEmptySelections(workshopConfig),
    collectiveId: null,
    storageNotice: null,
  };
}

export function WorkshopProvider({ scope, children }: { scope: WorkshopScope; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const hydratedScope = useRef<WorkshopScope | null>(null);

  useEffect(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).read(workshopConfig);
    hydratedScope.current = scope;
    dispatch({ type: "hydrate", sessionId: result.value.sessionId, selections: result.value.selectionsByPhase, collectiveId: result.value.collectiveId, notice: result.ok ? null : result.message });
  }, [scope]);

  useEffect(() => {
    if (!state.hydrated) return;
    if (hydratedScope.current !== scope) return;
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).write({ sessionId: state.sessionId, selectionsByPhase: state.selectionsByPhase, collectiveId: state.collectiveId });
    if (!result.ok) dispatch({ type: "storage-error", notice: result.message });
  }, [scope, state.collectiveId, state.hydrated, state.selectionsByPhase, state.sessionId]);

  const reset = useCallback(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).remove();
    dispatch({ type: "reset", notice: result.ok ? null : result.message });
  }, [scope]);

  const value = useMemo<WorkshopContextValue>(
    () => ({
      ...state,
      scope,
      toggle: (phaseId, cardId) => dispatch({ type: "toggle", phaseId, cardId, unlimited: scope === "facilitator" }),
      selectCollective: (collectiveId) => dispatch({ type: "select-collective", collectiveId }),
      reset,
      dismissNotice: () => dispatch({ type: "dismiss-notice" }),
    }),
    [reset, scope, state],
  );

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
}

export function useWorkshop() {
  const value = useContext(WorkshopContext);
  if (!value) throw new Error("useWorkshop debe utilizarse dentro de WorkshopProvider");
  return value;
}
