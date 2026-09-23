"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { filterCards, getPhase, orderedPhases } from "@/domain/catalog";
import type { CategoryId, WorkshopCard } from "@/domain/types";
import { CardTile } from "./card-tile";
import { CategoryFilters } from "./category-filters";
import { SelectionTray } from "./selection-tray";

const accentStyles = {
  orange: "border-[#e26600]",
  green: "border-[#157f00]",
  blue: "border-[#114dcd]",
  violet: "border-[#7e57c2]",
} as const;

export function PhaseExplorer({ phaseId, detailHref, onOpenDetail }: {
  phaseId: string;
  detailHref?: (card: WorkshopCard) => string;
  onOpenDetail?: (card: WorkshopCard) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");
  const { scope, sessionId, collectiveId, selectionsByPhase, toggle, isSelectionSent } = useWorkshop();
  const phase = getPhase(workshopConfig, phaseId);
  if (!phase) return null;
  const selectedIds = selectionsByPhase[phaseId] ?? [];
  const cards = filterCards(workshopConfig, phaseId, activeFilter);
  const atLimit = scope === "team" && selectedIds.length >= workshopConfig.maxSelectionsPerPhase;
  const nextPhase = orderedPhases(workshopConfig)[phase.order];

  return (
    <section aria-labelledby={`phase-${phaseId}`}>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Selección de temas</p>
        <h1 id={`phase-${phaseId}`} className={`mt-3 border-l-4 pl-4 text-[32px] font-bold leading-9 tracking-[-0.8px] text-[#0a0a0a] ${accentStyles[phase.accent]}`}>FASE {phase.order} - {phase.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[#0a0a0a]">Debatid sobre los siguientes temas y seleccionad las {workshopConfig.maxSelectionsPerPhase} tarjetas que creáis prioritarias desde el punto de vista de vuestro colectivo.</p>
      </div>
      <CategoryFilters config={workshopConfig} active={activeFilter} onChange={setActiveFilter} />
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <h2 className="text-xl font-black">No hay tarjetas para este filtro</h2>
              <p className="mt-2 text-slate-600">Prueba con «Todas» u otra categoría.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => (
                <CardTile
                  key={card.id}
                  config={workshopConfig}
                  card={card}
                  selected={selectedIds.includes(card.id)}
                  atLimit={atLimit}
                  onToggle={() => toggle(phaseId, card.id)}
                  detailHref={detailHref?.(card)}
                  onOpenDetail={() => onOpenDetail?.(card)}
                />
              ))}
            </div>
          )}
        </div>
        <SelectionTray config={workshopConfig} phaseId={phaseId} selectedIds={selectedIds} unlimited={scope === "facilitator"} sessionId={sessionId} collectiveId={collectiveId} selectionAlreadySent={isSelectionSent(phase.id, selectedIds)} onSent={() => { window.location.assign(nextPhase ? `/team/phase/${nextPhase.id}` : "/team"); }} onRemove={(cardId) => toggle(phaseId, cardId)} />
      </div>
    </section>
  );
}
