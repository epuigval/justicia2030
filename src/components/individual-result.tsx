"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { individualResultTextsV1, isInterpretationResultCode } from "@/config/individual-results";
import { workshopConfig } from "@/config/workshop";
import { useIndividualParticipation } from "@/context/individual-context";
import { getCard, getPhase } from "@/domain/catalog";
import { calculateInterpretationV1, INDIVIDUAL_PHASE_IDS } from "@/domain/individual-participation";
import { firstIncompleteIndividualPhase, hasCompleteIndividualSelections, orderedIndividualCardIds } from "@/domain/individual-flow";
import { IndividualAbandonAction } from "./individual-abandon-action";
import { LoadingState } from "./loading-state";
import { PhaseSelectionSummary } from "./phase-selection-summary";

export function IndividualResult() {
  const router = useRouter();
  const state = useIndividualParticipation();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const completionRequestActive = useRef(false);
  const hasParticipation = Boolean(state.participationId && state.collectiveId && (state.completed || state.writeToken));
  const selectionsComplete = hasCompleteIndividualSelections(state.selectionsByPhase);
  const selectedIds = useMemo(() => orderedIndividualCardIds(state.selectionsByPhase), [state.selectionsByPhase]);
  const calculatedResultCode = calculateInterpretationV1(selectedIds.map((id) => getCard(workshopConfig, id)?.categoryId ?? ""));
  const resultCode = state.completed ? state.resultCode : calculatedResultCode;

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.leaving) return;
    if (!hasParticipation) {
      router.replace("/individual");
      return;
    }
    if (!selectionsComplete) {
      const phaseId = firstIncompleteIndividualPhase(state.selectionsByPhase) ?? INDIVIDUAL_PHASE_IDS[0];
      router.replace(`/individual/phase/${phaseId}`);
    }
  }, [hasParticipation, router, selectionsComplete, state.hydrated, state.leaving, state.selectionsByPhase]);

  if (!state.hydrated || state.leaving || !hasParticipation || !selectionsComplete || !resultCode) return <LoadingState />;

  async function completeParticipation() {
    if (state.completed || completionRequestActive.current || !state.participationId || !state.writeToken) return;
    completionRequestActive.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/individual/participations/${state.participationId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writeToken: state.writeToken, selectedCardIds: selectedIds }),
      });
      if (!response.ok) {
        completionRequestActive.current = false;
        setError("No se pudo finalizar la participación. Tus selecciones siguen guardadas; puedes reintentarlo.");
        return;
      }

      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object") throw new Error("invalid_response");
      const result = payload as Record<string, unknown>;
      if (result.status !== "completed" || !isInterpretationResultCode(result.resultCode) || typeof result.completedAt !== "string") throw new Error("invalid_response");
      state.markCompleted(result.resultCode, result.completedAt);
    } catch {
      completionRequestActive.current = false;
      setError("No se pudo finalizar la participación. Tus selecciones siguen guardadas; puedes reintentarlo.");
    } finally {
      setPending(false);
    }
  }

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
            return <PhaseSelectionSummary key={phaseId} phase={phase} selectedCards={selectedCards} selectedCount={selectedCards.length} maxSelections={3} actionHref={state.completed ? undefined : `/individual/phase/${phaseId}?from=result`} actionLabel="Modificar selección" />;
          })}
        </div>

        {error ? <p className="mt-8 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">{error}</p> : null}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          {state.completed ? (
            <>
              <button type="button" onClick={startNewParticipation} className="min-h-11 rounded-lg bg-[#114dcd] px-7 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd]">Nueva participación</button>
              <Link href="/dashboard" className="flex min-h-11 items-center rounded-lg border border-[#114dcd] bg-white px-7 text-sm font-bold text-[#114dcd] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd]">Ver métricas</Link>
            </>
          ) : (
            <>
              <button type="button" disabled={pending} onClick={completeParticipation} className="min-h-11 rounded-lg bg-[#114dcd] px-7 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd] disabled:cursor-wait disabled:bg-[#7898dc]">{pending ? "Finalizando…" : "Finalizar"}</button>
              <IndividualAbandonAction />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
