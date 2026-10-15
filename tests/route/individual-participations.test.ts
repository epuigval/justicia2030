import { beforeEach, describe, expect, it, vi } from "vitest";

const { startMock, completeMock } = vi.hoisted(() => ({
  startMock: vi.fn(),
  completeMock: vi.fn(),
}));

vi.mock("@/server/individual-participations", () => ({
  startIndividualParticipation: startMock,
  completeIndividualParticipation: completeMock,
}));

vi.mock("@/server/supabase-individual-participation-store", () => ({
  SupabaseIndividualParticipationStore: class {},
}));

import { POST as start } from "@/app/api/individual/participations/route";
import { POST as complete } from "@/app/api/individual/participations/[id]/complete/route";

const PARTICIPATION_ID = "123e4567-e89b-42d3-a456-426614174000";
const WRITE_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEF";
const selectedCardIds = Array.from({ length: 9 }, (_, index) => `card-${index}`);

function request(path: string, payload: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("individual participation routes", () => {
  beforeEach(() => {
    startMock.mockReset();
    completeMock.mockReset();
  });

  it("returns 201 for a new start and 200 for an idempotent retry", async () => {
    const payload = { participationId: PARTICIPATION_ID, writeToken: WRITE_TOKEN, collectiveId: "collective-a" };
    startMock.mockResolvedValueOnce({ kind: "created", participationId: PARTICIPATION_ID, status: "started" });
    let response = await start(request("/api/individual/participations", payload));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ participationId: PARTICIPATION_ID, idempotent: false });

    startMock.mockResolvedValueOnce({ kind: "existing", participationId: PARTICIPATION_ID, status: "started" });
    response = await start(request("/api/individual/participations", payload));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ participationId: PARTICIPATION_ID, idempotent: true });
  });

  it("maps completion success and write-token failure", async () => {
    const payload = { writeToken: WRITE_TOKEN, selectedCardIds };
    completeMock.mockResolvedValueOnce({
      kind: "completed",
      participationId: PARTICIPATION_ID,
      resultCode: "vision-integral",
      completedAt: "2026-10-14T10:00:00.000Z",
      idempotent: false,
    });
    let response = await complete(request(`/api/individual/participations/${PARTICIPATION_ID}/complete`, payload), {
      params: Promise.resolve({ id: PARTICIPATION_ID }),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "completed", resultCode: "vision-integral" });

    completeMock.mockResolvedValueOnce({ kind: "token_mismatch" });
    response = await complete(request(`/api/individual/participations/${PARTICIPATION_ID}/complete`, payload), {
      params: Promise.resolve({ id: PARTICIPATION_ID }),
    });
    expect(response.status).toBe(403);
    expect(JSON.stringify(await response.json())).not.toContain(WRITE_TOKEN);
  });

  it("maps incompatible retries to conflict without exposing internals", async () => {
    const startPayload = { participationId: PARTICIPATION_ID, writeToken: WRITE_TOKEN, collectiveId: "collective-a" };
    startMock.mockResolvedValueOnce({ kind: "conflict" });
    let response = await start(request("/api/individual/participations", startPayload));
    expect(response.status).toBe(409);

    completeMock.mockResolvedValueOnce({ kind: "payload_conflict" });
    response = await complete(request(`/api/individual/participations/${PARTICIPATION_ID}/complete`, {
      writeToken: WRITE_TOKEN,
      selectedCardIds,
    }), { params: Promise.resolve({ id: PARTICIPATION_ID }) });
    expect(response.status).toBe(409);
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain(WRITE_TOKEN);
    expect(body).not.toContain("Supabase");
  });

  it("rejects an oversized body before invoking the service", async () => {
    const response = await start(request("/api/individual/participations", { filler: "x".repeat(5_000) }));
    expect(response.status).toBe(413);
    expect(startMock).not.toHaveBeenCalled();
  });
});
