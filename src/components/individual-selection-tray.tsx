import Image from "next/image";
import { getCard, getCategory } from "@/domain/catalog";
import type { IndividualPhaseId } from "@/domain/individual-participation";
import { workshopConfig } from "@/config/workshop";

const categoryStyles: Record<string, string> = {
  personas: "bg-[#e0e0ff]",
  procesos: "bg-[#f8e1b7]",
  tecnologia: "bg-[#c6d7fa]",
  gobernanza: "bg-[#cbe2e5]",
};

export function IndividualSelectionTray({ phaseId, selectedIds, nextLabel, onRemove, onContinue }: {
  phaseId: IndividualPhaseId;
  selectedIds: string[];
  nextLabel: string;
  onRemove: (cardId: string) => void;
  onContinue: () => void;
}) {
  const complete = selectedIds.length === 3;

  return (
    <aside className="rounded-2xl border border-[#d0e2ff] bg-[#f0f6ff] p-5 lg:sticky lg:top-5" aria-label="Tu selección de la fase">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-lg bg-[#114dcd]"><Image src="/icons/assignment_turned_in.svg" alt="" width={14} height={14} /></span>
        <h2 className="text-base font-bold text-[#0a0a0a]">Tu selección</h2>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#1d4ed8]">{selectedIds.length}/3 tarjetas</p>

      {selectedIds.length === 0 ? <p className="mt-5 text-xs leading-5 text-[#565656]">Aún no has seleccionado ninguna tarjeta.</p> : (
        <ul className="mt-5 space-y-3">
          {selectedIds.map((id) => {
            const card = getCard(workshopConfig, id);
            const category = card ? getCategory(workshopConfig, card.categoryId) : null;
            if (!card || card.phaseId !== phaseId) return null;
            return (
              <li key={id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] ${categoryStyles[card.categoryId]}`}>{category?.name}</span>
                  <button type="button" aria-label={`Quitar ${card.title}`} onClick={() => onRemove(id)} className="flex size-7 items-center justify-center rounded-md focus-visible:outline-3"><Image src="/icons/delete.svg" alt="" width={20} height={20} /></button>
                </div>
                <p className="mt-2 text-xs font-bold leading-4 text-[#0a0a0a]">{card.title}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-5 border-t border-[#d0e2ff] pt-5">
        <button type="button" disabled={!complete} onClick={onContinue} className="min-h-11 w-full rounded-lg bg-[#114dcd] px-4 text-sm font-semibold text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-[#d2d2d2] disabled:text-[#565656]">{nextLabel}</button>
        <p className="mt-3 text-center text-xs text-[#565656]">Necesitas 3/3 tarjetas para avanzar.</p>
      </div>
    </aside>
  );
}
