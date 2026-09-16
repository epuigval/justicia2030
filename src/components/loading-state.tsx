export function LoadingState() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6" aria-busy="true">
      <p className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-lg font-semibold text-slate-700">Recuperando tus selecciones…</p>
    </main>
  );
}
