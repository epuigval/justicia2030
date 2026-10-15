import "server-only";

import {
  aggregateDashboardMetrics,
  type DashboardCollectiveSource,
  type DashboardDateRange,
  type DashboardDto,
  type DashboardParticipationSource,
  type DashboardSelectionSource,
} from "@/domain/dashboard";
import { createServerSupabaseClient } from "@/server/supabase";

const PARTICIPATION_PAGE_SIZE = 1_000;
const PARTICIPATION_ID_CHUNK_SIZE = 100;

type ServerSupabaseClient = ReturnType<typeof createServerSupabaseClient>;

interface ParticipationRow {
  id: string;
  status: "started" | "completed";
  collective_id: string;
  started_at: string;
}

interface SelectionRow {
  participation_id: string;
  card_id: string;
  phase_id: string;
  category_id_snapshot: string;
}

interface CollectiveRow {
  id: string;
  name: string;
}

function dashboardReadError(): Error {
  return new Error("dashboard_data_unavailable");
}

async function readParticipations(
  client: ServerSupabaseClient,
  range: DashboardDateRange,
): Promise<DashboardParticipationSource[]> {
  const participations: DashboardParticipationSource[] = [];

  for (let offset = 0; ; offset += PARTICIPATION_PAGE_SIZE) {
    let query = client
      .from("participations")
      .select("id,status,collective_id,started_at")
      .order("started_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + PARTICIPATION_PAGE_SIZE - 1);

    if (range.fromUtc) {
      query = query.gte("started_at", range.fromUtc);
    }

    if (range.toExclusiveUtc) {
      query = query.lt("started_at", range.toExclusiveUtc);
    }

    const { data, error } = await query;

    if (error) {
      throw dashboardReadError();
    }

    const rows = (data ?? []) as ParticipationRow[];

    for (const row of rows) {
      if (row.status !== "started" && row.status !== "completed") {
        throw dashboardReadError();
      }

      participations.push({
        participationId: row.id,
        status: row.status,
        collectiveId: row.collective_id,
        startedAt: row.started_at,
      });
    }

    if (rows.length < PARTICIPATION_PAGE_SIZE) {
      return participations;
    }
  }
}

async function readCollectives(
  client: ServerSupabaseClient,
): Promise<DashboardCollectiveSource[]> {
  const { data, error } = await client
    .from("collectives")
    .select("id,name")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw dashboardReadError();
  }

  return ((data ?? []) as CollectiveRow[]).map((row) => ({
    id: row.id,
    name: row.name,
  }));
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function readCompletedSelections(
  client: ServerSupabaseClient,
  completedParticipationIds: string[],
): Promise<DashboardSelectionSource[]> {
  const selections: DashboardSelectionSource[] = [];

  for (const participationIds of chunk(
    completedParticipationIds,
    PARTICIPATION_ID_CHUNK_SIZE,
  )) {
    const { data, error } = await client
      .from("participation_selections")
      .select("participation_id,card_id,phase_id,category_id_snapshot")
      .in("participation_id", participationIds);

    if (error) {
      throw dashboardReadError();
    }

    for (const row of (data ?? []) as SelectionRow[]) {
      selections.push({
        participationId: row.participation_id,
        cardId: row.card_id,
        phaseId: row.phase_id,
        categoryId: row.category_id_snapshot,
      });
    }
  }

  return selections;
}

export async function getDashboardMetrics(
  range: DashboardDateRange,
): Promise<DashboardDto> {
  const client = createServerSupabaseClient();
  const [participations, collectives] = await Promise.all([
    readParticipations(client, range),
    readCollectives(client),
  ]);
  const completedParticipationIds = participations
    .filter((participation) => participation.status === "completed")
    .map((participation) => participation.participationId);
  const selections = await readCompletedSelections(
    client,
    completedParticipationIds,
  );

  return aggregateDashboardMetrics({
    range,
    participations,
    selections,
    collectives,
  });
}
