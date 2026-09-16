"use client";

import { useState } from "react";

export function ResetConfirm({ triggerLabel, message, confirmLabel, onConfirm }: { triggerLabel: string; message: string; confirmLabel: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-lg border border-red-300 bg-white px-4 font-bold text-red-800 focus-visible:outline-3">{triggerLabel}</button>;
  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 shadow-sm">
      <h2 id="reset-title" className="text-lg font-black text-red-950">Confirmar reinicio</h2>
      <p id="reset-description" className="mt-2 max-w-2xl leading-7 text-red-950">{message}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" autoFocus onClick={() => setOpen(false)} className="min-h-11 rounded-lg border border-slate-400 bg-white px-4 font-bold focus-visible:outline-3">Cancelar</button>
        <button type="button" onClick={() => { onConfirm(); setOpen(false); }} className="min-h-11 rounded-lg bg-red-700 px-4 font-bold text-white focus-visible:outline-3">{confirmLabel}</button>
      </div>
    </div>
  );
}
