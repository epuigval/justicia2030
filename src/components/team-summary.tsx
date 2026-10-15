"use client";

import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { getCard, orderedPhases } from "@/domain/catalog";
import { CollectiveSelector } from "./collective-selector";
import { LoadingState } from "./loading-state";
import { StorageNotice } from "./notice";
import { ResetConfirm } from "./reset-confirm";
import { WorkshopCompletionBanner } from "./workshop-completion-banner";
import { PhaseSelectionSummary } from "./phase-selection-summary";

export function TeamSummary() {
  const { hydrated, selectionsByPhase, collectiveId, reset } = useWorkshop();

  if (!hydrated) return <LoadingState />;
  const collective = workshopConfig.collectives.find((item) => item.id === collectiveId);
  if (!collective) return <CollectiveSelector />;

  const phases = orderedPhases(workshopConfig);

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <div className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12">
        <StorageNotice />
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Vista principal</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-9 text-[#0a0a0a] sm:text-[32px]">Nuestro camino hacia Justicia 2030</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#0a0a0a]">Entrad en cualquier fase, debatid las propuestas y ajustad vuestras selecciones libremente.</p>
          </div>
          <WorkshopCompletionBanner className="w-full shrink-0 xl:w-[420px]" />
        </div>
        <section className="mt-8 border-t border-slate-200 pt-6" aria-label="Colectivo seleccionado">
          <div className="flex items-center gap-2">
            {collective.assets?.iconSrc ? <span aria-hidden="true" className="size-6 shrink-0 bg-[#114dcd] [mask-image:var(--collective-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" style={{ "--collective-icon": `url('${collective.assets.iconSrc}')` } as React.CSSProperties} /> : null}
            <h2 className="text-sm font-extrabold uppercase tracking-[0.3px] text-[#114dcd]">{collective.name}</h2>
          </div>
          <p className="mt-2 max-w-[1024px] text-sm leading-5 text-[#0a0a0a]">{collective.description}</p>
          <p className="mt-3 text-xs leading-4 text-[#0a0a0a]"><strong>Criterios:</strong> <span className="font-bold">{collective.prioritizationCriteria.join(" · ")}</span></p>
        </section>
        <section className="mt-8" aria-labelledby="phases-title">
          <h2 id="phases-title" className="text-xl font-extrabold leading-7 text-[#0a0a0a]">Fases del workshop</h2>
          <p className="mt-2 text-sm leading-4 text-[#0a0a0a]">Por cada fase, debatid y <strong>escoged 3 de los 8 temas</strong> según las prioridades de vuestro colectivo.</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {phases.map((phase) => {
            const selectedCardIds = selectionsByPhase[phase.id] ?? [];
            const selectedCards = selectedCardIds.flatMap((cardId) => {
              const card = getCard(workshopConfig, cardId);
              return card?.phaseId === phase.id ? [card] : [];
            });
            return <PhaseSelectionSummary key={phase.id} phase={phase} selectedCards={selectedCards} selectedCount={selectedCardIds.length} maxSelections={workshopConfig.maxSelectionsPerPhase} actionHref={`/team/phase/${phase.id}`} />;
          })}
          </div>
        </section>
        <div className="mt-8">
          <ResetConfirm triggerLabel="Abandonar partida" title="Nueva partida" message="Al cambiar de colectivo, es necesario iniciar la partida de nuevo. Las tarjetas que tuvierais seleccionadas para el colectivo anterior se borrarán." confirmLabel="Empezar nueva partida" onConfirm={reset} modal triggerClassName="rounded-lg border border-[#114dcd] bg-white px-4 py-2 text-sm font-semibold leading-5 text-[#114dcd] shadow-[0_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-3" />
        </div>
      </div>
    </main>
  );
}
