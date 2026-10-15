import Link from "next/link";

import type {
  DashboardCollectiveMetricsDto,
  DashboardDto,
  DashboardPhasePrioritiesDto,
} from "@/domain/dashboard";

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

function PriorityList({ phase }: { phase: DashboardPhasePrioritiesDto }) {
  if (phase.completedParticipants === 0) {
    return <p className="mt-5 text-sm leading-6 text-slate-600">Sin participaciones completadas en este periodo.</p>;
  }

  if (phase.priorities.length === 0) {
    return <p className="mt-5 text-sm leading-6 text-slate-600">Sin selecciones disponibles.</p>;
  }

  return (
    <ol className="mt-5 space-y-3">
      {phase.priorities.map((priority) => (
        <li key={priority.cardId} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-950 text-sm font-black text-white" aria-label={`Posición ${priority.rank}`}>
              {priority.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-6 text-slate-950">{priority.title}</p>
              <p className="mt-1 text-sm text-slate-600">
                {numberFormatter.format(priority.selectionCount)} {priority.selectionCount === 1 ? "selección" : "selecciones"}
                <span aria-hidden="true"> · </span>
                <span>{percentageFormatter.format(priority.participantPercentage)}% de participantes</span>
              </p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function PhasePrioritiesGrid({ phases }: { phases: DashboardPhasePrioritiesDto[] }) {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-3">
      {phases.map((phase) => (
        <article key={phase.phaseId} className={`rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm ${accentClasses[phase.accent]}`}>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Fase {phase.phaseOrder}</p>
          <h3 className="mt-2 text-xl font-black text-blue-950">{phase.phaseName}</h3>
          <PriorityList phase={phase} />
        </article>
      ))}
    </div>
  );
}

function CollectivePriorities({ collective }: { collective: DashboardCollectiveMetricsDto }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="flex min-h-16 list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-black text-blue-950">{collective.collectiveName}</span>
          <span className="mt-1 block text-sm text-slate-600">
            {numberFormatter.format(collective.completedParticipations)} {collective.completedParticipations === 1 ? "participación completada" : "participaciones completadas"}
          </span>
        </span>
        <span className="text-2xl font-light text-blue-800 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
      </summary>
      <div className="border-t border-slate-200 px-5 pb-6">
        {collective.completedParticipations === 0 ? (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-slate-600">Este colectivo no tiene participaciones completadas en el periodo seleccionado.</p>
        ) : (
          <PhasePrioritiesGrid phases={collective.phasePriorities} />
        )}
      </div>
    </details>
  );
}

function CategoryDistribution({ collective }: { collective: DashboardCollectiveMetricsDto }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-blue-950">{collective.collectiveName}</h3>
      {collective.totalSelections === 0 ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">Sin selecciones completadas en este periodo.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {collective.categoryDistribution.map((category) => (
            <div key={category.categoryId}>
              <div className="flex items-end justify-between gap-3 text-sm">
                <span className="font-bold text-slate-800">{category.categoryName}</span>
                <span className="shrink-0 text-slate-600">
                  {percentageFormatter.format(category.percentage)}% · {numberFormatter.format(category.selectionCount)}
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${categoryBarClasses[category.categoryId] ?? "bg-blue-600"}`}
                  style={{ width: `${category.percentage}%` }}
                  role="img"
                  aria-label={`${category.categoryName}: ${percentageFormatter.format(category.percentage)}%, ${numberFormatter.format(category.selectionCount)} selecciones`}
                />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-500">Porcentaje sobre {numberFormatter.format(collective.totalSelections)} selecciones completadas.</p>
        </div>
      )}
    </article>
  );
}

export function DashboardView({ data, from, to, origin, error }: DashboardViewProps) {
  const returnHref = origin === "result" ? "/individual/result" : "/";
  const returnLabel = origin === "result" ? "Volver a resultados" : "Volver al inicio";
  const hasStartedData = Boolean(data?.summary.startedParticipations);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Justicia 2030</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">Métricas de participación</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">Prioridades agregadas del flujo de participación individual.</p>
        </div>
        <Link href={returnHref} className="inline-flex min-h-11 shrink-0 items-center self-start rounded-lg border border-blue-700 bg-white px-5 font-bold text-blue-800 shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:self-auto">
          {returnLabel}
        </Link>
      </div>

      <section className="mt-9 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="date-filter-title">
        <h2 id="date-filter-title" className="text-xl font-black text-blue-950">Periodo</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Las fechas incluyen días completos en horario Europe/Madrid y filtran por inicio de participación.</p>
        <form action="/dashboard" method="get" className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          {origin ? <input type="hidden" name="origin" value={origin} /> : null}
          <label className="flex flex-1 flex-col gap-2 font-bold text-slate-800">
            Desde
            <input type="date" name="from" defaultValue={from} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-200" />
          </label>
          <label className="flex flex-1 flex-col gap-2 font-bold text-slate-800">
            Hasta
            <input type="date" name="to" defaultValue={to} className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-normal text-slate-950 focus:border-blue-600 focus:outline-none focus:ring-3 focus:ring-blue-200" />
          </label>
          <button type="submit" className="min-h-11 rounded-xl bg-blue-700 px-5 font-black text-white shadow-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Aplicar filtro</button>
          <Link href={`/dashboard${originQuery(origin)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Limpiar filtro</Link>
        </form>
      </section>

      {error ? (
        <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
          <h2 className="text-lg font-black text-red-950">No se pueden mostrar las métricas</h2>
          <p className="mt-2 leading-7 text-red-900">{error}</p>
        </section>
      ) : data ? (
        <>
          <section className="mt-10" aria-labelledby="summary-title">
            <h2 id="summary-title" className="text-2xl font-black text-blue-950">Resumen general</h2>
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
          </section>

          {!hasStartedData ? (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
              <h2 className="text-xl font-black text-blue-950">Sin datos en este periodo</h2>
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
                <h2 id="global-priorities-title" className="text-2xl font-black text-blue-950">Prioridades globales</h2>
                <p className="mt-2 leading-7 text-slate-600">Tarjetas más seleccionadas por fase. Los empates comparten posición.</p>
                <PhasePrioritiesGrid phases={data.globalPhasePriorities} />
              </section>

              <section className="mt-12" aria-labelledby="collective-priorities-title">
                <h2 id="collective-priorities-title" className="text-2xl font-black text-blue-950">Prioridades por colectivo</h2>
                <p className="mt-2 leading-7 text-slate-600">Abre cada colectivo para consultar sus tres primeras posiciones por fase.</p>
                <div className="mt-6 space-y-4">
                  {data.collectiveMetrics.map((collective) => <CollectivePriorities key={collective.collectiveId} collective={collective} />)}
                </div>
              </section>

              <section className="mt-12" aria-labelledby="category-distribution-title">
                <h2 id="category-distribution-title" className="text-2xl font-black text-blue-950">Distribución por tipología</h2>
                <p className="mt-2 leading-7 text-slate-600">Peso de cada categoría sobre todas las selecciones completadas de cada colectivo.</p>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {data.collectiveMetrics.map((collective) => <CategoryDistribution key={collective.collectiveId} collective={collective} />)}
                </div>
              </section>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}
