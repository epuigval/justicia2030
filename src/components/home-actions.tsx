"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { storageKeys, workshopConfig } from "@/config/workshop";
import { individualResumeHref } from "@/domain/individual-flow";
import { createIndividualStorageAdapter } from "@/persistence/individual-storage";
import { createStorageAdapter } from "@/persistence/storage";
import { SelectChevron } from "./select-chevron";

type ParticipationMode = "team" | "individual" | "facilitator";

export function HomeActions() {
  const router = useRouter();
  const [mode, setMode] = useState<ParticipationMode | "">("");
  const [session, setSession] = useState({
    ready: false,
    teamStarted: false,
    individualHref: "/individual",
    individualStatus: "none" as "none" | "started" | "completed",
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys.team).read(workshopConfig);
    const individualResult = createIndividualStorageAdapter(window.localStorage).read();
    const storedIndividual = individualResult.ok ? individualResult.value : null;
    const timer = window.setTimeout(() => {
      setSession({
        ready: true,
        teamStarted: result.ok && Boolean(result.value.collectiveId),
        individualHref: storedIndividual ? individualResumeHref(storedIndividual) : "/individual",
        individualStatus: storedIndividual?.completed ? "completed" : storedIndividual ? "started" : "none",
      });
      setNotice(result.ok ? "" : result.message);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!session.ready) return <p className="mt-8 font-semibold text-slate-600" aria-live="polite">Comprobando la sesión guardada…</p>;

  const action = mode === "team"
    ? { label: session.teamStarted ? "Continuar partida" : "Iniciar partida", href: "/team" }
    : mode === "facilitator"
      ? { label: "Iniciar partida", href: "/facilitator" }
      : mode === "individual"
        ? {
            label: session.individualStatus === "started" ? "Continuar partida" : session.individualStatus === "completed" ? "Ver resultado" : "Iniciar partida",
            href: session.individualHref,
          }
        : { label: "Iniciar partida", href: "" };

  return (
    <div className="mt-8 space-y-4">
      {notice ? <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">{notice}</p> : null}
      <div className="max-w-xl rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm">
        <label htmlFor="participation-mode" className="block font-black text-blue-950">Elige cómo quieres participar</label>
        <div className="relative mt-3">
          <select
            id="participation-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as ParticipationMode | "")}
            className="peer min-h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white py-2 pl-4 pr-12 text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-200"
          >
            <option value="">Seleccionar una opción</option>
            <option value="team">Equipo</option>
            <option value="individual">Participante individual</option>
            <option value="facilitator">Dinamizador</option>
          </select>
          <SelectChevron />
        </div>
        <button
          type="button"
          disabled={!mode}
          onClick={() => action.href && router.push(action.href)}
          className="mt-4 min-h-12 w-full rounded-xl bg-blue-700 px-6 font-black text-white shadow-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {action.label}
        </button>
      </div>
      <Link href="/dashboard?origin=home" className="inline-flex min-h-11 items-center rounded-lg px-1 font-bold text-blue-800 underline decoration-2 underline-offset-4 focus-visible:outline-3">Ver resultados generales</Link>
    </div>
  );
}
