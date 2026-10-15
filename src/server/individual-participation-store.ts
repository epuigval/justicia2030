export interface ActiveCollectiveRecord {
  id: string;
  name: string;
}

export interface ActiveSubprofileRecord {
  id: string;
  collectiveId: string;
  name: string;
}

export interface ParticipationRecord {
  id: string;
  mode: string;
  status: "started" | "completed";
  collectiveId: string;
  subprofileId: string | null;
  catalogVersion: string;
  interpretationVersion: string;
  writeTokenHash: string;
  finalPayloadHash: string | null;
  resultCode: string | null;
  completedAt: string | null;
}

export interface StartedParticipationRecord {
  id: string;
  collectiveId: string;
  subprofileId: string | null;
  collectiveNameSnapshot: string;
  subprofileNameSnapshot: string | null;
  catalogVersion: "catalog-v1";
  interpretationVersion: "interpretation-v1";
  writeTokenHash: string;
}

export interface ActiveCardRecord {
  id: string;
  phaseId: string;
  categoryId: string;
  title: string;
  sortOrder: number;
}

export type AtomicCompletionOutcome =
  | "completed"
  | "already_completed"
  | "not_found"
  | "token_mismatch"
  | "payload_conflict"
  | "state_conflict"
  | "invalid_selection"
  | "catalog_not_found";

export interface AtomicCompletionResult {
  outcome: AtomicCompletionOutcome;
  status: "started" | "completed" | null;
  resultCode: string | null;
  completedAt: string | null;
}

export interface AtomicCompletionInput {
  participationId: string;
  writeTokenHash: string;
  cardIds: string[];
  resultCode: string;
  finalPayloadHash: string;
}

export interface IndividualParticipationStore {
  findActiveCollective(id: string): Promise<ActiveCollectiveRecord | null>;
  findActiveSubprofile(id: string, collectiveId: string): Promise<ActiveSubprofileRecord | null>;
  insertStartedParticipation(record: StartedParticipationRecord): Promise<void>;
  findParticipation(id: string): Promise<ParticipationRecord | null>;
  findActiveCards(ids: readonly string[]): Promise<ActiveCardRecord[]>;
  completeParticipation(input: AtomicCompletionInput): Promise<AtomicCompletionResult>;
}

export class DuplicateParticipationError extends Error {
  constructor() {
    super("duplicate_participation");
    this.name = "DuplicateParticipationError";
  }
}

export class CatalogChangedError extends Error {
  constructor() {
    super("catalog_changed");
    this.name = "CatalogChangedError";
  }
}
