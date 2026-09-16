export type PhaseId = "justicia-actual" | "justicia-conectada" | "justicia-inteligente";

export type Card = {
  id: string;
  title: string;
  challenge: string;
  solution: string;
  benefits: string[];
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
  debateQuestion: string;
  finalPrompt: string;
  finalRecommendedLength: {
    min: number;
    max: number;
  };
  maxSelectionsPerPhase: number;
  phases: Phase[];
};

export type GroupProgress = {
  selectionsByPhase: Record<PhaseId, string[]>;
  finalReflection: string;
};
