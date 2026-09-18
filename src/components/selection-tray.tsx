import { getCard } from "@/domain/catalog";
import type { CardId, PhaseId, WorkshopConfig } from "@/domain/types";

export function SelectionTray({ config, phaseId, selectedIds, unlimited = false, onRemove }: { config: WorkshopConfig; phaseId: PhaseId; selectedIds: CardId[]; unlimited?: boolean; onRemove: (cardId: CardId) => void }) {
  return (
    <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 lg:sticky lg:top-5" aria-label="Selecciones de la fase">
      <h2 className="text-lg font-black text-blue-950">Tus selecciones</h2>
      <p className="mt-1 text-sm font-semibold text-blue-800">{selectedIds.length}{unlimited ? "" : `/${config.maxSelectionsPerPhase}`} tarjetas · mismo peso</p>
      {selectedIds.length === 0 ? <p className="mt-4 text-slate-600">Aún no has seleccionado ninguna tarjeta.</p> : (
        <ul className="mt-4 space-y-3">
          {selectedIds.map((id) => {
            const card = getCard(config, id);
            if (!card || card.phaseId !== phaseId) return null;
            return (
              <li key={id} className="rounded-xl bg-white p-3 shadow-sm">
                <p className="font-bold text-slate-900">{card.title}</p>
                <button type="button" className="mt-2 min-h-11 rounded-lg px-2 font-bold text-red-700 underline focus-visible:outline-3" onClick={() => onRemove(id)}>Quitar</button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
