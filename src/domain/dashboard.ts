import { workshopConfig } from "@/config/workshop";

export const DASHBOARD_TIME_ZONE = "Europe/Madrid";

export interface DashboardDateRange {
  from: string;
  to: string;
  fromUtc: string | null;
  toExclusiveUtc: string | null;
}

export type DashboardDateRangeResult =
  | { ok: true; value: DashboardDateRange }
  | { ok: false; from: string; to: string; message: string };

export interface DashboardParticipationSource {
  participationId: string;
  status: "started" | "completed";
  collectiveId: string;
  startedAt: string;
}

export interface DashboardSelectionSource {
  participationId: string;
  cardId: string;
  phaseId: string;
  categoryId: string;
}

export interface DashboardCollectiveSource {
  id: string;
  name: string;
}

export interface DashboardPriorityItemDto {
  cardId: string;
  title: string;
  selectionCount: number;
  participantPercentage: number;
  rank: number;
}

export interface DashboardPhasePrioritiesDto {
  phaseId: string;
  phaseName: string;
  phaseOrder: number;
  accent: "orange" | "green" | "blue" | "violet";
  completedParticipants: number;
  priorities: DashboardPriorityItemDto[];
}

export interface DashboardCategoryDistributionItemDto {
  categoryId: string;
  categoryName: string;
  selectionCount: number;
  percentage: number;
}

export interface DashboardCollectiveMetricsDto {
  collectiveId: string;
  collectiveName: string;
  completedParticipations: number;
  phasePriorities: DashboardPhasePrioritiesDto[];
  totalSelections: number;
  categoryDistribution: DashboardCategoryDistributionItemDto[];
}

export interface DashboardDto {
  range: Pick<DashboardDateRange, "from" | "to">;
  summary: {
    startedParticipations: number;
    completedParticipations: number;
  };
  globalPhasePriorities: DashboardPhasePrioritiesDto[];
  collectiveMetrics: DashboardCollectiveMetricsDto[];
}

interface CivilDate {
  year: number;
  month: number;
  day: number;
}

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const madridFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function parseCivilDate(value: string): CivilDate | null {
  const match = isoDatePattern.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day };
}

function addCivilDays(date: CivilDate, days: number): CivilDate {
  const next = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1, day: next.getUTCDate() };
}

function zonedMidnightUtc(date: CivilDate): string {
  const target = Date.UTC(date.year, date.month - 1, date.day, 0, 0, 0);
  let candidate = target;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(
      madridFormatter.formatToParts(new Date(candidate)).filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
    ) as Record<string, number>;
    const representedAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const correction = target - representedAsUtc;
    candidate += correction;
    if (correction === 0) break;
  }

  return new Date(candidate).toISOString();
}

function singleQueryValue(value: string | string[] | undefined): { ok: true; value: string } | { ok: false } {
  if (value === undefined || value === "") return { ok: true, value: "" };
  return typeof value === "string" ? { ok: true, value } : { ok: false };
}

export function parseDashboardDateRange(fromValue: string | string[] | undefined, toValue: string | string[] | undefined): DashboardDateRangeResult {
  const fromParam = singleQueryValue(fromValue);
  const toParam = singleQueryValue(toValue);
  const from = fromParam.ok ? fromParam.value : "";
  const to = toParam.ok ? toParam.value : "";

  if (!fromParam.ok || !toParam.ok) return { ok: false, from, to, message: "Introduce una única fecha válida en cada campo." };
  const fromDate = from ? parseCivilDate(from) : null;
  const toDate = to ? parseCivilDate(to) : null;
  if ((from && !fromDate) || (to && !toDate)) return { ok: false, from, to, message: "Introduce fechas válidas con formato AAAA-MM-DD." };
  if (from && to && from > to) return { ok: false, from, to, message: "La fecha Desde no puede ser posterior a la fecha Hasta." };

  return {
    ok: true,
    value: {
      from,
      to,
      fromUtc: fromDate ? zonedMidnightUtc(fromDate) : null,
      toExclusiveUtc: toDate ? zonedMidnightUtc(addCivilDays(toDate, 1)) : null,
    },
  };
}

function percentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1_000) / 10;
}

function withinRange(startedAt: string, range: DashboardDateRange): boolean {
  const timestamp = Date.parse(startedAt);
  if (!Number.isFinite(timestamp)) return false;
  if (range.fromUtc && timestamp < Date.parse(range.fromUtc)) return false;
  if (range.toExclusiveUtc && timestamp >= Date.parse(range.toExclusiveUtc)) return false;
  return true;
}

function phasePriorities(selections: DashboardSelectionSource[], completedParticipants: number): DashboardPhasePrioritiesDto[] {
  const cardById = new Map(workshopConfig.cards.map((card) => [card.id, card]));

  return [...workshopConfig.phases].sort((left, right) => left.order - right.order).map((phase) => {
    const counts = new Map<string, number>();
    for (const selection of selections) {
      if (selection.phaseId !== phase.id || !cardById.has(selection.cardId)) continue;
      counts.set(selection.cardId, (counts.get(selection.cardId) ?? 0) + 1);
    }

    const ordered = [...counts.entries()]
      .map(([cardId, selectionCount]) => ({ card: cardById.get(cardId)!, selectionCount }))
      .sort((left, right) => right.selectionCount - left.selectionCount || left.card.order - right.card.order);

    let rank = 0;
    let previousCount: number | null = null;
    const priorities = ordered.flatMap(({ card, selectionCount }) => {
      if (selectionCount !== previousCount) {
        rank += 1;
        previousCount = selectionCount;
      }
      if (rank > 3) return [];
      return [{
        cardId: card.id,
        title: card.title,
        selectionCount,
        participantPercentage: percentage(selectionCount, completedParticipants),
        rank,
      }];
    });

    return {
      phaseId: phase.id,
      phaseName: phase.name,
      phaseOrder: phase.order,
      accent: phase.accent,
      completedParticipants,
      priorities,
    };
  });
}

export function aggregateDashboardMetrics(input: {
  range: DashboardDateRange;
  participations: DashboardParticipationSource[];
  selections: DashboardSelectionSource[];
  collectives: DashboardCollectiveSource[];
}): DashboardDto {
  const participationMap = new Map(
    input.participations.filter((participation) => withinRange(participation.startedAt, input.range)).map((participation) => [participation.participationId, participation]),
  );
  const participations = [...participationMap.values()];
  const completed = participations.filter((participation) => participation.status === "completed");
  const completedById = new Map(completed.map((participation) => [participation.participationId, participation]));
  const cardById = new Map(workshopConfig.cards.map((card) => [card.id, card]));
  const seenSelections = new Set<string>();
  const completedSelections = input.selections.filter((selection) => {
    const key = `${selection.participationId}\u0000${selection.cardId}`;
    const card = cardById.get(selection.cardId);
    if (seenSelections.has(key)
      || !completedById.has(selection.participationId)
      || !card
      || card.phaseId !== selection.phaseId
      || card.categoryId !== selection.categoryId) return false;
    seenSelections.add(key);
    return true;
  });

  const categoryOrder = [...workshopConfig.categories].sort((left, right) => left.order - right.order);
  const collectiveMetrics = input.collectives.map((collective) => {
    const collectiveCompleted = completed.filter((participation) => participation.collectiveId === collective.id);
    const collectiveParticipationIds = new Set(collectiveCompleted.map((participation) => participation.participationId));
    const collectiveSelections = completedSelections.filter((selection) => collectiveParticipationIds.has(selection.participationId));
    const categoryCounts = new Map<string, number>();
    for (const selection of collectiveSelections) categoryCounts.set(selection.categoryId, (categoryCounts.get(selection.categoryId) ?? 0) + 1);

    return {
      collectiveId: collective.id,
      collectiveName: collective.name,
      completedParticipations: collectiveCompleted.length,
      phasePriorities: phasePriorities(collectiveSelections, collectiveCompleted.length),
      totalSelections: collectiveSelections.length,
      categoryDistribution: categoryOrder.map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
        selectionCount: categoryCounts.get(category.id) ?? 0,
        percentage: percentage(categoryCounts.get(category.id) ?? 0, collectiveSelections.length),
      })),
    } satisfies DashboardCollectiveMetricsDto;
  });

  return {
    range: { from: input.range.from, to: input.range.to },
    summary: {
      startedParticipations: participations.length,
      completedParticipations: completed.length,
    },
    globalPhasePriorities: phasePriorities(completedSelections, completed.length),
    collectiveMetrics,
  };
}
