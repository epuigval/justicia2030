"use client";

import Link from "next/link";
import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import type { WorkshopCard } from "@/domain/types";
import { CardDetailModal } from "./card-detail-modal";
import { CollectiveSelector } from "./collective-selector";
import { LoadingState } from "./loading-state";
import { PhaseExplorer } from "./phase-explorer";
import { StorageNotice } from "./notice";

export function TeamPhase({ phaseId }: { phaseId: string }) {
  const [detailCard, setDetailCard] = useState<WorkshopCard | null>(null);
  const { hydrated, collectiveId } = useWorkshop();
  if (!hydrated) return <LoadingState />;
  if (!workshopConfig.collectives.some((item) => item.id === collectiveId)) return <CollectiveSelector />;
  return <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8"><StorageNotice /><nav className="mb-6 flex flex-wrap gap-4" aria-label="Navegación de la fase"><Link href="/team" className="inline-flex min-h-11 items-center font-bold text-blue-800 underline">Volver al resumen</Link><Link href="/team/justicia-2030" className="inline-flex min-h-11 items-center font-bold text-violet-800 underline">Justicia 2030</Link></nav><PhaseExplorer phaseId={phaseId} onOpenDetail={setDetailCard} />{detailCard ? <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} /> : null}</main>;
}
