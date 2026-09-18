"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { WorkshopProvider, useWorkshop } from "@/context/workshop-context";
import { getCard, orderedPhases } from "@/domain/catalog";
import type { WorkshopCard } from "@/domain/types";
import { AppShell } from "./app-shell";
import { CardDetailModal } from "./card-detail-modal";
import { Justicia2030 } from "./justicia-2030";
import { LoadingState } from "./loading-state";
import { StorageNotice } from "./notice";
import { PhaseExplorer } from "./phase-explorer";
import { ProgressSummary } from "./progress-summary";
import { ResetConfirm } from "./reset-confirm";

function FacilitatorContent() {
  const phases = orderedPhases(workshopConfig);
  const [activePhase, setActivePhase] = useState(phases[0]?.id ?? "");
  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  const { hydrated, selectionsByPhase, reset } = useWorkshop();
  if (!hydrated) return <LoadingState />;
  const detailCard = detailCardId ? getCard(workshopConfig, detailCardId) : undefined;
  return (
    <main className="mx-auto max-w-[1700px] px-4 py-8 sm:px-6 lg:px-8">
      <StorageNotice />
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Espacio independiente</p><h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Panel del dinamizador</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">Registra el consenso verbal sin leer ni modificar datos de los equipos.</p></div><ResetConfirm triggerLabel="Comenzar nueva sesión" message="Se eliminarán las selecciones del dinamizador guardadas en este navegador. No afectará a los equipos ni a otros dispositivos. Esta acción no se puede deshacer." confirmLabel="Borrar y empezar" onConfirm={() => { reset(); setActivePhase(phases[0]?.id ?? ""); setDetailCardId(null); }} /></div>
      <div className="mt-7"><ProgressSummary id="facilitator-progress" selections={selectionsByPhase} unlimited /></div>
      <div className="mt-7 flex flex-wrap gap-2" role="tablist" aria-label="Fases del workshop">{phases.map((phase) => <button key={phase.id} type="button" role="tab" aria-selected={activePhase === phase.id} onClick={() => { setActivePhase(phase.id); setDetailCardId(null); }} className="min-h-11 rounded-xl border border-slate-300 bg-white px-5 font-black text-slate-700 focus-visible:outline-3 aria-selected:border-blue-700 aria-selected:bg-blue-700 aria-selected:text-white">{phase.name} · {(selectionsByPhase[phase.id] ?? []).length}</button>)}</div>
      <div className="mt-8" role="tabpanel">
        <PhaseExplorer key={activePhase} phaseId={activePhase} onOpenDetail={(card: WorkshopCard) => setDetailCardId(card.id)} />
      </div>
      {detailCard ? <CardDetailModal card={detailCard} onClose={() => setDetailCardId(null)} /> : null}
      <div className="my-12 border-t border-slate-300" />
      <Justicia2030 />
    </main>
  );
}

export function FacilitatorWorkspace() {
  return <WorkshopProvider scope="facilitator"><AppShell roleLabel="Dinamizador"><FacilitatorContent /></AppShell></WorkshopProvider>;
}
