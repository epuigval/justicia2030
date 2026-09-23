"use client";

import Image from "next/image";
import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";

export function CollectiveSelector() {
  const { selectCollective } = useWorkshop();
  const [selectedId, setSelectedId] = useState("");
  const collective = workshopConfig.collectives.find((item) => item.id === selectedId);
  const assets = collective?.assets;

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-xl border border-slate-300 bg-white p-8 shadow-sm sm:p-10">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Inicio de la partida</p>
          <h1 className="mt-2 text-3xl font-black text-blue-950 sm:text-4xl">Seleccionad vuestro colectivo</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-700">Seleccionad el colectivo al que representáis para debatir las propuestas desde su visión.</p>
          <label htmlFor="collective" className="mt-7 block text-sm font-black text-slate-950">Seleccionad un colectivo</label>
          <select id="collective" value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 min-h-11 w-full max-w-xl rounded-md border border-slate-400 bg-white px-3 text-sm text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600">
            <option value="" disabled>Escoged una opción</option>
            {workshopConfig.collectives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button type="button" disabled={!collective} onClick={() => collective && selectCollective(collective.id)} className="mt-5 block min-h-11 rounded-md bg-blue-700 px-5 text-sm font-bold text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">Comenzar partida</button>
        </div>
        {collective ? <aside className={`relative mt-8 border-l-4 border-[#114dcd] bg-[#f8fafc] pb-6 pl-7 pr-6 pt-8 sm:rounded-r-xl ${assets?.illustrationSrc ? "lg:min-h-[363px]" : ""}`} aria-live="polite">
          <div className={assets?.illustrationSrc ? "max-w-[749px]" : undefined}>
            <div className="flex items-center gap-2">
              {assets?.iconSrc ? <img src={assets.iconSrc} alt="" width={24} height={24} aria-hidden="true" /> : null}
              <h2 className="text-lg font-bold leading-7 text-[#0a0a0a]">{collective.name}</h2>
            </div>
            <p className="mt-2.5 text-sm leading-5 text-[#0a0a0a]">{collective.description}</p>
            <h3 className="mt-6 text-sm font-bold leading-5 tracking-[0.35px] text-[#0a0a0a]">Criterios de priorización</h3>
            <ul className="mt-2.5 space-y-2 text-sm leading-5 text-[#0a0a0a]">{collective.prioritizationCriteria.map((criterion) => <li key={criterion} className="flex gap-2"><span className="text-[#114dcd]" aria-hidden="true">•</span><span>{criterion}</span></li>)}</ul>
          </div>
          {assets?.illustrationSrc ? <div className="mt-6 h-[205px] w-[308px] overflow-hidden lg:absolute lg:bottom-6 lg:right-6 lg:mt-0"><Image src={assets.illustrationSrc} alt="" width={308} height={205} className="block h-[205px] w-[308px] object-cover" /></div> : null}
        </aside> : null}
      </section>
    </main>
  );
}
