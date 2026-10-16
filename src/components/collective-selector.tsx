"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";
import { CollectiveInfoPanel } from "./collective-info-panel";

export function CollectiveSelector() {
  const { selectCollective } = useWorkshop();
  const [selectedId, setSelectedId] = useState("");
  const collective = workshopConfig.collectives.find((item) => item.id === selectedId);
  const assets = collective?.assets;

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm sm:p-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Inicio de la partida</p>
          <h1 className="mt-2 text-3xl font-extrabold text-blue-950 sm:text-4xl">Seleccionad vuestro colectivo</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">Seleccionad el colectivo al que representáis para debatir las propuestas desde su visión.</p>
          <label htmlFor="collective" className="mt-7 block text-sm font-bold text-slate-950">Seleccionad un colectivo</label>
          <select id="collective" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 min-h-11 w-full max-w-xl rounded-md border border-slate-400 bg-white px-3 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600">
            <option value="" disabled>Escoged una opción</option>
            {workshopConfig.collectives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" disabled={!collective} onClick={() => collective && selectCollective(collective.id)} className="mt-5 block min-h-11 rounded-md bg-blue-700 px-5 text-sm font-bold text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">Comenzar partida</button>
        </div>
        {collective ? <CollectiveInfoPanel name={collective.name} description={collective.description} prioritizationCriteria={collective.prioritizationCriteria} assets={assets} /> : null}
      </section>
    </main>
  );
}
