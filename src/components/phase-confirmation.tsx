"use client";

import { createPhaseSelectionEmail } from "@/domain/workshop-email";
import type { CardId, WorkshopCollective, WorkshopConfig, WorkshopPhase } from "@/domain/types";

export function PhaseConfirmation({ config, phase, collective, selectedIds }: { config: WorkshopConfig; phase: WorkshopPhase; collective: WorkshopCollective; selectedIds: CardId[] }) {
  const email = createPhaseSelectionEmail(config, selectedIds, collective, phase);
  return <button type="button" disabled={!email} onClick={() => { if (email) window.location.href = email.mailto; }} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-700 bg-white px-4 font-bold text-blue-800 focus-visible:outline-3 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400">Confirmar selección</button>;
}