import { notFound } from "next/navigation";
import { TeamCard } from "@/components/team-card";
import { workshopConfig } from "@/config/workshop";
import { getCard, getPhase } from "@/domain/catalog";

export default async function CardPage({ params }: { params: Promise<{ phaseId: string; cardId: string }> }) {
  const { phaseId, cardId } = await params;
  const phase = getPhase(workshopConfig, phaseId);
  const card = getCard(workshopConfig, cardId);
  if (!phase || !card || card.phaseId !== phaseId) notFound();
  return <TeamCard card={card} />;
}
