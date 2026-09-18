import { AppShell } from "@/components/app-shell";
import { HomeActions } from "@/components/home-actions";
import { workshopConfig } from "@/config/workshop";

export default function HomePage() {
  return <AppShell>
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-0 h-80 bg-gradient-to-br from-blue-100 via-white to-violet-100" />
      <div
          className="relative mx-auto grid min-h-[72vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <section>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-700">Workshop presencial</p>
              <h1 className="mt-4 text-5xl font-black tracking-tight text-blue-950 sm:text-6xl">Justicia <span
                      className="text-blue-600">2030</span></h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-700">{workshopConfig.intro}</p>
              <HomeActions />
          </section>
          <section className="rounded-3xl border border-white/80 bg-white/85 p-7 shadow-xl backdrop-blur sm:p-9"
              aria-labelledby="how-title">
              <h2 id="how-title" className="text-2xl font-black text-blue-950">Cómo funciona</h2>
              <ol className="mt-6 space-y-5">{workshopConfig.phases.map((phase) => <li key={phase.id}
                      className="flex gap-4"><span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 font-black text-white">{phase.order}</span>
                      <div>
                          <h3 className="font-black text-slate-900">{phase.name}</h3>
                          <p className="mt-1 text-slate-600">{phase.description}</p>
                      </div>
                  </li>)}</ol>
          </section>
      </div>
    </main>
</AppShell>;
}
