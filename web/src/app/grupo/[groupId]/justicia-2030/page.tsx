"use client";

import Link from "next/link";
import { use, useState } from "react";

import { categoryById, content } from "@/data/content";
import { EMPTY_GROUP_PROGRESS, useWorkshopStore } from "@/store/workshop-store";

type FinalPageProps = {
  params: Promise<{ groupId: string }>;
};

export default function FinalPage({ params }: FinalPageProps) {
  const groupId = decodeURIComponent(use(params).groupId).toLowerCase();
  const group = useWorkshopStore((state) => state.groups[groupId]);
  const progress = group ?? EMPTY_GROUP_PROGRESS;
  const [copied, setCopied] = useState(false);

  const completedPhases = content.phases.filter(
    (phase) =>
      progress.selectionsByPhase[phase.id].length === content.maxSelectionsPerPhase,
  ).length;
  const isComplete = completedPhases === content.phases.length;

  const promptSections = content.phases.map((phase) => {
    const selectedCards = progress.selectionsByPhase[phase.id]
      .map((cardId) => phase.cards.find((card) => card.id === cardId))
      .filter((card) => card !== undefined);

    return [
      `${phase.title}:`,
      ...selectedCards.map(
        (card) =>
          `- ${card.title} [${categoryById[card.categoryId].label}]: ${card.summary}`,
      ),
    ].join("\n");
  });
  const generatedPrompt = `${content.promptTemplate}\n\n${promptSections.join("\n\n")}`;

  async function copyPrompt() {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Etapa final</p>
        <h1>Justicia 2030</h1>
        <p>{content.finalIntroduction}</p>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Prompt Justicia 2030</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isComplete
                ? "Las nueve decisiones estan completas. Ya podeis copiar el prompt."
                : `Completad las tres fases para generar el prompt (${completedPhases}/${content.phases.length}).`}
            </p>
          </div>
          <span className="status-pill">
            {Object.values(progress.selectionsByPhase).flat().length}/
            {content.phases.length * content.maxSelectionsPerPhase}
          </span>
        </div>

        {isComplete && (
          <pre className="prompt-preview mt-4 whitespace-pre-wrap">{generatedPrompt}</pre>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link className="secondary-button" href={`/grupo/${encodeURIComponent(groupId)}`}>
            Volver al tablero
          </Link>
          <button
            className="primary-button"
            disabled={!isComplete}
            onClick={copyPrompt}
            type="button"
          >
            {copied ? "Prompt copiado" : "Copiar prompt"}
          </button>
        </div>
      </section>
    </main>
  );
}
