import Link from "next/link";

export default function Home() {
  const groups = ["A", "B", "C", "D"];

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="eyebrow">Piloto frontend</p>
        <h1>Justicia 2030</h1>
        <p>
          Base navegable para grupos y dinamizador. Esta fase no usa base de datos ni login.
        </p>
      </header>

      <section className="card-panel mt-4">
        <h2 className="text-xl font-semibold text-slate-900">Accesos de grupo</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {groups.map((groupId) => (
            <Link
              key={groupId}
              className="primary-button"
              href={`/grupo/${groupId}`}
            >
              Equipo {groupId}
            </Link>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Vista global
          </h3>
          <div className="mt-3">
            <Link className="secondary-button" href="/dinamizador">
              Abrir pantalla de dinamizador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
