"use client";

import Link from "next/link";
import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { getCard, orderedPhases } from "@/domain/catalog";
import { isComplete } from "@/domain/selections";
import { CollectiveSelector } from "./collective-selector";
import { LoadingState } from "./loading-state";
import { PhaseResultSender } from "./phase-result-sender";
import { ResetConfirm } from "./reset-confirm";
import { StorageNotice } from "./notice";

export function TeamSummary() {
  const [completionModalDismissed, setCompletionModalDismissed] = useState(false);
  const { hydrated, sessionId, selectionsByPhase, collectiveId, isSelectionSent, markSelectionSent, reset } = useWorkshop();

  if (!hydrated) return <LoadingState />;
  const collective = workshopConfig.collectives.find((item) => item.id === collectiveId);
  if (!collective) return <CollectiveSelector />;

  const phases = orderedPhases(workshopConfig);
  const complete = isComplete(workshopConfig, selectionsByPhase);
  const allResultsSent = complete && phases.every((phase) => isSelectionSent(phase.id, selectionsByPhase[phase.id] ?? []));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StorageNotice />
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Vista del equipo</p><h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Nuestro camino hacia Justicia 2030</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">Entra en cualquier fase, debate las propuestas y ajusta tus selecciones libremente.</p></div>
        <ResetConfirm triggerLabel="Comenzar nueva partida" message="Se eliminarán las selecciones del equipo guardadas en este navegador. No afectará al dinamizador ni a otros dispositivos. Esta acción no se puede deshacer." confirmLabel="Borrar y empezar" onConfirm={reset} />
      </div>
      <section className="mt-8 flex items-center gap-5 border-y border-slate-200 py-5" aria-label="Colectivo seleccionado">
        <div><p className="text-sm font-black uppercase tracking-wide text-blue-700">{collective.name}</p><p className="mt-1 text-slate-600">{collective.description}</p><p className="mt-2 text-sm font-semibold text-slate-500">Criterios: {collective.prioritizationCriteria.join(" · ")}</p></div>
      </section>
      <section className="mt-8" aria-labelledby="phases-title">
        <h2 id="phases-title" className="text-2xl font-black text-blue-950">Fases del workshop</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {phases.map((phase) => {
            const selectedCardIds = selectionsByPhase[phase.id] ?? [];
            const selectedCards = selectedCardIds.map((id) => getCard(workshopConfig, id)).filter((card) => card?.phaseId === phase.id);
            return <article key={phase.id} className={`flex flex-col rounded-lg border-2 bg-white p-6 shadow-sm accent-${phase.accent}`}><p className="text-sm font-black uppercase tracking-wide text-blue-700">Fase {phase.order}</p><h3 className="mt-2 text-2xl font-black text-blue-950">{phase.name}</h3><p className="mt-3 min-h-14 leading-7 text-slate-600">{phase.description}</p><p className="mt-4 font-black text-slate-800">{selectedCardIds.length}/{workshopConfig.maxSelectionsPerPhase} seleccionadas</p>{selectedCards.length > 0 ? <ul className="mt-3 flex-1 space-y-2 border-t border-slate-200 pt-3">{selectedCards.map((card) => <li key={card!.id} className="font-semibold text-slate-700">{card!.title}</li>)}</ul> : <p className="mt-3 flex-1 border-t border-slate-200 pt-3 text-slate-500">Sin tarjetas seleccionadas.</p>}<Link href={`/team/phase/${phase.id}`} className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 font-bold text-white focus-visible:outline-3">Explorar fase</Link><PhaseResultSender sessionId={sessionId} phaseId={phase.id} collectiveId={collective.id} selectedCardIds={selectedCardIds} selectionAlreadySent={isSelectionSent(phase.id, selectedCardIds)} onSent={() => { setCompletionModalDismissed(false); markSelectionSent(phase.id, selectedCardIds); }} /></article>;
          })}
        </div>
      </section>
      {allResultsSent && !completionModalDismissed ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="completion-title" aria-describedby="completion-description" className="relative w-full max-w-3xl rounded-lg bg-white p-7 shadow-2xl sm:p-9">
            <button type="button" onClick={() => setCompletionModalDismissed(true)} aria-label="Cerrar" className="absolute right-5 top-5 flex size-11 items-center justify-center text-2xl text-slate-700 focus-visible:outline-3">×</button>
            <div className="pr-12">
              <p className="text-sm font-black uppercase tracking-widest text-blue-700">Resultado</p>
              <h2 id="completion-title" className="mt-2 text-2xl font-black text-blue-950 sm:text-3xl">Resultado generado correctamente</h2>
              <p id="completion-description" className="mt-3 leading-7 text-slate-700">Podrás verlo al final de la actividad.</p>
            </div>
            <div className="mt-7 flex justify-end">
              <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-blue-700 px-5 font-bold text-white focus-visible:outline-3">Volver a repetir la actividad</button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}