"use client";

import Link from "next/link";
import { use, useState } from "react";

import { activeCardsByPhaseId, categoryById, content, phaseById } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";

type PhasePageProps = {
  params: Promise<{ groupId: string; phaseId: string }>;
};

const EMPTY_SELECTIONS: string[] = [];

function isPhaseId(value: string): boolean {
  return content.phases.some((phase) => phase.id === value);
}

export default function PhasePage({ params }: PhasePageProps) {
  const resolved = use(params);
  const groupId = decodeURIComponent(resolved.groupId).toLowerCase();
  const phaseParam = decodeURIComponent(resolved.phaseId);
  const phaseId = isPhaseId(phaseParam) ? phaseParam : null;
  const [categoryId, setCategoryId] = useState<string>("all");

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
  const visibleCards = categoryId === "all"
    ? cards
    : cards.filter((item) => item.categoryId === categoryId);
  const selectionIsFull = selectedIds.length === content.maxSelectionsPerPhase;

  return (
    <main className="page-shell">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Exploracion de tarjetas</p>
          <h1 className="text-3xl font-semibold text-slate-900">{phase.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">{phase.description}</p>
        </div>
        <span className="status-pill">{selectedIds.length}/{content.maxSelectionsPerPhase}</span>
      </div>

      <nav className="category-filter mt-6" aria-label="Filtrar tarjetas por categoria">
        <button
          className={categoryId === "all" ? "filter-button is-active" : "filter-button"}
          onClick={() => setCategoryId("all")}
          type="button"
        >
          Todas
        </button>
        {content.categories.map((category) => (
          <button
            key={category.id}
            className={categoryId === category.id ? "filter-button is-active" : "filter-button"}
            onClick={() => setCategoryId(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </nav>

      {selectionIsFull && (
        <p className="selection-notice mt-4" role="status">
          Ya habeis seleccionado 3 tarjetas. Retirad una para elegir otra.
        </p>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((card) => {
          const selected = selectedIds.includes(card.id);
          const selectionDisabled = selectionIsFull && !selected;

          return (
            <article key={card.id} className="card-panel">
              <span className="category-label">{categoryById[card.categoryId].label}</span>
              <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{card.summary}</p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  className={selected ? "secondary-button" : "primary-button"}
                  disabled={selectionDisabled}
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
