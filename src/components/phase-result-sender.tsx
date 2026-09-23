"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import type { CardId, PhaseId } from "@/domain/types";

type SendStatus = "idle" | "sending" | "success" | "error";

export function PhaseResultSender({ sessionId, phaseId, collectiveId, selectedCardIds, selectionAlreadySent = false, onSent, buttonLabel = "Enviar resultados", disabled = false, renderWhenIncomplete = false }: { sessionId: string; phaseId: PhaseId; collectiveId: string; selectedCardIds: CardId[]; selectionAlreadySent?: boolean; onSent?: () => void; buttonLabel?: string; disabled?: boolean; renderWhenIncomplete?: boolean }) {
  const [statusBySelection, setStatusBySelection] = useState<Record<string, SendStatus>>({});
  if (!renderWhenIncomplete && selectedCardIds.length !== workshopConfig.maxSelectionsPerPhase) return null;

  const selectionKey = [sessionId, phaseId, ...[...selectedCardIds].sort()].join(":");
  const status = selectionAlreadySent ? "success" : statusBySelection[selectionKey] ?? "idle";

  async function send() {
    if (disabled || status === "sending" || status === "success") return;
    setStatusBySelection((current) => ({ ...current, [selectionKey]: "sending" }));
    try {
      const response = await fetch("/api/send-phase-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, phaseId, collectiveId, selectedCardIds }),
      });
      if (!response.ok) throw new Error("send");
      setStatusBySelection((current) => ({ ...current, [selectionKey]: "success" }));
      onSent?.();
    } catch {
      setStatusBySelection((current) => ({ ...current, [selectionKey]: "error" }));
    }
  }

  return (
    <div className="mt-2">
      <button type="button" disabled={disabled || status === "sending" || status === "success"} onClick={send} className="flex min-h-11 w-full items-center justify-center rounded-lg bg-[#114dcd] px-4 text-sm font-semibold text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-[#e6e6e6] disabled:text-[#565656]">
        {status === "sending" ? "Enviando..." : buttonLabel}
      </button>
      {status === "success" ? <p className="mt-2 text-sm font-bold text-emerald-700" role="status">Resultados enviados correctamente</p> : null}
      {status === "error" ? <p className="mt-2 text-sm font-bold text-red-700" role="alert">No se pudieron enviar los resultados. Inténtalo de nuevo.</p> : null}
    </div>
  );
}
