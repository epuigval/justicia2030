import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function AppShell({ children, roleLabel }: { children: ReactNode; roleLabel?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-[#d6d6d6] bg-white">
        <div className="flex h-16 items-center px-6 lg:px-24">
          <Link href="/" className="inline-flex items-center gap-4 rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#114dcd]">
            <span className="relative h-8 w-[72px] shrink-0 overflow-hidden">
              <Image src="/generalitat-valenciana-logo.jpg" alt="Generalitat Valenciana" width={647} height={395} className="absolute left-[-15px] top-[-16px] h-auto w-[104px] max-w-none" priority />
            </span>
            <span className="text-2xl font-black leading-8 text-[#0b1d3a]">JUSTICIA<span className="text-[#114dcd]">2030</span></span>
          </Link>
          {roleLabel ? <span className="ml-auto rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900">{roleLabel}</span> : null}
        </div>
      </header>
      {children}
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-600">
        Una justicia más humana, conectada e inteligente.
      </footer>
    </div>
  );
}
