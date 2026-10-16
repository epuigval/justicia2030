import Link from "next/link";

import type {
  DashboardCollectiveMetricsDto,
  DashboardDto,
  DashboardPhasePrioritiesDto,
} from "@/domain/dashboard";
import { DashboardCollectivePriorities } from "./dashboard-collective-priorities";
import { DashboardPriorityItem } from "./dashboard-priority-item";

export type DashboardOrigin = "home" | "result" | null;

interface DashboardViewProps {
  data: DashboardDto | null;
  from: string;
  to: string;
  origin: DashboardOrigin;
  error?: string;
}

const numberFormatter = new Intl.NumberFormat("es-ES");
const percentageFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

const accentClasses: Record<DashboardPhasePrioritiesDto["accent"], string> = {
  orange: "border-t-orange-500",
  green: "border-t-green-600",
  blue: "border-t-blue-600",
  violet: "border-t-violet-600",
};

const categoryBarClasses: Record<string, string> = {
  personas: "bg-blue-600",
  procesos: "bg-emerald-600",
  tecnologia: "bg-violet-600",
  gobernanza: "bg-orange-500",
};

function originQuery(origin: DashboardOrigin): string {
  return origin ? `?origin=${origin}` : "";
}

function PeriodFilter({ from, to, origin }: { from: string; to: string; origin: DashboardOrigin }) {
  return (
    <details className="mt-3" open={Boolean(from || to)}>
      <summary className="w-fit cursor-pointer list-none rounded-sm text-sm font-bold text-blue-800 underline decoration-2 underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
        Filtrar por periodo
      </summary>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <form action="/dashboard" method="get" className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {origin ? <input type="hidden" name="origin" value={origin} /> : null}
          <label className="flex flex-1 flex-col gap-2 font-bold text-slate-800">
            Desde
            <input type="date" name="from" defaultValue={from} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-200" />
          </label>
          <label className="flex flex-1 flex-col gap-2 font-bold text-slate-800">
            Hasta
            <input type="date" name="to" defaultValue={to} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-200" />
          </label>
          <button type="submit" className="min-h-11 rounded-xl bg-blue-700 px-5 font-bold text-white shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Aplicar filtro</button>
          <Link href={`/dashboard${originQuery(origin)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Limpiar filtro</Link>
        </form>
      </div>
    </details>
  );
}

function PriorityList({ phase }: { phase: DashboardPhasePrioritiesDto }) {
  if (phase.completedParticipants === 0) {
    return <p className="mt-5 text-sm leading-6 text-slate-600">Sin participaciones completadas en este periodo.</p>;
  }

  if (phase.priorities.length === 0) {
    return <p className="mt-5 text-sm leading-6 text-slate-600">Sin selecciones disponibles.</p>;
  }

  return (
    <ol className="mt-4 divide-y divide-slate-200">
      {phase.priorities.map((priority) => (
        <li key={priority.cardId}>
          <DashboardPriorityItem priority={priority} accent={phase.accent} />
        </li>
      ))}
    </ol>
  );
}

function PhasePrioritiesGrid({ phases }: { phases: DashboardPhasePrioritiesDto[] }) {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-3">
      {phases.map((phase) => (
        <article key={phase.phaseId} aria-labelledby={`global-priorities-${phase.phaseId}`} className={`rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm ${accentClasses[phase.accent]}`}>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Fase {phase.phaseOrder}</p>
          <h3 id={`global-priorities-${phase.phaseId}`} className="mt-2 text-xl font-bold text-blue-950">{phase.phaseName}</h3>
          <PriorityList phase={phase} />
        </article>
      ))}
    </div>
  );
}

function CategoryDistribution({ collective }: { collective: DashboardCollectiveMetricsDto }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="min-h-14 text-lg font-bold leading-7 text-blue-950">{collective.collectiveName}</h3>
      <div className="mt-4 flex-1 space-y-4">
        {collective.categoryDistribution.map((category) => (
          <div key={category.categoryId}>
            <div className="flex items-end justify-between gap-3 text-sm leading-5">
              <span className="font-bold text-slate-800">{category.categoryName}</span>
              <strong className="shrink-0 font-black text-blue-950">{percentageFormatter.format(category.percentage)}%</strong>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${categoryBarClasses[category.categoryId] ?? "bg-blue-600"}`}
                style={{ width: `${category.percentage}%` }}
                role="img"
                aria-label={`${category.categoryName}: ${percentageFormatter.format(category.percentage)}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export function DashboardView({ data, from, to, origin, error }: DashboardViewProps) {
  const returnHref = origin === "result" ? "/individual/result" : "/";
  const returnLabel = origin === "result" ? "Volver a resultado individual" : "Volver al inicio";
  const hasStartedData = Boolean(data?.summary.startedParticipations);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Justicia 2030</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">Resultados de participación</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">Prioridades agregadas del flujo de participación individual.</p>
        </div>
        <Link href={returnHref} className="inline-flex min-h-11 shrink-0 items-center self-start rounded-lg border border-blue-700 bg-white px-5 font-bold text-blue-800 shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:self-auto">
          {returnLabel}
        </Link>
      </div>

      <section className="mt-10" aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-extrabold text-blue-950">Resumen general</h2>
        <PeriodFilter from={from} to={to} origin={origin} />
        {data ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-blue-100 bg-blue-950 p-6 text-white shadow-sm">
              <p className="font-bold text-blue-100">Participaciones iniciadas</p>
              <p className="mt-3 text-4xl font-black">{numberFormatter.format(data.summary.startedParticipations)}</p>
            </article>
            <article className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
              <p className="font-bold text-blue-950">Participaciones completadas</p>
              <p className="mt-3 text-4xl font-black text-blue-700">{numberFormatter.format(data.summary.completedParticipations)}</p>
            </article>
          </div>
        ) : null}
      </section>

      {error ? (
        <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
          <h2 className="text-lg font-extrabold text-red-950">No se pueden mostrar los resultados de participación</h2>
          <p className="mt-2 leading-7 text-red-900">{error}</p>
        </section>
      ) : data ? (
        <>
          {!hasStartedData ? (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <h2 className="text-xl font-extrabold text-blue-950">Sin datos en este periodo</h2>
              <p className="mt-2 text-slate-600">No hay participaciones iniciadas para el filtro seleccionado.</p>
            </section>
          ) : (
            <>
              {data.summary.completedParticipations === 0 ? (
                <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950" role="status">
                  Hay participaciones iniciadas, pero ninguna completada en este periodo. Las prioridades aparecerán cuando exista alguna finalización.
                </div>
              ) : null}

              <section className="mt-12" aria-labelledby="global-priorities-title">
                <h2 id="global-priorities-title" className="text-2xl font-extrabold text-blue-950">Prioridades globales</h2>
                <p className="mt-2 leading-7 text-slate-600">Estas son las temáticas más votadas por cada fase.</p>
                <PhasePrioritiesGrid phases={data.globalPhasePriorities} />
              </section>

              <section className="mt-12" aria-labelledby="collective-priorities-title">
                <h2 id="collective-priorities-title" className="text-2xl font-extrabold text-blue-950">Prioridades por colectivo</h2>
                <p className="mt-2 leading-7 text-slate-600">Estas son las temáticas más votadas por cada colectivo en cada una de las tres fases.</p>
                <DashboardCollectivePriorities collectives={data.collectiveMetrics} phases={data.globalPhasePriorities} />
              </section>

              <section className="mt-12" aria-labelledby="category-distribution-title">
                <h2 id="category-distribution-title" className="text-2xl font-extrabold text-blue-950">Distribución por categoría</h2>
                <p className="mt-2 leading-7 text-slate-600">Estas son las categorías ordenadas por importancia en función de las temáticas votadas.</p>
                {data.collectiveMetrics.some((collective) => collective.totalSelections > 0) ? (
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {data.collectiveMetrics.filter((collective) => collective.totalSelections > 0).map((collective) => <CategoryDistribution key={collective.collectiveId} collective={collective} />)}
                  </div>
                ) : <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm font-bold text-slate-500 shadow-sm">No hay datos de distribución por categoría en este periodo.</p>}
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
