"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { orderedPhases } from "@/domain/catalog";
import { LoadingState } from "./loading-state";
import { ProgressSummary } from "./progress-summary";
import { ResetConfirm } from "./reset-confirm";
import { StorageNotice } from "./notice";

export function TeamSummary() {
  const router = useRouter();
  const { hydrated, selectionsByPhase, reset } = useWorkshop();
  if (!hydrated) return <LoadingState />;
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <StorageNotice />
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Vista del equipo</p><h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Nuestro camino hacia Justicia 2030</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">Entra en cualquier fase, debate las propuestas y ajusta tus selecciones libremente.</p></div>
        <ResetConfirm triggerLabel="Comenzar nueva partida" message="Se eliminarán las selecciones del equipo guardadas en este navegador. No afectará al dinamizador ni a otros dispositivos. Esta acción no se puede deshacer." confirmLabel="Borrar y empezar" onConfirm={() => { reset(); router.push("/team"); }} />
      </div>
      <div className="mt-8"><ProgressSummary selections={selectionsByPhase} /></div>
      <section className="mt-8" aria-labelledby="phases-title">
        <h2 id="phases-title" className="text-2xl font-black text-blue-950">Fases del workshop</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orderedPhases(workshopConfig).map((phase) => {
            const count = (selectionsByPhase[phase.id] ?? []).length;
            return <article key={phase.id} className={`rounded-2xl border-2 bg-white p-6 shadow-sm accent-${phase.accent}`}><p className="text-sm font-black uppercase tracking-wide text-blue-700">Fase {phase.order}</p><h3 className="mt-2 text-2xl font-black text-blue-950">{phase.name}</h3><p className="mt-3 min-h-14 leading-7 text-slate-600">{phase.description}</p><p className="mt-4 font-black text-slate-800">{count}/{workshopConfig.maxSelectionsPerPhase} seleccionadas</p><Link href={`/team/phase/${phase.id}`} className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 font-bold text-white focus-visible:outline-3">Explorar fase</Link></article>;
          })}
        </div>
      </section>
      <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-950 to-violet-800 p-7 text-white sm:p-9"><p className="text-sm font-black uppercase tracking-widest text-blue-200">Resultado</p><h2 className="mt-2 text-3xl font-black">Construye tu Justicia 2030</h2><p className="mt-3 max-w-2xl leading-7 text-blue-50">Consulta el progreso en cualquier momento. Podrás enviar el resultado por correo al completar todas las fases.</p><Link href="/team/justicia-2030" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-white px-5 font-black text-blue-950 focus-visible:outline-3 focus-visible:outline-offset-3">Ir a Justicia 2030</Link></section>
    </main>
  );
}
