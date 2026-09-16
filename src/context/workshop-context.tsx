"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { workshopConfig, storageKeys } from "@/config/workshop";
import { createEmptySelections, toggleCard } from "@/domain/selections";
import type { CardId, PhaseId, SelectionsByPhase, WorkshopScope } from "@/domain/types";
import { createStorageAdapter } from "@/persistence/storage";

interface WorkshopState {
  hydrated: boolean;
  selectionsByPhase: SelectionsByPhase;
  storageNotice: string | null;
}

type Action =
  | { type: "hydrate"; selections: SelectionsByPhase; notice: string | null }
  | { type: "toggle"; phaseId: PhaseId; cardId: CardId }
  | { type: "reset"; notice: string | null }
  | { type: "storage-error"; notice: string }
  | { type: "dismiss-notice" };

function reducer(state: WorkshopState, action: Action): WorkshopState {
  switch (action.type) {
    case "hydrate":
      return { hydrated: true, selectionsByPhase: action.selections, storageNotice: action.notice };
    case "toggle":
      return { ...state, selectionsByPhase: toggleCard(workshopConfig, state.selectionsByPhase, action.phaseId, action.cardId) };
    case "reset":
      return { ...state, selectionsByPhase: createEmptySelections(workshopConfig), storageNotice: action.notice };
    case "storage-error":
      return { ...state, storageNotice: action.notice };
    case "dismiss-notice":
      return { ...state, storageNotice: null };
  }
}

interface WorkshopContextValue extends WorkshopState {
  scope: WorkshopScope;
  toggle: (phaseId: PhaseId, cardId: CardId) => void;
  reset: () => void;
  dismissNotice: () => void;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

export function WorkshopProvider({ scope, children }: { scope: WorkshopScope; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    hydrated: false,
    selectionsByPhase: createEmptySelections(workshopConfig),
    storageNotice: null,
  });
  const skipNextWrite = useRef(false);

  useEffect(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).read(workshopConfig);
    dispatch({ type: "hydrate", selections: result.value, notice: result.ok ? null : result.message });
  }, [scope]);

  useEffect(() => {
    if (!state.hydrated) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).write(state.selectionsByPhase);
    if (!result.ok) dispatch({ type: "storage-error", notice: result.message });
  }, [scope, state.hydrated, state.selectionsByPhase]);

  const reset = useCallback(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys[scope]).remove();
    skipNextWrite.current = true;
    dispatch({ type: "reset", notice: result.ok ? null : result.message });
  }, [scope]);

  const value = useMemo<WorkshopContextValue>(
    () => ({
      ...state,
      scope,
      toggle: (phaseId, cardId) => dispatch({ type: "toggle", phaseId, cardId }),
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
