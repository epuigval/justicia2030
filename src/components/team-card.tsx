"use client";

import { useWorkshop } from "@/context/workshop-context";
import type { WorkshopCard } from "@/domain/types";
import { WorkshopCardDetail } from "./card-detail";
import { LoadingState } from "./loading-state";
import { StorageNotice } from "./notice";

export function TeamCard({ card }: { card: WorkshopCard }) {
  const { hydrated } = useWorkshop();
  if (!hydrated) return <LoadingState />;
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><StorageNotice /><WorkshopCardDetail card={card} backHref={`/team/phase/${card.phaseId}`} /></main>;
}
