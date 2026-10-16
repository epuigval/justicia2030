"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { workshopConfig } from "@/config/workshop";
import { useIndividualParticipation } from "@/context/individual-context";
import { getCard, getPhase } from "@/domain/catalog";
import { INDIVIDUAL_PHASE_IDS } from "@/domain/individual-participation";
import { IndividualAbandonAction } from "./individual-abandon-action";
import { LoadingState } from "./loading-state";
import { PhaseSelectionSummary } from "./phase-selection-summary";

export function IndividualOverview() {
  const router = useRouter();
  const state = useIndividualParticipation();
  const hasParticipation = Boolean(state.participationId && state.collectiveId && (state.completed || state.writeToken));

  useEffect(() => {
    if (!state.hydrated || state.leaving) return;
    if (!hasParticipation) {
      router.replace("/individual");
      return;
    }
    if (state.completed) router.replace("/individual/result");
  }, [hasParticipation, router, state.completed, state.hydrated, state.leaving]);

  if (!state.hydrated || state.leaving || !hasParticipation || state.completed) return <LoadingState />;

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Vista principal</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-9 text-[#0a0a0a] sm:text-[32px]">Tu camino hacia Justicia 2030</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#0a0a0a]">Entra en cualquier fase y revisa tus prioridades libremente antes de finalizar.</p>

        <section className="mt-8 border-t border-slate-200 pt-6" aria-labelledby="individual-phases-title">
          <h2 id="individual-phases-title" className="text-xl font-extrabold leading-7 text-[#0a0a0a]">Fases de la participación</h2>
          <p className="mt-2 text-sm leading-5 text-[#0a0a0a]">Escoge 3 de las 8 propuestas de cada fase.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {INDIVIDUAL_PHASE_IDS.map((phaseId) => {
              const phase = getPhase(workshopConfig, phaseId)!;
              const selectedIds = state.selectionsByPhase[phaseId] ?? [];
              const selectedCards = selectedIds.flatMap((cardId) => {
                const card = getCard(workshopConfig, cardId);
                return card?.phaseId === phaseId ? [card] : [];
              });
              return (
                <PhaseSelectionSummary
                  key={phaseId}
                  phase={phase}
                  selectedCards={selectedCards}
                  selectedCount={selectedIds.length}
                  maxSelections={3}
                  actionHref={`/individual/phase/${phaseId}`}
                  actionLabel="Ver tarjetas"
                />
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          <IndividualAbandonAction />
        </div>
      </section>
    </main>
  );
}
