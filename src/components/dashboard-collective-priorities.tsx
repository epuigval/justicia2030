"use client";

import { useState } from "react";

import type {
  DashboardCollectiveMetricsDto,
  DashboardPhasePrioritiesDto,
} from "@/domain/dashboard";
import { DashboardPriorityItem } from "./dashboard-priority-item";

const numberFormatter = new Intl.NumberFormat("es-ES");

export function DashboardCollectivePriorities({
  collectives,
  phases,
}: {
  collectives: DashboardCollectiveMetricsDto[];
  phases: DashboardPhasePrioritiesDto[];
}) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(phases[0]?.phaseId ?? "");
  const selectedPhase = phases.find((phase) => phase.phaseId === selectedPhaseId) ?? phases[0];

  if (!selectedPhase) return null;

  return (
    <div className="mt-6">
      <div className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Seleccionar fase para comparar colectivos">
        {phases.map((phase) => (
          <button
            key={phase.phaseId}
            type="button"
            aria-pressed={phase.phaseId === selectedPhase.phaseId}
            onClick={() => setSelectedPhaseId(phase.phaseId)}
            className="min-h-10 cursor-pointer rounded-lg px-4 text-sm font-bold text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-pressed:bg-blue-950 aria-pressed:text-white aria-pressed:shadow-sm"
          >
            {phase.phaseName}
          </button>
        ))}
      </div>

      <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
          <caption className="sr-only">Prioridades de {selectedPhase.phaseName} por colectivo</caption>
          <colgroup>
            <col className="w-[22%]" />
            <col className="w-[26%]" />
            <col className="w-[26%]" />
            <col className="w-[26%]" />
          </colgroup>
          <thead className="bg-blue-950 text-white">
            <tr>
              <th scope="col" className="px-5 py-4 text-sm font-black">Colectivo</th>
              {[1, 2, 3].map((rank) => <th key={rank} scope="col" className="border-l border-white/15 px-4 py-4 text-sm font-black">#{rank}</th>)}
            </tr>
          </thead>
          <tbody>
            {collectives.map((collective) => {
              const phase = collective.phasePriorities.find((item) => item.phaseId === selectedPhase.phaseId);

              return (
                <tr key={collective.collectiveId} className="border-t border-slate-200 align-top first:border-t-0">
                  <th scope="row" className="bg-slate-50 px-5 py-4">
                    <span className="block text-sm font-black leading-5 text-blue-950">{collective.collectiveName}</span>
                    {collective.completedParticipations > 0 ? (
                      <span className="mt-1.5 block text-xs font-normal text-slate-500">
                        {numberFormatter.format(collective.completedParticipations)} {collective.completedParticipations === 1 ? "completada" : "completadas"}
                      </span>
                    ) : null}
                  </th>
                  {collective.completedParticipations === 0 ? (
                    <td colSpan={3} className="border-l border-slate-200 px-5 py-6 text-sm font-bold text-slate-500">Sin datos</td>
                  ) : [1, 2, 3].map((rank) => {
                    const priorities = phase?.priorities.filter((priority) => priority.rank === rank) ?? [];
                    return (
                      <td key={rank} className="border-l border-slate-200 px-4 py-2">
                        {priorities.length > 0 ? (
                          <div className="divide-y divide-slate-200">
                            {priorities.map((priority) => (
                              <DashboardPriorityItem key={priority.cardId} priority={priority} accent={selectedPhase.accent} showRank={false} compact />
                            ))}
                          </div>
                        ) : <span className="block py-4 text-sm text-slate-400">Sin datos</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
