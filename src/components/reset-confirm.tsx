"use client";

import { useState } from "react";

export function ResetConfirm({ triggerLabel, message, confirmLabel, onConfirm, triggerClassName, title = "Confirmar reinicio", modal = false }: { triggerLabel: string; message: string; confirmLabel: string; onConfirm: () => void; triggerClassName?: string; title?: string; modal?: boolean }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className={triggerClassName ?? "min-h-11 rounded-lg border border-red-300 bg-white px-4 font-bold text-red-800 focus-visible:outline-3"}>{triggerLabel}</button>;
  if (modal) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="relative w-full max-w-[1216px] rounded-[20px] bg-white px-12 pb-8 pt-16 shadow-2xl">
        <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)} className="absolute right-12 top-8 text-3xl leading-none text-[#0a0a0a] focus-visible:outline-3">×</button>
        <div className="flex items-center gap-3"><img src="/icons/error.svg" alt="" className="size-6" /><h2 id="reset-title" className="text-xl font-bold leading-7 text-[#0a0a0a]">{title}</h2></div>
        <p id="reset-description" className="mt-3 max-w-[900px] text-lg leading-[25px] text-[#373737]">{message}</p>
        <div className="mt-10 flex flex-col justify-end gap-5 sm:flex-row">
          <button type="button" autoFocus onClick={() => setOpen(false)} className="h-[52px] w-full rounded-lg border border-[#114dcd] bg-white px-4 text-lg font-medium text-[#114dcd] focus-visible:outline-3 sm:w-[238px]">Cancelar</button>
          <button type="button" onClick={() => { onConfirm(); setOpen(false); }} className="h-[52px] w-full rounded-lg bg-[#114dcd] px-4 text-lg font-medium text-white focus-visible:outline-3 sm:w-[238px]">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-sm">
      <h2 id="reset-title" className="text-lg font-black text-red-950">{title}</h2>
      <p id="reset-description" className="mt-2 max-w-2xl leading-7 text-red-950">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" autoFocus onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-slate-400 bg-white px-4 font-bold focus-visible:outline-3">Cancelar</button>
        <button type="button" onClick={() => { onConfirm(); setOpen(false); }} className="min-h-11 rounded-lg bg-red-700 px-4 font-bold text-white focus-visible:outline-3">{confirmLabel}</button>
      </div>
    </div>
  );
}
