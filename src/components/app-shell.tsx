import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children, roleLabel }: { children: ReactNode; roleLabel?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-md text-xl font-black tracking-tight text-blue-900 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            JUSTICIA <span className="text-blue-600">2030</span>
          </Link>
          {roleLabel ? <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900">{roleLabel}</span> : null}
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-600">
        Una justicia más humana, conectada e inteligente.
      </footer>
    </div>
  );
}
