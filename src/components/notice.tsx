"use client";

import { useWorkshop } from "@/context/workshop-context";

export function StorageNotice() {
  const { storageNotice, dismissNotice } = useWorkshop();
  if (!storageNotice) return null;
  return (
    <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status" aria-live="polite">
      <p>{storageNotice}</p>
      <button type="button" className="min-h-11 rounded-lg px-3 font-bold underline focus-visible:outline-3" onClick={dismissNotice}>Cerrar</button>
    </div>
  );
}
