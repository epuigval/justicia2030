"use client";

import Link from "next/link";
import { use } from "react";

import { content } from "@/data/content";
import { EMPTY_GROUP_PROGRESS, useWorkshopStore } from "@/store/workshop-store";

type FinalPageProps = {
  params: Promise<{ groupId: string }>;
};

export default function FinalPage({ params }: FinalPageProps) {
  const groupId = decodeURIComponent(use(params).groupId).toUpperCase();
  const group = useWorkshopStore((state) => state.groups[groupId]);
  const progress = group ?? EMPTY_GROUP_PROGRESS;
  const setFinalReflection = useWorkshopStore((state) => state.setFinalReflection);
  const length = progress.finalReflection.length;

  const min = content.finalRecommendedLength.min;
  const max = content.finalRecommendedLength.max;
  const withinRange = length >= min && length <= max;

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Equipo {groupId}</p>
        <h1>Justicia 2030</h1>
        <p>{content.finalPrompt}</p>
      </header>

      <section className="card-panel">
        <h2 className="text-xl font-semibold text-slate-900">Resumen de tarjetas seleccionadas</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {content.phases.map((phase) => {
            const selected = progress.selectionsByPhase[phase.id];
            return (
              <article key={phase.id} className="soft-block">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{phase.title}</h3>
                <ul className="mt-2 list-disc pl-4 text-sm text-slate-700">
                  {selected.length === 0 && <li>Sin seleccion</li>}
                  {selected.map((cardId) => {
                    const card = phase.cards.find((item) => item.id === cardId);
                    return <li key={cardId}>{card?.title ?? cardId}</li>;
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card-panel mt-4">
        <label className="text-sm font-semibold uppercase tracking-wide text-slate-700" htmlFor="finalReflection">
          Frase consensuada
        </label>
        <textarea
          className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-800 outline-none ring-blue-300 transition focus:ring"
          id="finalReflection"
          maxLength={220}
          onChange={(event) => setFinalReflection(groupId, event.target.value)}
          placeholder="Escribid aqui vuestra vision compartida..."
          value={progress.finalReflection}
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className={withinRange ? "text-sm text-green-700" : "text-sm text-amber-700"}>
            Recomendado: {min}-{max} caracteres.
          </p>
          <span className="status-pill">{length} caracteres</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="secondary-button" href={`/grupo/${encodeURIComponent(groupId)}`}>
            Volver al tablero
          </Link>
          <button className="primary-button" type="button">
            Finalizar
          </button>
        </div>
      </section>
    </main>
  );
}
