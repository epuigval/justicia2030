"use client";

import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { getCard, orderedPhases } from "@/domain/catalog";
import { incompletePhaseIds, isComplete } from "@/domain/selections";
import { ProgressSummary } from "./progress-summary";

export function Justicia2030() {
  const { scope, selectionsByPhase } = useWorkshop();
  const complete = isComplete(workshopConfig, selectionsByPhase);
  const incomplete = new Set(incompletePhaseIds(workshopConfig, selectionsByPhase));
  if (scope === "facilitator") return (
    <section aria-labelledby="justicia-title">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-700">Resultado del workshop</p>
      <h1 id="justicia-title" className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Justicia 2030</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-650">Resumen de las tarjetas seleccionadas por el dinamizador durante la sesión.</p>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{orderedPhases(workshopConfig).map((phase) => <section key={phase.id} className="border-t-4 border-blue-700 bg-white p-5 shadow-sm"><h2 className="text-xl font-black text-blue-950">{phase.name}</h2><ul className="mt-3 space-y-2">{(selectionsByPhase[phase.id] ?? []).map((id) => <li key={id} className="text-slate-700">{getCard(workshopConfig, id)?.title}</li>)}</ul>{(selectionsByPhase[phase.id] ?? []).length === 0 ? <p className="mt-3 text-slate-500">Sin tarjetas seleccionadas.</p> : null}</section>)}</div>
    </section>
  );
  return (
    <section aria-labelledby="justicia-title">
      <p className="text-sm font-black uppercase tracking-[0.16em] text-violet-700">Resultado del workshop</p>
      <h1 id="justicia-title" className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Justicia 2030</h1>
      <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-650">Todas las tarjetas seleccionadas tienen el mismo peso. Cada fase se envía por separado desde el resumen al completar tres tarjetas; no existe un correo final adicional.</p>
      <div className="mt-7"><ProgressSummary id="justicia-progress" selections={selectionsByPhase} /></div>
      {!complete ? (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-xl font-black text-amber-950">La visión todavía está incompleta</h2>
          <p className="mt-2 text-amber-900">Se necesitan exactamente {workshopConfig.maxSelectionsPerPhase} selecciones en cada fase.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-amber-950">{orderedPhases(workshopConfig).filter((phase) => incomplete.has(phase.id)).map((phase) => <li key={phase.id}>{phase.name}: {(selectionsByPhase[phase.id] ?? []).length}/{workshopConfig.maxSelectionsPerPhase}</li>)}</ul>
        </div>
      ) : <p className="mt-6 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-950">Las fases están completas. Puedes revisar o modificar cualquier selección y enviar cada fase desde el resumen.</p>}
    </section>
  );
}
