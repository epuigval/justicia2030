import { describe, expect, it } from "vitest";
import {
  calculateInterpretationV1,
  parseCompleteIndividualParticipationPayload,
  parseStartIndividualParticipationPayload,
} from "@/domain/individual-participation";

const PARTICIPATION_ID = "123e4567-e89b-42d3-a456-426614174000";
const WRITE_TOKEN = "abcdefghijklmnopqrstuvwxyzABCDEF";

describe("individual participation payloads", () => {
  it("accepts valid start payloads with and without a subprofile", () => {
    expect(parseStartIndividualParticipationPayload({
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      collectiveId: "jueces-magistrados",
    })).toEqual({
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      collectiveId: "jueces-magistrados",
      subprofileId: null,
    });

    expect(parseStartIndividualParticipationPayload({
      participationId: PARTICIPATION_ID,
      writeToken: WRITE_TOKEN,
      collectiveId: "jueces-magistrados",
      subprofileId: "orden-civil",
    })?.subprofileId).toBe("orden-civil");
  });

  it("rejects eight cards and duplicate cards", () => {
    const eightIds = Array.from({ length: 8 }, (_, index) => `card-${index}`);
    expect(parseCompleteIndividualParticipationPayload(PARTICIPATION_ID, {
      writeToken: WRITE_TOKEN,
      selectedCardIds: eightIds,
    })).toBeNull();

    expect(parseCompleteIndividualParticipationPayload(PARTICIPATION_ID, {
      writeToken: WRITE_TOKEN,
      selectedCardIds: [...eightIds, "card-0"],
    })).toBeNull();
  });
});

describe("interpretation-v1", () => {
  it("maps 3+3+3+0 to integral vision", () => {
    expect(calculateInterpretationV1([
      "personas", "personas", "personas",
      "procesos", "procesos", "procesos",
      "tecnologia", "tecnologia", "tecnologia",
    ])).toBe("vision-integral");
  });

  it("maps two categories with at least three selections to their combination", () => {
    expect(calculateInterpretationV1([
      "personas", "personas", "personas",
      "procesos", "procesos", "procesos",
      "tecnologia", "tecnologia", "gobernanza",
    ])).toBe("foco-personas-procesos");
  });

  it("maps one category with at least four selections to that category", () => {
    expect(calculateInterpretationV1([
      "gobernanza", "gobernanza", "gobernanza", "gobernanza",
      "personas", "personas", "procesos", "procesos", "tecnologia",
    ])).toBe("foco-gobernanza");
  });

  it("falls back to integral vision", () => {
    expect(calculateInterpretationV1([
      "personas", "personas", "personas",
      "procesos", "procesos",
      "tecnologia", "tecnologia",
      "gobernanza", "gobernanza",
    ])).toBe("vision-integral");
  });
});
