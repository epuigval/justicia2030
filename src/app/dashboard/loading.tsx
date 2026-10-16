import { AppShell } from "@/components/app-shell";

export default function DashboardLoading() {
  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-busy="true">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-700">Justicia 2030</p>
        <h1 className="mt-2 text-3xl font-extrabold text-blue-950 sm:text-4xl">Resultados de participación</h1>
        <div className="mt-9 animate-pulse space-y-5">
          <div className="h-32 rounded-2xl bg-slate-200" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="h-32 rounded-2xl bg-slate-200" />
            <div className="h-32 rounded-2xl bg-slate-200" />
          </div>
        </div>
        <p className="mt-6 font-semibold text-slate-600">Cargando resultados…</p>
      </main>
    </AppShell>
  );
}
