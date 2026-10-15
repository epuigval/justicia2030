import { IndividualStart } from "@/components/individual-start";
import type { IndividualCatalog } from "@/domain/individual-flow";
import { getActiveIndividualCatalog } from "@/server/individual-catalog";

export const dynamic = "force-dynamic";

export default async function IndividualPage() {
  let catalog: IndividualCatalog = { collectives: [], subprofiles: [] };
  let catalogUnavailable = false;
  try {
    catalog = await getActiveIndividualCatalog();
  } catch {
    catalogUnavailable = true;
    console.error("individual_catalog_load_failed");
  }
  return <IndividualStart catalog={catalog} catalogUnavailable={catalogUnavailable} />;
}
