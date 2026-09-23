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

export interface WorkshopCollectiveAssets {
  iconSrc?: string;
  illustrationSrc?: string;
}

export interface WorkshopCollective {
  id: string;
  name: string;
  description: string;
  prioritizationCriteria: string[];
  assets?: WorkshopCollectiveAssets;
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
  collectives: WorkshopCollective[];
  phases: WorkshopPhase[];
  categories: WorkshopCategory[];
  cards: WorkshopCard[];
}

export type SelectionsByPhase = Record<PhaseId, CardId[]>;

export interface WorkshopSessionState {
  sessionId: string;
  selectionsByPhase: SelectionsByPhase;
  collectiveId: string | null;
}

export interface PersistedWorkshopStateV1 {
  schemaVersion: 1;
  selectionsByPhase: SelectionsByPhase;
}

export interface PersistedWorkshopStateV2 {
  schemaVersion: 2;
  selectionsByPhase: SelectionsByPhase;
  collectiveId: string | null;
}

export interface PersistedWorkshopStateV3 {
  schemaVersion: 3;
  sessionId: string;
  selectionsByPhase: SelectionsByPhase;
  collectiveId: string | null;
}

export type WorkshopScope = "team" | "facilitator";
