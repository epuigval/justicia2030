"use client";

import Link from "next/link";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { getCategory, getPhase } from "@/domain/catalog";
import type { WorkshopCard } from "@/domain/types";

export function CardDetail({ card, backHref, onBack }: { card: WorkshopCard; backHref?: string; onBack?: () => void }) {
  const { scope, selectionsByPhase, toggle, isSelectionSent } = useWorkshop();
  const selectedIds = selectionsByPhase[card.phaseId] ?? [];
  const selected = selectedIds.includes(card.id);
  const disabled = scope === "team" && !selected && selectedIds.length >= workshopConfig.maxSelectionsPerPhase;
  const selectionSent = isSelectionSent(card.phaseId);
  const phase = getPhase(workshopConfig, card.phaseId);
  const category = getCategory(workshopConfig, card.categoryId);

  return (
    <article className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <p className="font-semibold text-blue-700">Fase {phase?.order}: {phase?.name} · Categoría: {category?.name}</p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="max-w-3xl text-3xl font-bold text-blue-950 sm:text-4xl">{card.title}</h1>
        {selected ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-4 py-2 text-sm font-medium leading-5 text-[#157f00]"><img src="/icons/check.svg" alt="" className="size-5" />Seleccionada</span> : <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">No seleccionada</span>}
      </div>
      <p className="mt-4 text-lg leading-8 text-slate-650">{card.shortDescription}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-orange-50 p-5"><h2 className="text-lg font-bold text-orange-900">El reto</h2><p className="mt-2 leading-7">{card.challenge}</p></section>
        <section className="rounded-2xl bg-blue-50 p-5"><h2 className="text-lg font-bold text-blue-950">La solución</h2><p className="mt-2 leading-7">{card.solution}</p></section>
        <section className="rounded-2xl bg-emerald-50 p-5"><h2 className="text-lg font-bold text-emerald-950">Beneficios</h2><ul className="mt-2 list-disc space-y-2 pl-5">{card.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></section>
        <section className="rounded-2xl bg-violet-50 p-5"><h2 className="text-lg font-bold text-violet-950">Para el debate</h2><p className="mt-2 leading-7">{card.debateQuestion}</p></section>
      </div>
      {disabled && !selectionSent ? <p className="mt-6 rounded-xl bg-amber-50 p-4 font-semibold text-amber-900">Máximo {workshopConfig.maxSelectionsPerPhase} tarjetas. Quita una selección para elegir otra.</p> : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {backHref ? <Link href={backHref} className="flex min-h-11 items-center rounded-lg border border-blue-700 px-5 font-semibold text-blue-800 focus-visible:outline-3">Volver a la fase</Link> : <button type="button" onClick={onBack} className="min-h-11 rounded-lg border border-blue-700 px-5 font-semibold text-blue-800 focus-visible:outline-3">Volver a las tarjetas</button>}
        {!selectionSent ? <button type="button" disabled={disabled} onClick={() => toggle(card.phaseId, card.id)} className="min-h-11 rounded-lg bg-blue-700 px-5 font-semibold text-white focus-visible:outline-3 disabled:bg-slate-300 disabled:text-slate-600">{selected ? "Quitar selección" : "Seleccionar tarjeta"}</button> : null}
      </div>
    </article>
  );
}
