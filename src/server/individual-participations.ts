import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import {
  calculateInterpretationV1,
  canonicalizeIndividualCardIds,
  hasExpectedIndividualPhaseDistribution,
  type CompleteIndividualParticipationInput,
  type StartIndividualParticipationInput,
} from "@/domain/individual-participation";
import {
  CatalogChangedError,
  DuplicateParticipationError,
  type IndividualParticipationStore,
  type ParticipationRecord,
} from "./individual-participation-store";

export type StartIndividualParticipationResult =
  | { kind: "created" | "existing"; participationId: string; status: "started" | "completed" }
  | { kind: "catalog_not_found" }
  | { kind: "conflict" };

export type CompleteIndividualParticipationResult =
  | {
    kind: "completed";
    participationId: string;
    resultCode: string;
    completedAt: string;
    idempotent: boolean;
  }
  | {
    kind: "invalid_selection";
  }
  | { kind: "not_found" }
  | { kind: "token_mismatch" }
  | { kind: "payload_conflict" }
  | { kind: "state_conflict" }
  | { kind: "catalog_not_found" };

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

export function hashWriteToken(writeToken: string): string {
  return createHash("sha256").update(writeToken, "utf8").digest("hex");
}

export function hashFinalPayload(participationId: string, cardIds: readonly string[]): string {
  return createHash("sha256")
    .update(JSON.stringify([participationId, "interpretation-v1", canonicalizeIndividualCardIds(cardIds)]), "utf8")
    .digest("hex");
}

function hashesEqual(left: string | null, right: string): boolean {
  if (!left || !SHA256_PATTERN.test(left) || !SHA256_PATTERN.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function isCompatibleStartRetry(
  existing: ParticipationRecord,
  input: StartIndividualParticipationInput,
  writeTokenHash: string,
): boolean {
  return existing.mode === "individual"
    && (existing.status === "started" || existing.status === "completed")
    && existing.collectiveId === input.collectiveId
    && existing.subprofileId === input.subprofileId
    && existing.catalogVersion === "catalog-v1"
    && existing.interpretationVersion === "interpretation-v1"
    && hashesEqual(existing.writeTokenHash, writeTokenHash);
}

export async function startIndividualParticipation(
  store: IndividualParticipationStore,
  input: StartIndividualParticipationInput,
): Promise<StartIndividualParticipationResult> {
  const writeTokenHash = hashWriteToken(input.writeToken);
  const existing = await store.findParticipation(input.participationId);
  if (existing) {
    if (!isCompatibleStartRetry(existing, input, writeTokenHash)) return { kind: "conflict" };
    return { kind: "existing", participationId: existing.id, status: existing.status };
  }

  const collective = await store.findActiveCollective(input.collectiveId);
  if (!collective) return { kind: "catalog_not_found" };

  const subprofile = input.subprofileId
    ? await store.findActiveSubprofile(input.subprofileId, input.collectiveId)
    : null;
  if (input.subprofileId && !subprofile) return { kind: "catalog_not_found" };

  try {
    await store.insertStartedParticipation({
      id: input.participationId,
      collectiveId: collective.id,
      subprofileId: subprofile?.id ?? null,
      collectiveNameSnapshot: collective.name,
      subprofileNameSnapshot: subprofile?.name ?? null,
      catalogVersion: "catalog-v1",
      interpretationVersion: "interpretation-v1",
      writeTokenHash,
    });
    return { kind: "created", participationId: input.participationId, status: "started" };
  } catch (error) {
    if (error instanceof CatalogChangedError) return { kind: "catalog_not_found" };
    if (!(error instanceof DuplicateParticipationError)) throw error;
  }

  const racedParticipation = await store.findParticipation(input.participationId);
  if (!racedParticipation || !isCompatibleStartRetry(racedParticipation, input, writeTokenHash)) {
    return { kind: "conflict" };
  }

  return {
    kind: "existing",
    participationId: racedParticipation.id,
    status: racedParticipation.status,
  };
}

function completedResultFromRecord(
  participationId: string,
  record: ParticipationRecord,
): CompleteIndividualParticipationResult {
  if (!record.resultCode || !record.completedAt) return { kind: "state_conflict" };
  return {
    kind: "completed",
    participationId,
    resultCode: record.resultCode,
    completedAt: record.completedAt,
    idempotent: true,
  };
}

export async function completeIndividualParticipation(
  store: IndividualParticipationStore,
  input: CompleteIndividualParticipationInput,
): Promise<CompleteIndividualParticipationResult> {
  if (input.selectedCardIds.length !== 9 || new Set(input.selectedCardIds).size !== 9) {
    return { kind: "invalid_selection" };
  }

  const writeTokenHash = hashWriteToken(input.writeToken);
  const finalPayloadHash = hashFinalPayload(input.participationId, input.selectedCardIds);
  const participation = await store.findParticipation(input.participationId);

  if (!participation) return { kind: "not_found" };
  if (!hashesEqual(participation.writeTokenHash, writeTokenHash)) return { kind: "token_mismatch" };

  if (participation.status === "completed") {
    if (!hashesEqual(participation.finalPayloadHash, finalPayloadHash)) return { kind: "payload_conflict" };
    return completedResultFromRecord(input.participationId, participation);
  }

  if (participation.status !== "started") return { kind: "state_conflict" };

  const cards = await store.findActiveCards(input.selectedCardIds);
  const returnedIds = new Set(cards.map((card) => card.id));
  if (cards.length !== 9 || input.selectedCardIds.some((cardId) => !returnedIds.has(cardId))) {
    return { kind: "catalog_not_found" };
  }
  if (!hasExpectedIndividualPhaseDistribution(cards)) return { kind: "invalid_selection" };

  const resultCode = calculateInterpretationV1(cards.map((card) => card.categoryId));
  if (!resultCode) return { kind: "invalid_selection" };

  const completion = await store.completeParticipation({
    participationId: input.participationId,
    writeTokenHash,
    cardIds: canonicalizeIndividualCardIds(input.selectedCardIds),
    resultCode,
    finalPayloadHash,
  });

  if (completion.outcome === "completed" || completion.outcome === "already_completed") {
    if (completion.status !== "completed" || !completion.resultCode || !completion.completedAt) {
      return { kind: "state_conflict" };
    }
    return {
      kind: "completed",
      participationId: input.participationId,
      resultCode: completion.resultCode,
      completedAt: completion.completedAt,
      idempotent: completion.outcome === "already_completed",
    };
  }

  return { kind: completion.outcome };
}
