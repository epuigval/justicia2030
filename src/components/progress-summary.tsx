import { workshopConfig } from "@/config/workshop";
import { orderedPhases } from "@/domain/catalog";
import { totalSelected } from "@/domain/selections";
import type { SelectionsByPhase } from "@/domain/types";

export function ProgressSummary({ selections, compact = false, unlimited = false, id = "progress" }: { selections: SelectionsByPhase; compact?: boolean; unlimited?: boolean; id?: string }) {
  const phases = orderedPhases(workshopConfig);
  const total = totalSelected(selections);
  const target = phases.length * workshopConfig.maxSelectionsPerPhase;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby={`${id}-title`}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={`${id}-title`} className="text-xl font-black text-blue-950">Progreso</h2>
        <strong className="rounded-full bg-blue-100 px-4 py-2 text-blue-900">{total}{unlimited ? " seleccionadas" : `/${target}`}</strong>
      </div>
      <ul className={`mt-4 grid gap-3 ${compact ? "" : "md:grid-cols-3"}`}>
        {phases.map((phase) => {
          const count = (selections[phase.id] ?? []).length;
          return <li key={phase.id} className="flex justify-between gap-3 rounded-xl bg-slate-50 p-3"><span className="font-bold">{phase.name}</span><span>{count}{unlimited ? "" : `/${workshopConfig.maxSelectionsPerPhase}`}</span></li>;
        })}
      </ul>
    </section>
  );
}
