"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { individualResultTextsV1 } from "@/config/individual-results";
import { workshopConfig } from "@/config/workshop";
import { useIndividualParticipation } from "@/context/individual-context";
import { getCard, getPhase } from "@/domain/catalog";
import { INDIVIDUAL_PHASE_IDS } from "@/domain/individual-participation";
import { LoadingState } from "./loading-state";
import { PhaseSelectionSummary } from "./phase-selection-summary";

export function IndividualResult() {
  const router = useRouter();
  const state = useIndividualParticipation();
  const [error, setError] = useState("");
  const hasParticipation = Boolean(state.participationId && state.collectiveId && (state.completed || state.writeToken));
  const resultCode = state.completed ? state.resultCode : null;

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.leaving) return;
    if (!hasParticipation) {
      router.replace("/individual");
      return;
    }
    if (!state.completed) {
      router.replace("/individual/overview");
    }
  }, [hasParticipation, router, state.completed, state.hydrated, state.leaving]);

  if (!state.hydrated || state.leaving || !hasParticipation || !state.completed || !resultCode) return <LoadingState />;

  function startNewParticipation() {
    setError("");
    if (!state.clear()) {
      setError("No se pudo limpiar la participación guardada en este dispositivo.");
      return;
    }
    router.replace("/individual");
  }

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Resultado individual</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#0a0a0a] sm:text-[40px]">Así imaginas la Justicia del futuro</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-[#565656]">Estas son las prioridades que has elegido para construir la Justicia de 2030</p>

        <div className="mt-8 rounded-2xl border-l-4 border-[#114dcd] bg-[#edf2fe] p-6">
          <h2 className="text-lg font-bold text-[#0a0a0a]">Tu visión de Justicia 2030</h2>
          <p className="mt-3 max-w-5xl text-sm leading-7 text-[#0a0a0a]">{individualResultTextsV1[resultCode]}</p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {INDIVIDUAL_PHASE_IDS.map((phaseId) => {
            const phase = getPhase(workshopConfig, phaseId)!;
            const selectedCards = (state.selectionsByPhase[phaseId] ?? []).flatMap((cardId) => {
              const card = getCard(workshopConfig, cardId);
              return card?.phaseId === phaseId ? [card] : [];
            });
            return <PhaseSelectionSummary key={phaseId} phase={phase} selectedCards={selectedCards} selectedCount={selectedCards.length} maxSelections={3} />;
          })}
        </div>

        {error ? <p className="mt-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <button type="button" onClick={startNewParticipation} className="min-h-11 cursor-pointer rounded-lg bg-[#114dcd] px-7 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd]">Iniciar nueva partida</button>
          <Link href="/dashboard?origin=result" className="flex min-h-11 cursor-pointer items-center rounded-lg border border-[#114dcd] bg-white px-7 text-sm font-bold text-[#114dcd] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd]">Ver resultados generales</Link>
        </div>
      </section>
    </main>
  );
}
