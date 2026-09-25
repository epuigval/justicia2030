"use client";

import Link from "next/link";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { getCard, orderedPhases } from "@/domain/catalog";
import { CollectiveSelector } from "./collective-selector";
import { LoadingState } from "./loading-state";
import { StorageNotice } from "./notice";
import { ResetConfirm } from "./reset-confirm";

const phaseCardStyles = {
  orange: { border: "border-[#e26600]", accent: "bg-[#e26600]", check: "bg-[#e26600]" },
  green: { border: "border-[#10b981]", accent: "bg-[#10b981]", check: "bg-[#10B981]" },
  blue: { border: "border-[#0e42b1]", accent: "bg-[#0e42b1]", check: "bg-[#114dcd]" },
  violet: { border: "border-[#072056]", accent: "bg-[#072056]", check: "bg-[#072056]" },
} as const;

export function TeamSummary() {
  const { hydrated, selectionsByPhase, collectiveId, reset } = useWorkshop();

  if (!hydrated) return <LoadingState />;
  const collective = workshopConfig.collectives.find((item) => item.id === collectiveId);
  if (!collective) return <CollectiveSelector />;

  const phases = orderedPhases(workshopConfig);
  const collectiveIconSrc = collective.assets?.iconSrc ?? "/collectives/fiscalia/icon.svg";

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <div className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12">
        <StorageNotice />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Vista principal</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-9 text-[#0a0a0a] sm:text-[32px]">Nuestro camino hacia Justicia 2030</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#0a0a0a]">Entrad en cualquier fase, debatid las propuestas y ajustad vuestras selecciones libremente.</p>
        </div>
        <section className="mt-8 border-t border-slate-200 pt-6" aria-label="Colectivo seleccionado">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="size-6 shrink-0 bg-[#114dcd] [mask-image:var(--collective-icon)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" style={{ "--collective-icon": `url('${collectiveIconSrc}')` } as React.CSSProperties} />
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
            const style = phaseCardStyles[phase.accent];
            const progress = `${(selectedCardIds.length / workshopConfig.maxSelectionsPerPhase) * 100}%`;
            return <article key={phase.id} className={`relative flex min-h-[239px] flex-col overflow-hidden rounded-2xl border bg-white/95 p-[25px] pt-[33px] shadow-[0_4px_20px_-4px_rgba(234,88,12,0.08)] ${style.border}`}><div className={`absolute inset-x-0 top-0 h-2 ${style.accent}`} /><p className="text-xs font-bold uppercase leading-4 tracking-[0.3px] text-[#114dcd]">Fase {phase.order}</p><h3 className="mt-1 text-lg font-bold leading-7 text-slate-900">{phase.name}</h3><div className="mt-5 rounded-xl border border-[#f2f2f2] bg-[#f2f2f2]/90 p-[13px]"><div className="flex items-center justify-between gap-3 text-xs leading-4"><span className="font-medium text-[#0a0a0a]">Tarjetas de acción</span><strong className="text-slate-800">{selectedCardIds.length}/{workshopConfig.maxSelectionsPerPhase} seleccionadas</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${style.accent}`} style={{ width: progress }} /></div></div>{selectedCards.length > 0 ? <ul className="mt-3 space-y-2" aria-label={`Tarjetas seleccionadas de ${phase.name}`}>{selectedCards.map((card) => <li key={card.id} className="flex items-start gap-2 text-xs leading-4 text-[#0a0a0a]"><span aria-hidden="true" className={`size-4 shrink-0 [mask-image:url('/icons/check.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${style.check}`} />{card.title}</li>)}</ul> : null}<div className="mt-auto pt-4"><Link href={`/team/phase/${phase.id}`} className="flex min-h-9 w-full items-center justify-center rounded-lg bg-[#114dcd] px-4 py-2.5 text-sm font-semibold leading-4 text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-3">Ver tarjetas</Link></div></article>;
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