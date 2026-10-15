import "server-only";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import {
  CatalogChangedError,
  DuplicateParticipationError,
  type ActiveCardRecord,
  type ActiveCollectiveRecord,
  type ActiveSubprofileRecord,
  type AtomicCompletionInput,
  type AtomicCompletionOutcome,
  type AtomicCompletionResult,
  type IndividualParticipationStore,
  type ParticipationRecord,
  type StartedParticipationRecord,
} from "./individual-participation-store";
import { createServerSupabaseClient } from "./supabase";

interface CatalogRow {
  id: string;
  name: string;
}

interface SubprofileRow extends CatalogRow {
  collective_id: string;
}

interface ParticipationRow {
  id: string;
  mode: string;
  status: "started" | "completed";
  collective_id: string;
  subprofile_id: string | null;
  catalog_version: string;
  interpretation_version: string;
  write_token_hash: string;
  final_payload_hash: string | null;
  result_code: string | null;
  completed_at: string | null;
}

interface CardRow {
  id: string;
  phase_id: string;
  category_id: string;
  title: string;
  sort_order: number;
}

interface CompletionRow {
  completion_outcome: AtomicCompletionOutcome;
  participation_status: "started" | "completed" | null;
  stored_result_code: string | null;
  stored_completed_at: string | null;
}

function databaseFailure(): Error {
  return new Error("individual_participation_database_failure");
}

function throwIfError(error: PostgrestError | null): void {
  if (error) throw databaseFailure();
}

function mapParticipation(row: ParticipationRow): ParticipationRecord {
  return {
    id: row.id,
    mode: row.mode,
    status: row.status,
    collectiveId: row.collective_id,
    subprofileId: row.subprofile_id,
    catalogVersion: row.catalog_version,
    interpretationVersion: row.interpretation_version,
    writeTokenHash: row.write_token_hash,
    finalPayloadHash: row.final_payload_hash,
    resultCode: row.result_code,
    completedAt: row.completed_at,
  };
}

export class SupabaseIndividualParticipationStore implements IndividualParticipationStore {
  constructor(private readonly client: SupabaseClient = createServerSupabaseClient()) {}

  async findActiveCollective(id: string): Promise<ActiveCollectiveRecord | null> {
    const { data, error } = await this.client
      .from("collectives")
      .select("id,name")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
    throwIfError(error);
    return data ? data as CatalogRow : null;
  }

  async findActiveSubprofile(id: string, collectiveId: string): Promise<ActiveSubprofileRecord | null> {
    const { data, error } = await this.client
      .from("subprofiles")
      .select("id,collective_id,name")
      .eq("id", id)
      .eq("collective_id", collectiveId)
      .eq("active", true)
      .maybeSingle();
    throwIfError(error);
    if (!data) return null;
    const row = data as SubprofileRow;
    return { id: row.id, collectiveId: row.collective_id, name: row.name };
  }

  async insertStartedParticipation(record: StartedParticipationRecord): Promise<void> {
    const { error } = await this.client.from("participations").insert({
      id: record.id,
      mode: "individual",
      status: "started",
      collective_id: record.collectiveId,
      subprofile_id: record.subprofileId,
      collective_name_snapshot: record.collectiveNameSnapshot,
      subprofile_name_snapshot: record.subprofileNameSnapshot,
      catalog_version: record.catalogVersion,
      interpretation_version: record.interpretationVersion,
      write_token_hash: record.writeTokenHash,
    });

    if (!error) return;
    if (error.code === "23505") throw new DuplicateParticipationError();
    if (error.code === "23503" || error.code === "23514") throw new CatalogChangedError();
    throw databaseFailure();
  }

  async findParticipation(id: string): Promise<ParticipationRecord | null> {
    const { data, error } = await this.client
      .from("participations")
      .select("id,mode,status,collective_id,subprofile_id,catalog_version,interpretation_version,write_token_hash,final_payload_hash,result_code,completed_at")
      .eq("id", id)
      .maybeSingle();
    throwIfError(error);
    return data ? mapParticipation(data as ParticipationRow) : null;
  }

  async findActiveCards(ids: readonly string[]): Promise<ActiveCardRecord[]> {
    const { data: cardData, error: cardError } = await this.client
      .from("cards")
      .select("id,phase_id,category_id,title,sort_order")
      .in("id", [...ids])
      .eq("active", true);
    throwIfError(cardError);

    const cards = (cardData ?? []) as CardRow[];
    if (cards.length === 0) return [];

    const phaseIds = [...new Set(cards.map((card) => card.phase_id))];
    const categoryIds = [...new Set(cards.map((card) => card.category_id))];
    const [{ data: phaseData, error: phaseError }, { data: categoryData, error: categoryError }] = await Promise.all([
      this.client.from("phases").select("id").in("id", phaseIds).eq("active", true),
      this.client.from("categories").select("id").in("id", categoryIds).eq("active", true),
    ]);
    throwIfError(phaseError);
    throwIfError(categoryError);

    if ((phaseData?.length ?? 0) !== phaseIds.length || (categoryData?.length ?? 0) !== categoryIds.length) return [];

    return cards.map((card) => ({
      id: card.id,
      phaseId: card.phase_id,
      categoryId: card.category_id,
      title: card.title,
      sortOrder: card.sort_order,
    }));
  }

  async completeParticipation(input: AtomicCompletionInput): Promise<AtomicCompletionResult> {
    const { data, error } = await this.client.rpc("complete_individual_participation", {
      p_participation_id: input.participationId,
      p_write_token_hash: input.writeTokenHash,
      p_card_ids: input.cardIds,
      p_result_code: input.resultCode,
      p_final_payload_hash: input.finalPayloadHash,
    }).single();
    throwIfError(error);

    const row = data as CompletionRow | null;
    if (!row) throw databaseFailure();
    return {
      outcome: row.completion_outcome,
      status: row.participation_status,
      resultCode: row.stored_result_code,
      completedAt: row.stored_completed_at,
    };
  }
}
