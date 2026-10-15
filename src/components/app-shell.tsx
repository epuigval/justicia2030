import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export function AppShell({ children, brandHref = "/" }: { children: ReactNode; brandHref?: string | null }) {
  const brand = <>
    <span className="relative h-8 w-16 shrink-0 overflow-hidden sm:w-[72px]">
      <Image src="/generalitat-valenciana-logo.jpg" alt="Generalitat Valenciana" width={647} height={395} className="absolute left-[-15px] top-[-16px] h-auto w-[104px] max-w-none" priority />
    </span>
    <span className="text-xl font-black leading-8 text-[#0b1d3a] sm:text-2xl">JUSTICIA<span className="text-[#114dcd]">2030</span></span>
  </>;
  const brandClassName = "inline-flex items-center gap-2 rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#114dcd] sm:gap-4";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-[#d6d6d6] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          {brandHref ? <Link href={brandHref} className={brandClassName}>{brand}</Link> : <div className={brandClassName}>{brand}</div>}
          <img src="/nttdata-logo.svg" alt="NTT DATA" className="ml-auto hidden h-6 w-auto min-[360px]:block sm:h-8" />
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-600">
        Una justicia más humana, conectada e inteligente.
      </footer>
    </div>
  );
}
