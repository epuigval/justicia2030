"use client";

import Link from "next/link";
import { use } from "react";

import { content } from "@/data/content";
import { EMPTY_GROUP_PROGRESS, useWorkshopStore } from "@/store/workshop-store";

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

export default function GroupPage({ params }: GroupPageProps) {
  const groupId = decodeURIComponent(use(params).groupId).toLowerCase();
  const group = useWorkshopStore((state) => state.groups[groupId]);
  const progress = group ?? EMPTY_GROUP_PROGRESS;
  const resetGroup = useWorkshopStore((state) => state.resetGroup);

  function resetSession() {
    if (window.confirm("Se borraran todas las elecciones de esta sesion. Deseas continuar?")) {
      resetGroup(groupId);
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Tablero del equipo</p>
        <h1>{content.appTitle}</h1>
        <p>{content.appSubtitle}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {content.phases.map((phase) => {
          const selected = progress.selectionsByPhase[phase.id].length;

          return (
            <article key={phase.id} className="card-panel">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{phase.title}</h2>
                <span className="status-pill">{selected}/{content.maxSelectionsPerPhase}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{phase.description}</p>

              <ul className="mt-4 space-y-1 text-sm text-slate-700">
                {progress.selectionsByPhase[phase.id].length === 0 && (
                  <li>Aun no hay tarjetas seleccionadas.</li>
                )}
                {progress.selectionsByPhase[phase.id].map((cardId) => {
                  const card = phase.cards.find((item) => item.id === cardId);
                  return <li key={cardId}>• {card?.title ?? cardId}</li>;
                })}
              </ul>

              <Link className="primary-button mt-5 inline-flex" href={`/grupo/${encodeURIComponent(groupId)}/fase/${phase.id}`}>
                Explorar
              </Link>
            </article>
          );
        })}
      </section>

      <div className="card-panel mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-700">Cuando termineis las tres fases, cerrad con la vision compartida.</p>
        <Link className="secondary-button" href={`/grupo/${encodeURIComponent(groupId)}/justicia-2030`}>
          Ir a Justicia 2030
        </Link>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="danger-button" onClick={resetSession} type="button">
          Borrar elecciones y empezar de nuevo
        </button>
      </div>
    </main>
  );
}
