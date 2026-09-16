export type PhaseId = string;
export type CategoryId = string;

export type Category = {
  id: CategoryId;
  label: string;
  order: number;
};

export type Card = {
  id: string;
  categoryId: CategoryId;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  benefits: string[];
  debateQuestion: string;
  visual?: string;
  active: boolean;
};

export type Phase = {
  id: PhaseId;
  title: string;
  description: string;
  order: number;
  cards: Card[];
};

export type WorkshopContent = {
  appTitle: string;
  appSubtitle: string;
  finalIntroduction: string;
  promptTemplate: string;
  maxSelectionsPerPhase: number;
  categories: Category[];
  phases: Phase[];
};

export type GroupProgress = {
  selectionsByPhase: Record<PhaseId, string[]>;
};
