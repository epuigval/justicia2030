import { notFound } from "next/navigation";
import { IndividualPhase } from "@/components/individual-phase";
import { INDIVIDUAL_PHASE_IDS, type IndividualPhaseId } from "@/domain/individual-participation";

export default async function IndividualPhasePage({ params }: { params: Promise<{ phaseId: string }> }) {
  const { phaseId } = await params;
  if (!INDIVIDUAL_PHASE_IDS.includes(phaseId as IndividualPhaseId)) notFound();
  return <IndividualPhase phaseId={phaseId as IndividualPhaseId} />;
}
