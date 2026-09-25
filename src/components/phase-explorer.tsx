"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { filterCards, getPhase, orderedPhases } from "@/domain/catalog";
import type { CategoryId, WorkshopCard } from "@/domain/types";
import { CardTile } from "./card-tile";
import { CategoryFilters } from "./category-filters";
import { SelectionTray } from "./selection-tray";
import { PhaseSubmissionModal } from "./phase-submission-modal";

const accentStyles = {
  orange: "border-[#e26600] bg-[rgba(226,102,0,0.10)]",
  green: "border-[#10b981] bg-[rgba(16,185,129,0.10)]",
  blue: "border-[#114dcd] bg-[rgba(17,77,205,0.10)]",
  violet: "border-[#072056] bg-[rgba(7,32,86,0.10)]",
} as const;

export function PhaseExplorer({ phaseId, detailHref, onOpenDetail, onPreviousPhase, onNextPhase }: {
  phaseId: string;
  detailHref?: (card: WorkshopCard) => string;
  onOpenDetail?: (card: WorkshopCard) => void;
  onPreviousPhase?: () => void;
  onNextPhase?: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState<CategoryId | "all">("all");
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const { scope, sessionId, collectiveId, sentPhaseIds, selectionsByPhase, toggle, isSelectionSent, markSelectionSent } = useWorkshop();
  const phase = getPhase(workshopConfig, phaseId);
  if (!phase) return null;
  const currentPhase = phase;
  const selectedIds = selectionsByPhase[phaseId] ?? [];
  const cards = filterCards(workshopConfig, phaseId, activeFilter);
  const atLimit = scope === "team" && selectedIds.length >= workshopConfig.maxSelectionsPerPhase;
  const nextPhase = orderedPhases(workshopConfig)[currentPhase.order];
  const phaseSent = isSelectionSent(currentPhase.id);
  const workshopComplete = orderedPhases(workshopConfig).every((candidate) => candidate.id === currentPhase.id || sentPhaseIds.includes(candidate.id));

  function handleSent() {
    markSelectionSent(currentPhase.id);
    setShowSubmissionModal(true);
  }

  function continueAfterSubmission() {
    window.location.assign(workshopComplete ? "/team" : `/team/phase/${nextPhase?.id ?? currentPhase.id}`);
  }

  return (
    <section aria-labelledby={`phase-${phaseId}`}>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Selección de temas</p>
        <h1 id={`phase-${phaseId}`} className={`mt-3 flex h-[62px] items-center rounded-xl border-l-4 pl-4 text-[32px] font-bold leading-9 tracking-[-0.8px] text-[#0a0a0a] ${accentStyles[currentPhase.accent]}`}>FASE {currentPhase.order} - {currentPhase.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[#0a0a0a]">Debatid sobre los siguientes temas y seleccionad las {scope === "facilitator" ? "tarjetas" : `${workshopConfig.maxSelectionsPerPhase} tarjetas`} que creáis prioritarias desde el punto de vista de vuestro colectivo.</p>
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
                  readOnly={phaseSent}
                  onToggle={() => toggle(phaseId, card.id)}
                  detailHref={detailHref?.(card)}
                  onOpenDetail={() => onOpenDetail?.(card)}
                />
              ))}
            </div>
          )}
        </div>
        <SelectionTray config={workshopConfig} phaseId={phaseId} selectedIds={selectedIds} unlimited={scope === "facilitator"} sessionId={sessionId} collectiveId={collectiveId} selectionAlreadySent={phaseSent} onSent={handleSent} onPreviousPhase={scope === "facilitator" && currentPhase.order > 1 ? onPreviousPhase : undefined} onNextPhase={scope === "facilitator" && nextPhase ? onNextPhase : undefined} onRemove={(cardId) => toggle(phaseId, cardId)} />
      </div>
      {showSubmissionModal ? <PhaseSubmissionModal phase={phase} workshopComplete={workshopComplete} onContinue={continueAfterSubmission} /> : null}
    </section>
  );
}
