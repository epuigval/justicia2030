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
  return <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6"><div className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12"><StorageNotice /><nav className="mb-8" aria-label="Navegación de la fase"><Link href="/team" className="inline-flex items-center gap-2 text-sm font-semibold text-[#114dcd] focus-visible:outline-3"><img src="/icons/arrow_back.svg" alt="" className="size-4" />Volver a Vista Principal</Link></nav><PhaseExplorer phaseId={phaseId} onOpenDetail={setDetailCard} />{detailCard ? <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} /> : null}</div></main>;
}
