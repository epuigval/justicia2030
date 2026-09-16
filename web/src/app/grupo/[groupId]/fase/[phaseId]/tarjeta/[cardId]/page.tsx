"use client";

import Link from "next/link";
import { use } from "react";

import { categoryById, phaseById, content } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";

type CardDetailPageProps = {
  params: Promise<{ groupId: string; phaseId: string; cardId: string }>;
};

function isPhaseId(value: string): boolean {
  return content.phases.some((phase) => phase.id === value);
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  const resolved = use(params);
  const groupId = decodeURIComponent(resolved.groupId).toLowerCase();
  const phaseParam = decodeURIComponent(resolved.phaseId);
  const cardId = decodeURIComponent(resolved.cardId);
  const phaseId = isPhaseId(phaseParam) ? phaseParam : null;

  const selected = useWorkshopStore((state) => {
    if (!phaseId) {
      return false;
    }

    return state.groups[groupId]?.selectionsByPhase[phaseId].includes(cardId) ?? false;
  });
  const selectedCount = useWorkshopStore((state) =>
    phaseId ? state.groups[groupId]?.selectionsByPhase[phaseId].length ?? 0 : 0,
  );
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
  const card = phase.cards.find((item) => item.id === cardId);

  if (!card) {
    return (
      <main className="page-shell">
        <section className="card-panel">
          <h1 className="text-2xl font-semibold text-slate-900">Tarjeta no encontrada</h1>
          <Link
            className="secondary-button mt-4 inline-flex"
            href={`/grupo/${encodeURIComponent(groupId)}/fase/${phaseId}`}
          >
            Volver a exploracion
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <article className="card-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">{phase.title}</p>
          <span className="category-label">{categoryById[card.categoryId].label}</span>
        </div>

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{card.title}</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <section className="soft-block">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">El reto</h2>
            <p className="mt-2 text-sm text-slate-700">{card.challenge}</p>
          </section>
          <section className="soft-block">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">La solucion</h2>
            <p className="mt-2 text-sm text-slate-700">{card.solution}</p>
          </section>
          <section className="soft-block">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Beneficios</h2>
            <ul className="mt-2 list-disc pl-4 text-sm text-slate-700">
              {card.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue-700">Para el debate</h2>
          <p className="mt-2 text-sm text-blue-900">{card.debateQuestion}</p>
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            className={selected ? "secondary-button" : "primary-button"}
            disabled={!selected && selectedCount === content.maxSelectionsPerPhase}
            onClick={() => toggle(groupId, phase.id, card.id)}
            type="button"
          >
            {selected ? "Retirar tarjeta" : "Seleccionar tarjeta"}
          </button>
          <Link
            className="secondary-button"
            href={`/grupo/${encodeURIComponent(groupId)}/fase/${phase.id}`}
          >
            Volver a exploracion
          </Link>
        </div>
        {!selected && selectedCount === content.maxSelectionsPerPhase && (
          <p className="selection-notice mt-4" role="status">
            Ya habeis seleccionado 3 tarjetas. Retirad una antes de elegir esta.
          </p>
        )}
      </article>
    </main>
  );
}
