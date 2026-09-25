"use client";

import type { WorkshopPhase } from "@/domain/types";

export function PhaseSubmissionModal({ phase, workshopComplete, onContinue }: { phase: WorkshopPhase; workshopComplete: boolean; onContinue: () => void }) {
  const title = workshopComplete ? "¡Enhorabuena! Ya habéis completado todas las fases." : `¡Fase ${phase.order} enviada correctamente!`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="phase-submission-title" className="relative w-full max-w-[430px] rounded-[20px] bg-white px-8 py-10 text-center shadow-2xl">
        {workshopComplete ? <button type="button" aria-label="Cerrar" onClick={onContinue} className="absolute right-5 top-4 text-xl leading-none text-[#0a0a0a] focus-visible:outline-3">×</button> : null}
        <div aria-hidden="true" className={`mx-auto flex size-14 items-center justify-center rounded-full ${workshopComplete ? "border-[5px] border-[#00a125] text-3xl text-[#00a125]" : "bg-[#114dcd]"}`}>{workshopComplete ? "✓" : <img src="/icons/assignment_turned_in.svg" alt="" className="size-8" />}</div>
        <h2 id="phase-submission-title" className="mx-auto mt-5 max-w-[300px] text-base font-bold leading-5 text-[#0a0a0a]">{title}</h2>
        <button type="button" onClick={onContinue} className="mt-6 h-8 rounded-lg bg-[#114dcd] px-8 text-xs font-medium text-white focus-visible:outline-3">{workshopComplete ? "Aceptar" : "Continuar"}</button>
      </section>
    </div>
  );
}