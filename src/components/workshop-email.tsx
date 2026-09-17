"use client";

import { useState } from "react";
import { workshopConfig } from "@/config/workshop";
import { createWorkshopEmail } from "@/domain/workshop-email";
import type { SelectionsByPhase } from "@/domain/types";

export function WorkshopEmail({ selections }: { selections: SelectionsByPhase }) {
  const [teamName, setTeamName] = useState("");
  const email = createWorkshopEmail(workshopConfig, selections, teamName);

  function sendEmail() {
    if (email) window.location.href = email.mailto;
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 sm:p-6">
      <label htmlFor="team-name" className="block text-lg font-black text-blue-950">Nombre del equipo</label>
      <input
        id="team-name"
        type="text"
        value={teamName}
        onChange={(event) => setTeamName(event.target.value)}
        placeholder="Introduce el nombre del equipo"
        className="mt-3 min-h-11 w-full rounded-lg border border-slate-300 px-4 text-slate-900 focus-visible:outline-3 focus-visible:outline-blue-600"
      />
      <button
        type="button"
        disabled={!email}
        onClick={sendEmail}
        className="mt-4 min-h-11 rounded-lg bg-blue-700 px-5 font-bold text-white focus-visible:outline-3 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        Enviar resultado por correo
      </button>
    </div>
  );
}