import { describe, expect, it, vi } from "vitest";
import {
  CatalogChangedError,
  DuplicateParticipationError,
  type ActiveCardRecord,
  type AtomicCompletionInput,
  type IndividualParticipationStore,
  type ParticipationRecord,
  type StartedParticipationRecord,
} from "@/server/individual-participation-store";
import {
  completeIndividualParticipation,
  hashFinalPayload,
  hashWriteToken,
  startIndividualParticipation,
} from "@/server/individual-participations";

const PARTICIPATION_ID = "123e4567-e89b-42d3-a456-426614174000";
const WRITE_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEF";
const OTHER_TOKEN = "0123456789abcdefghijklmnopqrstuv";

const phases = ["justicia-actual", "justicia-conectada", "justicia-inteligente"];
const categories = ["personas", "procesos", "tecnologia", "gobernanza"];
const cards: ActiveCardRecord[] = phases.flatMap((phaseId, phaseIndex) => categories.map((categoryId, categoryIndex) => ({
  id: `card-${phaseIndex}-${categoryIndex}`,
  phaseId,
  categoryId,
  title: `Card ${phaseIndex}-${categoryIndex}`,
  sortOrder: phaseIndex * 4 + categoryIndex + 1,
})));

const validCardIds = phases.flatMap((_, phaseIndex) => [0, 1, 2].map((categoryIndex) => `card-${phaseIndex}-${categoryIndex}`));
const alternateCardIds = [...validCardIds.slice(0, 8), "card-2-3"];

class FakeStore implements IndividualParticipationStore {
  participations = new Map<string, ParticipationRecord>();
  startedRecords: StartedParticipationRecord[] = [];
  completionCalls: AtomicCompletionInput[] = [];
  failInsertWithCatalogChange = false;

  async findActiveCollective(id: string) {
    return id === "collective-a" ? { id, name: "Collective A" } : null;
  }

  async findActiveSubprofile(id: string, collectiveId: string) {
    if (id === "subprofile-a" && collectiveId === "collective-a") {
      return { id, collectiveId, name: "Subprofile A" };
    }
    return null;
  }

  async insertStartedParticipation(record: StartedParticipationRecord) {
    if (this.failInsertWithCatalogChange) throw new CatalogChangedError();
    if (this.participations.has(record.id)) throw new DuplicateParticipationError();
    this.startedRecords.push(record);
    this.participations.set(record.id, {
      id: record.id,
      mode: "individual",
      status: "started",
      collectiveId: record.collectiveId,
      subprofileId: record.subprofileId,
      catalogVersion: record.catalogVersion,
      interpretationVersion: record.interpretationVersion,
      writeTokenHash: record.writeTokenHash,
      finalPayloadHash: null,
      resultCode: null,
      completedAt: null,
    });
  }

  async findParticipation(id: string) {
    return this.participations.get(id) ?? null;
  }

  async findActiveCards(ids: readonly string[]) {
    const wanted = new Set(ids);
    return cards.filter((card) => wanted.has(card.id));
  }

  async completeParticipation(input: AtomicCompletionInput) {
    this.completionCalls.push(input);
    const participation = this.participations.get(input.participationId);
    if (!participation) {
      return { outcome: "not_found" as const, status: null, resultCode: null, completedAt: null };
    }
    if (participation.writeTokenHash !== input.writeTokenHash) {
      return { outcome: "token_mismatch" as const, status: participation.status, resultCode: participation.resultCode, completedAt: participation.completedAt };
    }
    if (participation.status === "completed") {
      return {
        outcome: participation.finalPayloadHash === input.finalPayloadHash ? "already_completed" as const : "payload_conflict" as const,
        status: participation.status,
        resultCode: participation.resultCode,
        completedAt: participation.completedAt,
      };
    }

    const completedAt = "2026-10-14T10:00:00.000Z";
    const completed: ParticipationRecord = {
      ...participation,
      status: "completed",
      resultCode: input.resultCode,
      finalPayloadHash: input.finalPayloadHash,
      completedAt,
    };
    this.participations.set(input.participationId, completed);
    return { outcome: "completed" as const, status: "completed" as const, resultCode: input.resultCode, completedAt };
  }
}

function startInput(subprofileId: string | null = null) {
  return {
    participationId: PARTICIPATION_ID,
    writeToken: WRITE_TOKEN,
    collectiveId: "collective-a",
    subprofileId,
  };
}

async function startedStore() {
  const store = new FakeStore();
  await startIndividualParticipation(store, startInput());
  return store;
}

describe("startIndividualParticipation", () => {
  it("starts without a subprofile and stores only the token hash", async () => {
    const store = new FakeStore();
    await expect(startIndividualParticipation(store, startInput())).resolves.toEqual({
      kind: "created",
      participationId: PARTICIPATION_ID,
      status: "started",
    });
    const persisted = store.participations.get(PARTICIPATION_ID);
    expect(persisted?.subprofileId).toBeNull();
    expect(persisted?.writeTokenHash).toBe(hashWriteToken(WRITE_TOKEN));
    expect(JSON.stringify(persisted)).not.toContain(WRITE_TOKEN);
    expect(store.startedRecords[0]).toMatchObject({
      collectiveNameSnapshot: "Collective A",
      subprofileNameSnapshot: null,
      catalogVersion: "catalog-v1",
      interpretationVersion: "interpretation-v1",
    });
  });

  it("starts with a subprofile from the selected collective", async () => {
    const store = new FakeStore();
    await expect(startIndividualParticipation(store, startInput("subprofile-a"))).resolves.toMatchObject({ kind: "created" });
    expect(store.participations.get(PARTICIPATION_ID)?.subprofileId).toBe("subprofile-a");
  });

  it("rejects a subprofile from another collective", async () => {
    const store = new FakeStore();
    await expect(startIndividualParticipation(store, startInput("subprofile-b"))).resolves.toEqual({ kind: "catalog_not_found" });
    expect(store.participations).toHaveLength(0);
  });

  it("returns the existing participation for a compatible retry", async () => {
    const store = new FakeStore();
    await startIndividualParticipation(store, startInput());
    await expect(startIndividualParticipation(store, startInput())).resolves.toEqual({
      kind: "existing",
      participationId: PARTICIPATION_ID,
      status: "started",
    });
    expect(store.participations).toHaveLength(1);
  });

  it("rejects incompatible reuse of a participation ID", async () => {
    const store = new FakeStore();
    await startIndividualParticipation(store, startInput());
    await expect(startIndividualParticipation(store, {
      ...startInput(),
      writeToken: OTHER_TOKEN,
    })).resolves.toEqual({ kind: "conflict" });
  });
});

describe("completeIndividualParticipation", () => {
  it("rejects an incorrect write token", async () => {
    const store = await startedStore();
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: OTHER_TOKEN,
      selectedCardIds: validCardIds,
    })).resolves.toEqual({ kind: "token_mismatch" });
    expect(store.completionCalls).toHaveLength(0);
  });

  it("completes a valid 3+3+3 selection without calling email", async () => {
    const store = await startedStore();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: validCardIds,
    })).resolves.toMatchObject({
      kind: "completed",
      resultCode: "vision-integral",
      idempotent: false,
    });
    expect(store.completionCalls).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("rejects eight selections and duplicates", async () => {
    const store = await startedStore();
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: validCardIds.slice(0, 8),
    })).resolves.toEqual({ kind: "invalid_selection" });
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: [...validCardIds.slice(0, 8), validCardIds[0]],
    })).resolves.toEqual({ kind: "invalid_selection" });
  });

  it("rejects a distribution other than three cards per phase", async () => {
    const store = await startedStore();
    const invalidDistribution = [
      "card-0-0", "card-0-1", "card-0-2", "card-0-3",
      "card-1-0", "card-1-1", "card-1-2",
      "card-2-0", "card-2-1",
    ];
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: invalidDistribution,
    })).resolves.toEqual({ kind: "invalid_selection" });
  });

  it("rejects a missing card", async () => {
    const store = await startedStore();
    await expect(completeIndividualParticipation(store, {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: [...validCardIds.slice(0, 8), "missing-card"],
    })).resolves.toEqual({ kind: "catalog_not_found" });
  });

  it("returns the prior success for the same payload and conflicts for another", async () => {
    const store = await startedStore();
    const original = {
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      selectedCardIds: validCardIds,
    };
    await completeIndividualParticipation(store, original);
    await expect(completeIndividualParticipation(store, original)).resolves.toMatchObject({ kind: "completed", idempotent: true });
    await expect(completeIndividualParticipation(store, {
      ...original,
      selectedCardIds: alternateCardIds,
    })).resolves.toEqual({ kind: "payload_conflict" });
    expect(store.participations.get(PARTICIPATION_ID)?.finalPayloadHash).toBe(hashFinalPayload(PARTICIPATION_ID, validCardIds));
  });
});
