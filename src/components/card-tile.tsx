import Link from "next/link";
import { getCategory } from "@/domain/catalog";
import type { WorkshopCard, WorkshopConfig } from "@/domain/types";

export function CardTile({ config, card, selected, atLimit, onToggle, detailHref, onOpenDetail }: {
  config: WorkshopConfig;
  card: WorkshopCard;
  selected: boolean;
  atLimit: boolean;
  onToggle: () => void;
  detailHref?: string;
  onOpenDetail?: () => void;
}) {
  const disabled = atLimit && !selected;
  const category = getCategory(config, card.categoryId);
  const buttonLabel = selected ? "Quitar selección" : "Seleccionar tarjeta";
  return (
    <article className={`flex h-full flex-col rounded-2xl border-2 bg-white p-5 shadow-sm ${selected ? "border-blue-700 ring-2 ring-blue-100" : "border-slate-200"}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">{category?.name}</span>
        <span className={`text-sm font-bold ${selected ? "text-blue-800" : "text-slate-500"}`}>{selected ? "✓ Seleccionada" : "No seleccionada"}</span>
      </div>
      <h3 className="text-xl font-black text-blue-950">{card.title}</h3>
      <p className="mt-3 flex-1 leading-7 text-slate-650">{card.shortDescription}</p>
      {disabled ? <p className="mt-3 text-sm font-semibold text-amber-800">Máximo {config.maxSelectionsPerPhase} tarjetas. Quita una selección para elegir otra.</p> : null}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {detailHref ? (
          <Link className="flex min-h-11 items-center justify-center rounded-lg border border-blue-700 px-3 text-center font-bold text-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600" href={detailHref}>Ver detalle</Link>
        ) : (
          <button type="button" className="min-h-11 rounded-lg border border-blue-700 px-3 font-bold text-blue-800 focus-visible:outline-3" onClick={onOpenDetail}>Ver detalle</button>
        )}
        <button type="button" disabled={disabled} onClick={onToggle} className="min-h-11 rounded-lg bg-blue-700 px-3 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}
