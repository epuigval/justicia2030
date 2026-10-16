import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function AppShell({ children, brandHref = "/" }: { children: ReactNode; brandHref?: string | null }) {
  const brand = <>
    <span className="flex h-9 w-[92px] shrink-0 items-center justify-center rounded-md bg-[#072056] px-1.5 sm:h-10 sm:w-[120px] sm:px-2">
      <Image src="/dataforum-justicia.png" alt="DATAfórum Justicia" width={151} height={59} className="h-full w-full object-contain" priority />
    </span>
    <span className="text-xl font-black leading-8 text-[#0b1d3a] sm:text-2xl">JUSTICIA<span className="text-[#114dcd]">2030</span></span>
  </>;
  const brandClassName = "inline-flex items-center gap-2 rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#114dcd] sm:gap-4";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-[#d6d6d6] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {brandHref ? <Link href={brandHref} className={brandClassName}>{brand}</Link> : <div className={brandClassName}>{brand}</div>}
          <img src="/nttdata-logo.svg" alt="NTT DATA" className="ml-auto hidden h-5 w-auto min-[360px]:block sm:h-8" />
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-600">
        Una justicia más humana, conectada e inteligente.
      </footer>
    </div>
  );
}
