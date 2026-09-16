"use client";

import Link from "next/link";
import { use } from "react";

import { activeCardsByPhaseId, content, phaseById } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";
import { PhaseId } from "@/types/workshop";

type PhasePageProps = {
  params: Promise<{ groupId: string; phaseId: string }>;
};

const validPhaseIds: PhaseId[] = [
  "justicia-actual",
  "justicia-conectada",
  "justicia-inteligente",
];
const EMPTY_SELECTIONS: string[] = [];

function isPhaseId(value: string): value is PhaseId {
  return validPhaseIds.includes(value as PhaseId);
}

export default function PhasePage({ params }: PhasePageProps) {
  const resolved = use(params);
  const groupId = decodeURIComponent(resolved.groupId).toUpperCase();
  const phaseParam = decodeURIComponent(resolved.phaseId);
  const phaseId = isPhaseId(phaseParam) ? phaseParam : null;

  const selectedIds = useWorkshopStore((state) => {
    if (!phaseId) {
      return EMPTY_SELECTIONS;
    }

    return state.groups[groupId]?.selectionsByPhase[phaseId] ?? EMPTY_SELECTIONS;
  });
  const toggle = useWorkshopStore((state) => state.toggleGroupCard);

  if (!phaseId) {
    return (
      <main className="page-shell">
        <section className="card-panel">
          <h1 className="text-2xl font-semibold text-slate-900">Fase no valida</h1>
          <Link className="secondary-button mt-4 inline-flex" href={`/grupo/${encodeURIComponent(groupId)}`}>
            Volver al tablero
          </Link>
        </section>
      </main>
    );
  }

  const phase = phaseById[phaseId];
  const cards = activeCardsByPhaseId[phaseId];

  return (
    <main className="page-shell">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Equipo {groupId}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{phase.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{phase.description}</p>
        </div>
        <span className="status-pill">{selectedIds.length}/{content.maxSelectionsPerPhase}</span>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const selected = selectedIds.includes(card.id);

          return (
            <article key={card.id} className="card-panel">
              <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.challenge}</p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  className={selected ? "secondary-button" : "primary-button"}
                  onClick={() => toggle(groupId, phase.id, card.id)}
                  type="button"
                >
                  {selected ? "Retirar" : "Seleccionar"}
                </button>
                <Link
                  className="secondary-button"
                  href={`/grupo/${encodeURIComponent(groupId)}/fase/${phase.id}/tarjeta/${card.id}`}
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="card-panel mt-6">
        <p className="text-sm text-slate-700">
          Selecciones actuales: {selectedIds.length}. Podeis cambiar tarjetas en cualquier momento.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedIds.length === 0 && <span className="text-sm text-slate-500">Sin tarjetas seleccionadas.</span>}
          {selectedIds.map((cardId) => {
            const label = cards.find((card) => card.id === cardId)?.title ?? cardId;
            return (
              <span key={cardId} className="status-pill">
                {label}
              </span>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="secondary-button" href={`/grupo/${encodeURIComponent(groupId)}`}>
            Volver al tablero
          </Link>
          <Link className="primary-button" href={`/grupo/${encodeURIComponent(groupId)}/justicia-2030`}>
            Ir a Justicia 2030
          </Link>
        </div>
      </footer>
    </main>
  );
}
