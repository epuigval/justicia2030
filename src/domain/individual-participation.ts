import { isValidSessionId } from "./session";

export const INDIVIDUAL_PHASE_IDS = [
  "justicia-actual",
  "justicia-conectada",
  "justicia-inteligente",
] as const;

export const INDIVIDUAL_CATEGORY_IDS = [
  "personas",
  "procesos",
  "tecnologia",
  "gobernanza",
] as const;

export type IndividualPhaseId = (typeof INDIVIDUAL_PHASE_IDS)[number];
export type IndividualCategoryId = (typeof INDIVIDUAL_CATEGORY_IDS)[number];

export type InterpretationResultCode =
  | "vision-integral"
  | "foco-personas"
  | "foco-procesos"
  | "foco-tecnologia"
  | "foco-gobernanza"
  | "foco-personas-procesos"
  | "foco-personas-tecnologia"
  | "foco-personas-gobernanza"
  | "foco-procesos-tecnologia"
  | "foco-procesos-gobernanza"
  | "foco-tecnologia-gobernanza";

export interface StartIndividualParticipationInput {
  participationId: string;
  writeToken: string;
  collectiveId: string;
  subprofileId: string | null;
}

export interface CompleteIndividualParticipationInput {
  participationId: string;
  writeToken: string;
  selectedCardIds: string[];
}

export interface IndividualCardClassification {
  id: string;
  phaseId: string;
  categoryId: string;
}

const CATALOG_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;
const WRITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;
const START_KEYS = new Set(["participationId", "writeToken", "collectiveId", "subprofileId"]);
const COMPLETE_KEYS = new Set(["writeToken", "selectedCardIds"]);

const COMBINATION_CODES = new Map<string, InterpretationResultCode>([
  ["personas|procesos", "foco-personas-procesos"],
  ["personas|tecnologia", "foco-personas-tecnologia"],
  ["personas|gobernanza", "foco-personas-gobernanza"],
  ["procesos|tecnologia", "foco-procesos-tecnologia"],
  ["procesos|gobernanza", "foco-procesos-gobernanza"],
  ["tecnologia|gobernanza", "foco-tecnologia-gobernanza"],
]);

const PRIMARY_CODES: Record<IndividualCategoryId, InterpretationResultCode> = {
  personas: "foco-personas",
  procesos: "foco-procesos",
  tecnologia: "foco-tecnologia",
  gobernanza: "foco-gobernanza",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(candidate: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(candidate).every((key) => allowed.has(key));
}

export function isCatalogId(value: unknown): value is string {
  return typeof value === "string" && CATALOG_ID_PATTERN.test(value);
}

export function isWriteToken(value: unknown): value is string {
  return typeof value === "string" && WRITE_TOKEN_PATTERN.test(value);
}

export function parseStartIndividualParticipationPayload(payload: unknown): StartIndividualParticipationInput | null {
  if (!isPlainObject(payload) || !hasOnlyKeys(payload, START_KEYS)) return null;
  if (!isValidSessionId(payload.participationId) || !isWriteToken(payload.writeToken) || !isCatalogId(payload.collectiveId)) return null;

  const subprofileId = payload.subprofileId;
  if (subprofileId !== undefined && subprofileId !== null && !isCatalogId(subprofileId)) return null;

  return {
    participationId: payload.participationId,
    writeToken: payload.writeToken,
    collectiveId: payload.collectiveId,
    subprofileId: subprofileId ?? null,
  };
}

export function parseCompleteIndividualParticipationPayload(
  participationId: unknown,
  payload: unknown,
): CompleteIndividualParticipationInput | null {
  if (!isValidSessionId(participationId) || !isPlainObject(payload) || !hasOnlyKeys(payload, COMPLETE_KEYS)) return null;
  if (!isWriteToken(payload.writeToken) || !Array.isArray(payload.selectedCardIds)) return null;
  if (payload.selectedCardIds.length !== 9 || payload.selectedCardIds.some((id) => !isCatalogId(id))) return null;

  const selectedCardIds = payload.selectedCardIds as string[];
  if (new Set(selectedCardIds).size !== selectedCardIds.length) return null;

  return {
    participationId,
    writeToken: payload.writeToken,
    selectedCardIds: [...selectedCardIds],
  };
}

export function canonicalizeIndividualCardIds(cardIds: readonly string[]): string[] {
  return [...cardIds].sort((left, right) => left.localeCompare(right, "en"));
}

export function hasExpectedIndividualPhaseDistribution(cards: readonly IndividualCardClassification[]): boolean {
  if (cards.length !== 9 || new Set(cards.map((card) => card.id)).size !== 9) return false;

  const counts = new Map<string, number>();
  for (const card of cards) counts.set(card.phaseId, (counts.get(card.phaseId) ?? 0) + 1);

  return counts.size === INDIVIDUAL_PHASE_IDS.length
    && INDIVIDUAL_PHASE_IDS.every((phaseId) => counts.get(phaseId) === 3);
}

export function calculateInterpretationV1(categoryIds: readonly string[]): InterpretationResultCode | null {
  if (categoryIds.length !== 9) return null;

  const counts: Record<IndividualCategoryId, number> = {
    personas: 0,
    procesos: 0,
    tecnologia: 0,
    gobernanza: 0,
  };

  for (const categoryId of categoryIds) {
    if (!INDIVIDUAL_CATEGORY_IDS.includes(categoryId as IndividualCategoryId)) return null;
    counts[categoryId as IndividualCategoryId] += 1;
  }

  const values = INDIVIDUAL_CATEGORY_IDS.map((categoryId) => counts[categoryId]);
  if (values.filter((count) => count === 3).length === 3 && values.includes(0)) return "vision-integral";

  const combined = INDIVIDUAL_CATEGORY_IDS.filter((categoryId) => counts[categoryId] >= 3);
  if (combined.length === 2) return COMBINATION_CODES.get(combined.join("|")) ?? null;

  const primary = INDIVIDUAL_CATEGORY_IDS.find((categoryId) => counts[categoryId] >= 4);
  return primary ? PRIMARY_CODES[primary] : "vision-integral";
}
