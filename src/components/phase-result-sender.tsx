"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import type { CardId, PhaseId } from "@/domain/types";

type SendStatus = "idle" | "sending" | "success" | "error";

export function PhaseResultSender({ sessionId, phaseId, selectedCardIds }: { sessionId: string; phaseId: PhaseId; selectedCardIds: CardId[] }) {
  const [statusBySelection, setStatusBySelection] = useState<Record<string, SendStatus>>({});
  if (selectedCardIds.length !== workshopConfig.maxSelectionsPerPhase) return null;

  const selectionKey = [sessionId, phaseId, ...[...selectedCardIds].sort()].join(":");
  const status = statusBySelection[selectionKey] ?? "idle";

  async function send() {
    if (status === "sending") return;
    setStatusBySelection((current) => ({ ...current, [selectionKey]: "sending" }));
    try {
      const response = await fetch("/api/send-phase-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, phaseId, selectedCardIds }),
      });
      if (!response.ok) throw new Error("send");
      setStatusBySelection((current) => ({ ...current, [selectionKey]: "success" }));
    } catch {
      setStatusBySelection((current) => ({ ...current, [selectionKey]: "error" }));
    }
  }

  return (
    <div className="mt-2">
      <button type="button" disabled={status === "sending"} onClick={send} className="flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-700 bg-white px-4 font-bold text-blue-800 focus-visible:outline-3 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400">
        {status === "sending" ? "Enviando..." : "Enviar resultados"}
      </button>
      {status === "success" ? <p className="mt-2 text-sm font-bold text-emerald-700" role="status">Resultados enviados correctamente</p> : null}
      {status === "error" ? <p className="mt-2 text-sm font-bold text-red-700" role="alert">No se pudieron enviar los resultados. Inténtalo de nuevo.</p> : null}
    </div>
  );
}
