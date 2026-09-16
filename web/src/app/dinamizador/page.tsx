"use client";

import { content } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";

export default function FacilitatorPage() {
  const facilitatorSelections = useWorkshopStore((state) => state.facilitatorSelections);
  const toggleFacilitatorCard = useWorkshopStore((state) => state.toggleFacilitatorCard);

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Pantalla global</p>
        <h1>Dinamizador</h1>
        <p>Seleccion manual de prioridades consensuadas por fase. Sin calculo automatico.</p>
      </header>

      <section className="grid gap-4">
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
                {phase.cards.filter((card) => card.active).map((card) => {
                  const isSelected = selected.includes(card.id);

                  return (
                    <button
                      key={card.id}
                      className={isSelected ? "selection-chip is-selected" : "selection-chip"}
                      onClick={() => toggleFacilitatorCard(phase.id, card.id)}
                      type="button"
                    >
                      {card.title}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
