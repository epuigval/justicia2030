"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";

export function CollectiveSelector() {
  const { selectCollective } = useWorkshop();
  const [selectedId, setSelectedId] = useState("");
  const collective = workshopConfig.collectives.find((item) => item.id === selectedId);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid items-center gap-8 border-y border-slate-200 py-10 md:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Inicio de la partida</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Selecciona vuestro colectivo</h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">Esta elección adapta el contexto y los criterios de priorización durante el workshop. Varios equipos pueden elegir el mismo colectivo.</p>
          <label htmlFor="collective" className="mt-7 block font-black text-blue-950">Equipo o colectivo</label>
          <select id="collective" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 min-h-12 w-full max-w-xl rounded-lg border border-slate-300 bg-white px-4 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600">
            <option value="">Selecciona una opción</option>
            {workshopConfig.collectives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" disabled={!collective} onClick={() => collective && selectCollective(collective.id)} className="mt-6 min-h-12 rounded-lg bg-blue-700 px-6 font-black text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">Comenzar partida</button>
        </div>
        <aside className="border-l-4 border-blue-700 pl-6" aria-live="polite">
          {collective ? <><h2 className="text-xl font-black text-blue-950">{collective.name}</h2><p className="mt-2 leading-7 text-slate-600">{collective.description}</p><h3 className="mt-5 font-black text-blue-950">Criterios de priorización</h3><ul className="mt-2 space-y-2 text-slate-600">{collective.prioritizationCriteria.map((criterion) => <li key={criterion}>• {criterion}</li>)}</ul></> : <p className="leading-7 text-slate-500">Selecciona un colectivo para consultar su descripción.</p>}
        </aside>
      </section>
    </main>
  );
}
