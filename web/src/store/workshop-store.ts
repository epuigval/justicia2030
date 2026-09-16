import { create } from "zustand";

import { content } from "@/data/content";
import { GroupProgress, PhaseId } from "@/types/workshop";

type WorkshopState = {
  groups: Record<string, GroupProgress>;
  facilitatorSelections: Record<PhaseId, string[]>;
  getGroup: (groupId: string) => GroupProgress;
  toggleGroupCard: (groupId: string, phaseId: PhaseId, cardId: string) => void;
  setFinalReflection: (groupId: string, value: string) => void;
  resetGroup: (groupId: string) => void;
  toggleFacilitatorCard: (phaseId: PhaseId, cardId: string) => void;
};

const createEmptyProgress = (): GroupProgress => ({
  selectionsByPhase: {
    "justicia-actual": [],
    "justicia-conectada": [],
    "justicia-inteligente": [],
  },
  finalReflection: "",
});

export const EMPTY_GROUP_PROGRESS: GroupProgress = createEmptyProgress();

const MAX_SELECTIONS = content.maxSelectionsPerPhase;

export const useWorkshopStore = create<WorkshopState>((set, get) => ({
  groups: {},
  facilitatorSelections: {
    "justicia-actual": [],
    "justicia-conectada": [],
    "justicia-inteligente": [],
  },
  getGroup: (groupId) => {
    return get().groups[groupId] ?? createEmptyProgress();
  },
  toggleGroupCard: (groupId, phaseId, cardId) => {
    set((state) => {
      const group = state.groups[groupId] ?? createEmptyProgress();
      const current = group.selectionsByPhase[phaseId];
      const exists = current.includes(cardId);

      if (exists) {
        return {
          groups: {
            ...state.groups,
            [groupId]: {
              ...group,
              selectionsByPhase: {
                ...group.selectionsByPhase,
                [phaseId]: current.filter((id) => id !== cardId),
              },
            },
          },
        };
      }

      if (current.length >= MAX_SELECTIONS) {
        return state;
      }

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            selectionsByPhase: {
              ...group.selectionsByPhase,
              [phaseId]: [...current, cardId],
            },
          },
        },
      };
    });
  },
  setFinalReflection: (groupId, value) => {
    set((state) => {
      const group = state.groups[groupId] ?? createEmptyProgress();

      return {
        groups: {
          ...state.groups,
          [groupId]: {
            ...group,
            finalReflection: value,
          },
        },
      };
    });
  },
  resetGroup: (groupId) => {
    set((state) => ({
      groups: {
        ...state.groups,
        [groupId]: createEmptyProgress(),
      },
    }));
  },
  toggleFacilitatorCard: (phaseId, cardId) => {
    set((state) => {
      const current = state.facilitatorSelections[phaseId];
      const exists = current.includes(cardId);

      if (exists) {
        return {
          facilitatorSelections: {
            ...state.facilitatorSelections,
            [phaseId]: current.filter((id) => id !== cardId),
          },
        };
      }

      if (current.length >= MAX_SELECTIONS) {
        return state;
      }

      return {
        facilitatorSelections: {
          ...state.facilitatorSelections,
          [phaseId]: [...current, cardId],
        },
      };
    });
  },
}));
