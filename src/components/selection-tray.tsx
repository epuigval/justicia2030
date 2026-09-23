import { getCard, getCategory } from "@/domain/catalog";
import type { CardId, PhaseId, WorkshopConfig } from "@/domain/types";
import { PhaseResultSender } from "./phase-result-sender";

const categoryStyles = {
  personas: "bg-[#e0e0ff]",
  procesos: "bg-[#f8e1b7]",
  tecnologia: "bg-[#c6d7fa]",
  gobernanza: "bg-[#cbe2e5]",
} as const;

export function SelectionTray({ config, phaseId, selectedIds, unlimited = false, sessionId, collectiveId, selectionAlreadySent, onSent, onRemove }: { config: WorkshopConfig; phaseId: PhaseId; selectedIds: CardId[]; unlimited?: boolean; sessionId?: string; collectiveId?: string | null; selectionAlreadySent?: boolean; onSent?: () => void; onRemove: (cardId: CardId) => void }) {
  const complete = selectedIds.length === config.maxSelectionsPerPhase;
  const isEmpty = selectedIds.length === 0;
  return (
    <aside className={`rounded-2xl border ${isEmpty ? "border-[#c6d7fa] bg-[#edf2fe] p-6" : "flex flex-col gap-5 border-[#d0e2ff] bg-[#f0f6ff] p-[21px]"} lg:sticky lg:top-5`} aria-label="Selecciones de la fase">
      {isEmpty ? <><div className="flex flex-col gap-2"><h2 className="text-base font-bold leading-6 text-[#0a0a0a]">Vuestra selección</h2><p className="text-xs font-semibold leading-4 text-[#1d4ed8]">0/{config.maxSelectionsPerPhase} tarjetas</p></div><p className="mt-3 pt-3 text-xs leading-[19.5px] text-[#565656]">Aún no has seleccionado ninguna tarjeta.</p></> : <><div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex h-7 w-[27px] shrink-0 items-center justify-center rounded-lg bg-[#114dcd]"><img src="/icons/assignment_turned_in.svg" alt="" className="size-[14px]" /></span>
        <h2 className="text-base font-bold leading-6 text-[#0a0a0a]">Vuestra selección</h2>
      </div>
      <p className="-mt-2 text-xs font-semibold leading-4 text-[#1d4ed8]">{selectedIds.length}{unlimited ? "" : `/${config.maxSelectionsPerPhase}`} tarjetas</p>
      {(
        <ul className="space-y-3">
          {selectedIds.map((id) => {
            const card = getCard(config, id);
            const category = card ? getCategory(config, card.categoryId) : undefined;
            if (!card || card.phaseId !== phaseId) return null;
            return (
              <li key={id} className="flex flex-col gap-[5px] rounded-xl border border-[rgba(226,232,240,0.9)] bg-white p-[15px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                <div className="flex items-start justify-between"><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase leading-[15px] tracking-[0.5px] text-[#0a0a0a] ${categoryStyles[card.categoryId]}`}>{category?.name}</span><button type="button" aria-label={`Quitar ${card.title}`} className="flex size-7 shrink-0 items-center justify-center rounded-md p-1 focus-visible:outline-3" onClick={() => onRemove(id)}><img src="/icons/delete.svg" alt="" className="size-5" /></button></div>
                <p className="text-xs font-bold leading-[16.5px] text-[#0a0a0a]">{card.title}</p>
              </li>
            );
          })}
        </ul>
      )}
      {!unlimited && sessionId && collectiveId ? <div className="border-t border-[rgba(208,226,255,0.8)] pt-[17px]"><PhaseResultSender sessionId={sessionId} phaseId={phaseId} collectiveId={collectiveId} selectedCardIds={selectedIds} selectionAlreadySent={selectionAlreadySent} onSent={onSent} buttonLabel="Enviar y continuar" disabled={!complete} renderWhenIncomplete /><p className="mt-3 text-center text-xs font-medium leading-[16.5px] text-[#565656]">Se enviará vuestra selección y pasaréis a la siguiente fase.</p></div> : null}</>}
    </aside>
  );
}
