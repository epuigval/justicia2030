"use client";

import { useEffect, useRef } from "react";
import type { WorkshopCard } from "@/domain/types";
import { CardDetail } from "./card-detail";

export function CardDetailModal({ card, onClose }: { card: WorkshopCard; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label={`Detalle de ${card.title}`} className="relative max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Cerrar detalle" title="Cerrar" className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-slate-300 bg-white text-2xl font-bold text-slate-700 focus-visible:outline-3 focus-visible:outline-blue-600">×</button>
        <CardDetail card={card} onBack={onClose} />
      </div>
    </div>
  );
}