"use client";

import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { orderedPhases } from "@/domain/catalog";
import { generatePrompt } from "@/domain/prompt";
import { incompletePhaseIds } from "@/domain/selections";
import { ProgressSummary } from "./progress-summary";
import { PromptArea } from "./prompt-area";

export function Justicia2030() {
  const { selectionsByPhase } = useWorkshop();
  const prompt = generatePrompt(workshopConfig, selectionsByPhase);
  const incomplete = new Set(incompletePhaseIds(workshopConfig, selectionsByPhase));
  return (
    <section aria-labelledby="justicia-title">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-700">Resultado del workshop</p>
      <h1 id="justicia-title" className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Justicia 2030</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-650">Todas las tarjetas seleccionadas tienen el mismo peso. El prompt se genera localmente y no se envía a ningún servicio.</p>
      <div className="mt-7"><ProgressSummary id="justicia-progress" selections={selectionsByPhase} /></div>
      {!prompt ? (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-xl font-black text-amber-950">La visión todavía está incompleta</h2>
          <p className="mt-2 text-amber-900">Se necesitan exactamente {workshopConfig.maxSelectionsPerPhase} selecciones en cada fase.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-amber-950">{orderedPhases(workshopConfig).filter((phase) => incomplete.has(phase.id)).map((phase) => <li key={phase.id}>{phase.name}: {(selectionsByPhase[phase.id] ?? []).length}/{workshopConfig.maxSelectionsPerPhase}</li>)}</ul>
        </div>
      ) : <p className="mt-6 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-950">Las fases están completas. El prompt se ha generado automáticamente.</p>}
      <PromptArea prompt={prompt} />
    </section>
  );
}
