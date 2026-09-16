"use client";

import Link from "next/link";

import { content } from "@/data/content";
import { useWorkshopStore } from "@/store/workshop-store";

const SESSION_ID = "equipo";

export default function Home() {
  const session = useWorkshopStore((state) => state.groups[SESSION_ID]);
  const resetGroup = useWorkshopStore((state) => state.resetGroup);
  const selectedCount = session
    ? Object.values(session.selectionsByPhase).flat().length
    : 0;

  function startNewSession() {
    if (
      selectedCount > 0 &&
      !window.confirm("Se borraran las elecciones guardadas en este dispositivo. Deseas continuar?")
    ) {
      return;
    }

    resetGroup(SESSION_ID);
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Workshop de cocreacion</p>
        <h1>Justicia 2030</h1>
        <p>Una dinamica para pensar, decidir y transformar juntos.</p>
      </header>

      <section className="card-panel mt-4">
        <h2 className="text-xl font-semibold text-slate-900">Sesion del equipo</h2>
        <p className="mt-2 text-sm text-slate-600">
          Las decisiones se guardan solamente en este navegador. No se solicita ningun dato del equipo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCount > 0 && (
            <Link className="primary-button" href={`/grupo/${SESSION_ID}`}>
              Continuar sesion ({selectedCount}/
              {content.phases.length * content.maxSelectionsPerPhase})
            </Link>
          )}
          <Link
            className={selectedCount > 0 ? "secondary-button" : "primary-button"}
            href={`/grupo/${SESSION_ID}`}
            onClick={startNewSession}
          >
            {selectedCount > 0 ? "Comenzar de nuevo" : "Comenzar"}
          </Link>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Vista global
          </h3>
          <div className="mt-3">
            <Link className="secondary-button" href="/dinamizador">
              Abrir pantalla de dinamizador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
