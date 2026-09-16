"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { filterCards, getPhase } from "@/domain/catalog";
import type { CategoryId, WorkshopCard } from "@/domain/types";
import { CardTile } from "./card-tile";
import { CategoryFilters } from "./category-filters";
import { SelectionTray } from "./selection-tray";

export function PhaseExplorer({ phaseId, detailHref, onOpenDetail }: {
  phaseId: string;
  detailHref?: (card: WorkshopCard) => string;
  onOpenDetail?: (card: WorkshopCard) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");
  const { selectionsByPhase, toggle } = useWorkshop();
  const phase = getPhase(workshopConfig, phaseId);
  if (!phase) return null;
  const selectedIds = selectionsByPhase[phaseId] ?? [];
  const cards = filterCards(workshopConfig, phaseId, activeFilter);
  const atLimit = selectedIds.length >= workshopConfig.maxSelectionsPerPhase;

  return (
    <section aria-labelledby={`phase-${phaseId}`}>
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Exploración de fase</p>
        <h1 id={`phase-${phaseId}`} className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">{phase.name}</h1>
        <p className="mt-2 max-w-3xl text-lg leading-8 text-slate-650">{phase.description}</p>
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
        <SelectionTray config={workshopConfig} phaseId={phaseId} selectedIds={selectedIds} onRemove={(cardId) => toggle(phaseId, cardId)} />
      </div>
    </section>
  );
}
