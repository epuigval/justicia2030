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
        <button ref={closeButton} type="button" onClick={onClose} aria-label="Cerrar detalle" title="Cerrar" className="absolute right-6 top-6 z-10 flex size-6 items-center justify-center focus-visible:outline-3 focus-visible:outline-blue-600"><img src="/icons/close.svg" alt="" className="size-6" /></button>
        <CardDetail card={card} onBack={onClose} />
      </div>
    </div>
  );
}