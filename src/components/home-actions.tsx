"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storageKeys, workshopConfig } from "@/config/workshop";
import { totalSelected } from "@/domain/selections";
import { createStorageAdapter } from "@/persistence/storage";
import { ResetConfirm } from "./reset-confirm";

export function HomeActions() {
  const router = useRouter();
  const [session, setSession] = useState({ ready: false, hasSelections: false });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const result = createStorageAdapter(window.localStorage, storageKeys.team).read(workshopConfig);
    const timer = window.setTimeout(() => {
      setSession({ ready: true, hasSelections: result.ok && (result.value.collectiveId !== null || totalSelected(result.value.selectionsByPhase) > 0) });
      setNotice(result.ok ? "" : result.message);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function startAgain() {
    const result = createStorageAdapter(window.localStorage, storageKeys.team).remove();
    if (!result.ok) setNotice(result.message);
    router.push("/team");
  }

  if (!session.ready) return <p className="mt-8 font-semibold text-slate-600" aria-live="polite">Comprobando la sesión guardada…</p>;
  return (
    <div className="mt-8 space-y-4">
      {notice ? <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950" role="status">{notice}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Link href="/team" className="flex min-h-12 items-center rounded-xl bg-blue-700 px-6 font-black text-white shadow-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600">
          {session.hasSelections ? "Continuar partida" : "Iniciar como equipo"}
        </Link>
        {session.hasSelections ? <ResetConfirm triggerLabel="Comenzar nueva partida" message="Se eliminarán las selecciones del equipo guardadas en este navegador. No afectará al dinamizador ni a otros dispositivos. Esta acción no se puede deshacer." confirmLabel="Borrar y empezar" onConfirm={startAgain} /> : null}
      </div>
      <Link href="/facilitator" className="inline-flex min-h-11 items-center rounded-lg px-1 font-bold text-blue-800 underline decoration-2 underline-offset-4 focus-visible:outline-3">Acceso del dinamizador</Link>
    </div>
  );
}
