import type {
  DashboardPhasePrioritiesDto,
  DashboardPriorityItemDto,
} from "@/domain/dashboard";

const numberFormatter = new Intl.NumberFormat("es-ES");
const percentageFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

export const phaseBarClasses: Record<DashboardPhasePrioritiesDto["accent"], string> = {
  orange: "bg-orange-500",
  green: "bg-emerald-600",
  blue: "bg-blue-600",
  violet: "bg-violet-600",
};

export function DashboardPriorityItem({
  priority,
  accent,
  showRank = true,
  compact = false,
}: {
  priority: DashboardPriorityItemDto;
  accent: DashboardPhasePrioritiesDto["accent"];
  showRank?: boolean;
  compact?: boolean;
}) {
  const formattedPercentage = percentageFormatter.format(priority.participantPercentage);
  const barWidth = Math.max(0, Math.min(100, priority.participantPercentage));

  return (
    <div className={compact ? "py-2.5" : "py-4"}>
      <div className="flex items-start gap-3">
        {showRank ? (
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-950 text-xs font-black text-white"
            aria-label={`Posición ${priority.rank}`}
          >
            {priority.rank}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className={`${compact ? "text-xs leading-5" : "text-sm leading-5"} font-bold text-slate-950`}>{priority.title}</p>
            <strong className={`${compact ? "text-sm" : "text-lg"} shrink-0 font-black text-blue-950`}>{formattedPercentage}%</strong>
          </div>
          <div className={`${compact ? "mt-1.5 h-1.5" : "mt-2 h-2"} overflow-hidden rounded-full bg-slate-200`}>
            <div
              className={`h-full rounded-full ${phaseBarClasses[accent]}`}
              style={{ width: `${barWidth}%` }}
              role="progressbar"
              aria-label={`${priority.title}: ${formattedPercentage}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={priority.participantPercentage}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {numberFormatter.format(priority.selectionCount)} {priority.selectionCount === 1 ? "selección" : "selecciones"}
          </p>
        </div>
      </div>
    </div>
  );
}
