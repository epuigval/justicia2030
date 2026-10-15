"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CardDetailModal } from "@/components/card-detail-modal";
import { CardTile } from "@/components/card-tile";
import { CategoryFilters } from "@/components/category-filters";
import { LoadingState } from "@/components/loading-state";
import { useIndividualParticipation } from "@/context/individual-context";
import { workshopConfig } from "@/config/workshop";
import { filterCards, getPhase } from "@/domain/catalog";
import { firstIncompleteIndividualPhase, hasCompleteIndividualSelections } from "@/domain/individual-flow";
import { INDIVIDUAL_PHASE_IDS, type IndividualPhaseId } from "@/domain/individual-participation";
import type { CategoryId, WorkshopCard } from "@/domain/types";
import { IndividualAbandonAction } from "./individual-abandon-action";
import { IndividualSelectionTray } from "./individual-selection-tray";

const accentStyles = {
  orange: "border-[#e26600] bg-[rgba(226,102,0,0.10)]",
  green: "border-[#10b981] bg-[rgba(16,185,129,0.10)]",
  blue: "border-[#114dcd] bg-[rgba(17,77,205,0.10)]",
  violet: "border-[#072056] bg-[rgba(7,32,86,0.10)]",
} as const;

export function IndividualPhase({ phaseId, returnToResult = false }: { phaseId: IndividualPhaseId; returnToResult?: boolean }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");
  const [detailCard, setDetailCard] = useState<WorkshopCard | null>(null);
  const state = useIndividualParticipation();
  const { completed, hydrated, leaving, setCurrentPhase } = state;
  const phase = getPhase(workshopConfig, phaseId)!;
  const phaseIndex = INDIVIDUAL_PHASE_IDS.indexOf(phaseId);
  const firstIncomplete = firstIncompleteIndividualPhase(state.selectionsByPhase);
  const firstIncompleteIndex = firstIncomplete ? INDIVIDUAL_PHASE_IDS.indexOf(firstIncomplete) : -1;
  const hasParticipation = Boolean(state.participationId && state.collectiveId && (completed || state.writeToken));
  const blockedByProgress = firstIncompleteIndex >= 0 && phaseIndex > firstIncompleteIndex;
  const selectedIds = state.selectionsByPhase[phaseId] ?? [];
  const cards = filterCards(workshopConfig, phaseId, activeFilter);
  const nextPhaseId = INDIVIDUAL_PHASE_IDS[phaseIndex + 1];

  useEffect(() => {
    if (!hydrated) return;
    if (leaving) return;
    if (!hasParticipation) {
      router.replace("/individual");
      return;
    }
    if (completed) {
      router.replace("/individual/result");
      return;
    }
    if (blockedByProgress && firstIncomplete) {
      router.replace(`/individual/phase/${firstIncomplete}`);
      return;
    }
    setCurrentPhase(phaseId);
  }, [blockedByProgress, completed, firstIncomplete, hasParticipation, hydrated, leaving, phaseId, router, setCurrentPhase]);

  if (!hydrated || leaving || !hasParticipation || completed || blockedByProgress) return <LoadingState />;

  function continueFlow() {
    if (selectedIds.length !== 3) return;
    if (hasCompleteIndividualSelections(state.selectionsByPhase)) {
      router.push("/individual/result");
      return;
    }
    if (nextPhaseId) {
      state.setCurrentPhase(nextPhaseId);
      router.push(`/individual/phase/${nextPhaseId}`);
    } else {
      router.push("/individual/result");
    }
  }

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12" aria-labelledby={`individual-phase-${phaseId}`}>
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Participación individual</p>
        <h1 id={`individual-phase-${phaseId}`} className={`mt-3 flex min-h-[62px] items-center rounded-xl border-l-4 px-4 text-2xl font-bold tracking-[-0.5px] text-[#0a0a0a] sm:text-[32px] ${accentStyles[phase.accent]}`}>FASE {phase.order} - {phase.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[#0a0a0a]">Selecciona exactamente tres prioridades. Puedes consultar el detalle antes de elegir.</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <CategoryFilters config={workshopConfig} active={activeFilter} onChange={setActiveFilter} />
          <p className="text-xs font-semibold text-[#565656]">Fase {phase.order} de {INDIVIDUAL_PHASE_IDS.length}</p>
        </div>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <CardTile
                key={card.id}
                config={workshopConfig}
                card={card}
                selected={selectedIds.includes(card.id)}
                atLimit={selectedIds.length >= 3}
                onToggle={() => state.toggle(phaseId, card.id)}
                onOpenDetail={() => setDetailCard(card)}
              />
            ))}
          </div>
          <IndividualSelectionTray
            phaseId={phaseId}
            selectedIds={selectedIds}
            nextLabel={hasCompleteIndividualSelections(state.selectionsByPhase) ? returnToResult ? "Volver al resultado" : "Ver resultado" : nextPhaseId ? "Continuar a la siguiente fase" : "Ver resultado"}
            onRemove={(cardId) => state.toggle(phaseId, cardId)}
            onContinue={continueFlow}
          />
        </div>

        <div className="mt-7 flex flex-wrap items-start gap-3">
          {phaseIndex > 0 ? <button type="button" onClick={() => router.push(`/individual/phase/${INDIVIDUAL_PHASE_IDS[phaseIndex - 1]}`)} className="min-h-11 rounded-lg border border-[#114dcd] bg-white px-4 text-sm font-semibold text-[#114dcd] focus-visible:outline-3">Volver a la fase anterior</button> : null}
          <IndividualAbandonAction />
        </div>
        {detailCard ? <CardDetailModal
          card={detailCard}
          onClose={() => setDetailCard(null)}
          selection={{
            selected: selectedIds.includes(detailCard.id),
            disabled: selectedIds.length >= 3 && !selectedIds.includes(detailCard.id),
            locked: false,
            maxSelections: 3,
            onToggle: () => state.toggle(phaseId, detailCard.id),
          }}
        /> : null}
      </section>
    </main>
  );
}
