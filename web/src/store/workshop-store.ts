import { create } from "zustand";
import { persist } from "zustand/middleware";

import { content } from "@/data/content";
import { GroupProgress, PhaseId } from "@/types/workshop";

type WorkshopState = {
  groups: Record<string, GroupProgress>;
  facilitatorSelections: Record<PhaseId, string[]>;
  getGroup: (groupId: string) => GroupProgress;
  toggleGroupCard: (groupId: string, phaseId: PhaseId, cardId: string) => void;
  resetGroup: (groupId: string) => void;
  toggleFacilitatorCard: (phaseId: PhaseId, cardId: string) => void;
  resetFacilitator: () => void;
};

const createEmptySelections = (): Record<PhaseId, string[]> =>
  Object.fromEntries(content.phases.map((phase) => [phase.id, []]));

const createEmptyProgress = (): GroupProgress => ({
  selectionsByPhase: createEmptySelections(),
});

export const EMPTY_GROUP_PROGRESS: GroupProgress = createEmptyProgress();

const MAX_SELECTIONS = content.maxSelectionsPerPhase;

export const useWorkshopStore = create<WorkshopState>()(persist((set, get) => ({
  groups: {},
  facilitatorSelections: createEmptySelections(),
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
  resetFacilitator: () => {
    set({
      facilitatorSelections: createEmptySelections(),
    });
  },
}), {
  name: "justicia-2030-session",
  version: 2,
  partialize: (state) => ({
    groups: state.groups,
    facilitatorSelections: state.facilitatorSelections,
  }),
}));
