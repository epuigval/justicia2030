"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { individualResultTextsV1, isInterpretationResultCode } from "@/config/individual-results";
import { workshopConfig } from "@/config/workshop";
import { useIndividualParticipation } from "@/context/individual-context";
import { getCard, getPhase } from "@/domain/catalog";
import { calculateInterpretationV1, INDIVIDUAL_PHASE_IDS } from "@/domain/individual-participation";
import { firstIncompleteIndividualPhase, hasCompleteIndividualSelections, orderedIndividualCardIds } from "@/domain/individual-flow";
import { LoadingState } from "./loading-state";
import { PhaseSelectionSummary } from "./phase-selection-summary";
import { ResetConfirm } from "./reset-confirm";

export function IndividualResult() {
  const router = useRouter();
  const state = useIndividualParticipation();
  const [pending, setPending] = useState(false);
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const [error, setError] = useState("");
  const completionRequestActive = useRef(false);
  const leaving = useRef(false);
  const hasParticipation = Boolean(state.participationId && state.writeToken && state.collectiveId);
  const selectionsComplete = hasCompleteIndividualSelections(state.selectionsByPhase);
  const selectedIds = useMemo(() => orderedIndividualCardIds(state.selectionsByPhase), [state.selectionsByPhase]);
  const calculatedResultCode = calculateInterpretationV1(selectedIds.map((id) => getCard(workshopConfig, id)?.categoryId ?? ""));
  const resultCode = calculatedResultCode;

  useEffect(() => {
    if (!state.hydrated) return;
    if (leaving.current) return;
    if (state.completed) {
      router.replace("/");
      return;
    }
    if (!hasParticipation) {
      router.replace("/individual");
      return;
    }
    if (!selectionsComplete) {
      const phaseId = firstIncompleteIndividualPhase(state.selectionsByPhase) ?? INDIVIDUAL_PHASE_IDS[0];
      router.replace(`/individual/phase/${phaseId}`);
    }
  }, [hasParticipation, router, selectionsComplete, state.completed, state.hydrated, state.selectionsByPhase]);

  if (!state.hydrated || state.completed || !hasParticipation || !selectionsComplete || !resultCode) return <LoadingState />;

  async function completeParticipation() {
    if (completionRequestActive.current || !state.participationId || !state.writeToken) return;
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
      setCompletionConfirmed(true);
      leaving.current = true;
      if (!state.clear()) {
        leaving.current = false;
        setError("La participación se completó, pero no se pudo limpiar el estado local. No vuelvas a finalizarla.");
        return;
      }
      router.replace("/");
    } catch {
      completionRequestActive.current = false;
      setError("No se pudo finalizar la participación. Tus selecciones siguen guardadas; puedes reintentarlo.");
    } finally {
      setPending(false);
    }
  }

  function abandonParticipation() {
    leaving.current = true;
    if (!state.clear()) {
      leaving.current = false;
      setError("No se pudo limpiar la participación guardada en este dispositivo.");
      return;
    }
    router.replace("/");
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
          <button type="button" disabled={pending || completionConfirmed} onClick={completeParticipation} className="min-h-11 rounded-lg bg-[#114dcd] px-7 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd] disabled:cursor-wait disabled:bg-[#7898dc]">{pending || completionConfirmed ? "Finalizando…" : "Finalizar"}</button>
          <ResetConfirm
            triggerLabel="Abandonar partida"
            title="Abandonar participación"
            message="Si abandonas esta participación, se eliminará el progreso guardado en este dispositivo. La participación seguirá registrada como iniciada, pero no se contabilizará como completada."
            confirmLabel="Abandonar participación"
            onConfirm={abandonParticipation}
            triggerClassName="min-h-11 rounded-lg border border-red-300 bg-white px-5 text-sm font-bold text-red-800 focus-visible:outline-3"
            modal
          />
        </div>
      </section>
    </main>
  );
}
