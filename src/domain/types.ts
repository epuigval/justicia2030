export type PhaseId = string;
export type CategoryId = string;
export type CardId = string;

export interface WorkshopPhase {
  id: PhaseId;
  name: string;
  shortName: string;
  description: string;
  order: number;
  accent: "orange" | "green" | "blue" | "violet";
}

export interface WorkshopCategory {
  id: CategoryId;
  name: string;
  order: number;
}

export interface WorkshopCard {
  id: CardId;
  phaseId: PhaseId;
  categoryId: CategoryId;
  title: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  benefits: string[];
  debateQuestion: string;
  order: number;
}

export interface WorkshopConfig {
  title: string;
  intro: string;
  maxSelectionsPerPhase: number;
  phases: WorkshopPhase[];
  categories: WorkshopCategory[];
  cards: WorkshopCard[];
}

export type SelectionsByPhase = Record<PhaseId, CardId[]>;

export interface PersistedWorkshopStateV1 {
  schemaVersion: 1;
  selectionsByPhase: SelectionsByPhase;
}

export type WorkshopScope = "team" | "facilitator";
