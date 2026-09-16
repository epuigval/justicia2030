import { notFound } from "next/navigation";
import { TeamPhase } from "@/components/team-phase";
import { workshopConfig } from "@/config/workshop";
import { getPhase } from "@/domain/catalog";

export default async function PhasePage({ params }: { params: Promise<{ phaseId: string }> }) {
  const { phaseId } = await params;
  if (!getPhase(workshopConfig, phaseId)) notFound();
  return <TeamPhase phaseId={phaseId} />;
}
