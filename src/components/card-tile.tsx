import Link from "next/link";
import { getCategory } from "@/domain/catalog";
import type { WorkshopCard, WorkshopConfig } from "@/domain/types";

const categoryStyles: Record<string, string> = {
  personas: "bg-[#e0e0ff]",
  procesos: "bg-[#f8e1b7]",
  tecnologia: "bg-[#c6d7fa]",
  gobernanza: "bg-[#cbe2e5]",
} as const;

export function CardTile({ config, card, selected, atLimit, readOnly = false, onToggle, detailHref, onOpenDetail }: {
  config: WorkshopConfig;
  card: WorkshopCard;
  selected: boolean;
  atLimit: boolean;
  readOnly?: boolean;
  onToggle: () => void;
  detailHref?: string;
  onOpenDetail?: () => void;
}) {
  const disabled = readOnly || (atLimit && !selected);
  const category = getCategory(config, card.categoryId);
  const buttonLabel = selected ? "Quitar" : "Seleccionar";
  return (
    <article className={`flex min-h-[241px] h-full flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_1.5px_rgba(0,0,0,0.04)] ${selected ? "border-[#1d4ed8]" : "border-[#d2d2d2]"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[#0a0a0a] ${categoryStyles[card.categoryId]}`}>{category?.name}</span>
        {selected ? <span className="inline-flex items-center gap-1 text-[11px] font-medium leading-[16.5px] text-[#157f00]"><img src="/icons/check.svg" alt="" className="size-4" />Seleccionada</span> : null}
      </div>
      <h3 className="mt-4 text-sm font-bold leading-[19.25px] text-[#0a0a0a]">{card.title}</h3>
      <p className="mt-2.5 flex-1 text-xs leading-[19.5px] text-[#565656]">{card.shortDescription}</p>
      <div className={`mt-6 grid gap-3 ${readOnly ? "grid-cols-1" : "grid-cols-2"}`}>
        {detailHref ? (
          <Link className="flex h-8 items-center justify-center rounded-lg border border-[#114dcd] px-3 text-center text-xs font-medium text-[#114dcd] focus-visible:outline-3" href={detailHref}>Ver detalle</Link>
        ) : (
          <button type="button" className="h-8 rounded-lg border border-[#114dcd] px-3 text-xs font-medium text-[#114dcd] focus-visible:outline-3" onClick={onOpenDetail}>Ver detalle</button>
        )}
        {!readOnly ? <button type="button" disabled={disabled} onClick={onToggle} className={`h-8 rounded-lg px-3 text-xs font-medium focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-[#e6e6e6] disabled:text-[#0a0a0a] ${selected ? "border border-[#1d4ed8] bg-white text-[#1d4ed8]" : "bg-[#114dcd] text-white"}`}>
          {buttonLabel}
        </button> : null}
      </div>
    </article>
  );
}
