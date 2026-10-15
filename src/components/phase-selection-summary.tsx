import Link from "next/link";
import type { WorkshopCard, WorkshopPhase } from "@/domain/types";

const phaseCardStyles = {
  orange: { border: "border-[#e26600]", accent: "bg-[#e26600]", check: "bg-[#e26600]" },
  green: { border: "border-[#10b981]", accent: "bg-[#10b981]", check: "bg-[#10B981]" },
  blue: { border: "border-[#0e42b1]", accent: "bg-[#0e42b1]", check: "bg-[#114dcd]" },
  violet: { border: "border-[#072056]", accent: "bg-[#072056]", check: "bg-[#072056]" },
} as const;

export function PhaseSelectionSummary({ phase, selectedCards, selectedCount, maxSelections, actionHref }: {
  phase: WorkshopPhase;
  selectedCards: WorkshopCard[];
  selectedCount: number;
  maxSelections: number;
  actionHref?: string;
}) {
  const style = phaseCardStyles[phase.accent];
  const progress = `${(selectedCount / maxSelections) * 100}%`;

  return (
    <article className={`relative flex min-h-[239px] flex-col overflow-hidden rounded-2xl border bg-white/95 p-[25px] pt-[33px] shadow-[0_4px_20px_-4px_rgba(234,88,12,0.08)] ${style.border}`} aria-labelledby={`phase-summary-${phase.id}`}>
      <div className={`absolute inset-x-0 top-0 h-2 ${style.accent}`} />
      <p className="text-xs font-bold uppercase leading-4 tracking-[0.3px] text-[#114dcd]">Fase {phase.order}</p>
      <h3 id={`phase-summary-${phase.id}`} className="mt-1 text-lg font-bold leading-7 text-slate-900">{phase.name}</h3>
      <div className="mt-5 rounded-xl border border-[#f2f2f2] bg-[#f2f2f2]/90 p-[13px]">
        <div className="flex items-center justify-between gap-3 text-xs leading-4"><span className="font-medium text-[#0a0a0a]">Tarjetas de acción</span><strong className="text-slate-800">{selectedCount}/{maxSelections} seleccionadas</strong></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className={`h-full rounded-full ${style.accent}`} style={{ width: progress }} /></div>
      </div>
      {selectedCards.length > 0 ? <ul className="mt-3 space-y-2" aria-label={`Tarjetas seleccionadas de ${phase.name}`}>{selectedCards.map((card) => <li key={card.id} className="flex items-start gap-2 text-xs leading-4 text-[#0a0a0a]"><span aria-hidden="true" className={`size-4 shrink-0 [mask-image:url('/icons/check.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] ${style.check}`} />{card.title}</li>)}</ul> : null}
      {actionHref ? <div className="mt-auto pt-4"><Link href={actionHref} className="flex min-h-9 w-full items-center justify-center rounded-lg bg-[#114dcd] px-4 py-2.5 text-sm font-semibold leading-4 text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] focus-visible:outline-3">Ver tarjetas</Link></div> : null}
    </article>
  );
}
