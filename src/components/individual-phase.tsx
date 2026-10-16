"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardDetailModal } from "@/components/card-detail-modal";
import { CardTile } from "@/components/card-tile";
import { CategoryFilters } from "@/components/category-filters";
import { IndividualCompletionModal } from "@/components/individual-completion-modal";
import { LoadingState } from "@/components/loading-state";
import { individualResultTextsV1, isInterpretationResultCode } from "@/config/individual-results";
import { useIndividualParticipation } from "@/context/individual-context";
import { workshopConfig } from "@/config/workshop";
import { filterCards, getCard, getPhase } from "@/domain/catalog";
import { hasCompleteIndividualSelections, nextIncompleteIndividualPhase, orderedIndividualCardIds } from "@/domain/individual-flow";
import { calculateInterpretationV1, INDIVIDUAL_PHASE_IDS, type IndividualPhaseId } from "@/domain/individual-participation";
import type { CategoryId, WorkshopCard } from "@/domain/types";
import { IndividualAbandonAction } from "./individual-abandon-action";
import { IndividualSelectionTray } from "./individual-selection-tray";

const accentStyles = {
  orange: "border-[#e26600] bg-[rgba(226,102,0,0.10)]",
  green: "border-[#10b981] bg-[rgba(16,185,129,0.10)]",
  blue: "border-[#114dcd] bg-[rgba(17,77,205,0.10)]",
  violet: "border-[#072056] bg-[rgba(7,32,86,0.10)]",
} as const;

export function IndividualPhase({ phaseId }: { phaseId: IndividualPhaseId }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");
  const [detailCard, setDetailCard] = useState<WorkshopCard | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionPending, setCompletionPending] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const completionRequestActive = useRef(false);
  const state = useIndividualParticipation();
  const { completed, hydrated, leaving, setCurrentPhase } = state;
  const phase = getPhase(workshopConfig, phaseId)!;
  const phaseIndex = INDIVIDUAL_PHASE_IDS.indexOf(phaseId);
  const hasParticipation = Boolean(state.participationId && state.collectiveId && (completed || state.writeToken));
  const selectedIds = state.selectionsByPhase[phaseId] ?? [];
  const cards = filterCards(workshopConfig, phaseId, activeFilter);
  const nextIncompletePhaseId = nextIncompleteIndividualPhase(state.selectionsByPhase, phaseId);
  const selectedCardIds = useMemo(() => orderedIndividualCardIds(state.selectionsByPhase), [state.selectionsByPhase]);
  const resultCode = calculateInterpretationV1(selectedCardIds.map((id) => getCard(workshopConfig, id)?.categoryId ?? ""));

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
    setCurrentPhase(phaseId);
  }, [completed, hasParticipation, hydrated, leaving, phaseId, router, setCurrentPhase]);

  if (!hydrated || leaving || !hasParticipation || completed) return <LoadingState />;

  function continueFlow() {
    if (selectedIds.length !== 3) return;
    if (hasCompleteIndividualSelections(state.selectionsByPhase)) {
      setCompletionError("");
      setShowCompletionModal(true);
      return;
    }
    if (nextIncompletePhaseId) {
      state.setCurrentPhase(nextIncompletePhaseId);
      router.push(`/individual/phase/${nextIncompletePhaseId}`);
    }
  }

  function editCards() {
    if (completionPending) return;
    setCompletionError("");
    setShowCompletionModal(false);
    router.push("/individual/overview");
  }

  async function completeParticipation() {
    if (completionRequestActive.current || !state.participationId || !state.writeToken) return;
    completionRequestActive.current = true;
    setCompletionPending(true);
    setCompletionError("");

    try {
      const response = await fetch(`/api/individual/participations/${state.participationId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writeToken: state.writeToken, selectedCardIds }),
      });
      if (!response.ok) throw new Error("request_failed");

      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object") throw new Error("invalid_response");
      const result = payload as Record<string, unknown>;
      if (result.status !== "completed" || !isInterpretationResultCode(result.resultCode) || typeof result.completedAt !== "string") throw new Error("invalid_response");

      state.markCompleted(result.resultCode, result.completedAt);
      router.push("/individual/result");
    } catch {
      completionRequestActive.current = false;
      setCompletionError("No se pudo finalizar la participación. Tus selecciones siguen guardadas; puedes reintentarlo.");
    } finally {
      setCompletionPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12" aria-labelledby={`individual-phase-${phaseId}`}>
        <Link href="/individual/overview" className="inline-flex items-center gap-2 text-sm font-semibold text-[#114dcd] focus-visible:outline-3"><img src="/icons/arrow_back.svg" alt="" className="size-4" />Volver a Vista Principal</Link>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Participación individual</p>
        <h1 id={`individual-phase-${phaseId}`} className={`mt-3 flex min-h-[62px] items-center rounded-xl border-l-4 px-4 text-2xl font-bold tracking-[-0.5px] text-[#0a0a0a] sm:text-[32px] ${accentStyles[phase.accent]}`}>FASE {phase.order} - {phase.name}</h1>
        <h2 className="mt-3 text-sm leading-6 text-[#0a0a0a]">Explora la propuesta de cada tarjeta y selecciona las tres que consideres prioritarias.</h2>

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
            nextLabel="Guardar y continuar"
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
        {showCompletionModal && resultCode ? (
          <IndividualCompletionModal
            error={completionError}
            interpretation={individualResultTextsV1[resultCode]}
            pending={completionPending}
            onEdit={editCards}
            onComplete={completeParticipation}
          />
        ) : null}
      </section>
    </main>
  );
}
