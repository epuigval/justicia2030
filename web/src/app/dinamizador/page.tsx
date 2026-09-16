"use client";

import { useState } from "react";

import { categoryById, content } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";

export default function FacilitatorPage() {
  const [categoryId, setCategoryId] = useState("all");
  const facilitatorSelections = useWorkshopStore((state) => state.facilitatorSelections);
  const toggleFacilitatorCard = useWorkshopStore((state) => state.toggleFacilitatorCard);
  const resetFacilitator = useWorkshopStore((state) => state.resetFacilitator);

  function resetSession() {
    if (window.confirm("Se borrara el consenso guardado por el dinamizador. Deseas continuar?")) {
      resetFacilitator();
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Pantalla global</p>
        <h1>Dinamizador</h1>
        <p>Seleccion manual de prioridades consensuadas por fase. Sin calculo automatico.</p>
      </header>

      <nav className="category-filter mt-6" aria-label="Filtrar tarjetas por categoria">
        <button className={categoryId === "all" ? "filter-button is-active" : "filter-button"} onClick={() => setCategoryId("all")} type="button">
          Todas
        </button>
        {content.categories.map((category) => (
          <button key={category.id} className={categoryId === category.id ? "filter-button is-active" : "filter-button"} onClick={() => setCategoryId(category.id)} type="button">
            {category.label}
          </button>
        ))}
      </nav>

      <section className="mt-4 grid gap-4">
        {content.phases.map((phase) => {
          const selected = facilitatorSelections[phase.id];

          return (
            <article key={phase.id} className="card-panel">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{phase.title}</h2>
                <span className="status-pill">{selected.length}/{content.maxSelectionsPerPhase}</span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{phase.description}</p>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {phase.cards.filter((card) => card.active && (categoryId === "all" || card.categoryId === categoryId)).map((card) => {
                  const isSelected = selected.includes(card.id);
                  const disabled = selected.length === content.maxSelectionsPerPhase && !isSelected;

                  return (
                    <button
                      key={card.id}
                      className={isSelected ? "selection-chip is-selected" : "selection-chip"}
                      disabled={disabled}
                      onClick={() => toggleFacilitatorCard(phase.id, card.id)}
                      type="button"
                    >
                      <span className="category-label">{categoryById[card.categoryId].label}</span>
                      {card.title}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <div className="mt-4 flex justify-end">
        <button className="danger-button" onClick={resetSession} type="button">
          Borrar consenso y empezar de nuevo
        </button>
      </div>
    </main>
  );
}
