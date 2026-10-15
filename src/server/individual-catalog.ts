import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { IndividualCatalog } from "@/domain/individual-flow";
import { createServerSupabaseClient } from "./supabase";

interface CollectiveRow {
  id: string;
  name: string;
}

interface SubprofileRow {
  id: string;
  collective_id: string;
  name: string;
}

export async function getActiveIndividualCatalog(client: SupabaseClient = createServerSupabaseClient()): Promise<IndividualCatalog> {
  const [collectivesResult, subprofilesResult] = await Promise.all([
    client.from("collectives").select("id,name,sort_order").eq("active", true).order("sort_order"),
    client.from("subprofiles").select("id,collective_id,name,sort_order").eq("active", true).order("collective_id").order("sort_order"),
  ]);

  if (collectivesResult.error || subprofilesResult.error) throw new Error("individual_catalog_unavailable");

  return {
    collectives: ((collectivesResult.data ?? []) as CollectiveRow[]).map(({ id, name }) => ({ id, name })),
    subprofiles: ((subprofilesResult.data ?? []) as SubprofileRow[]).map(({ id, collective_id, name }) => ({ id, collectiveId: collective_id, name })),
  };
}
