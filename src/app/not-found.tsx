import Link from "next/link";
import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return <AppShell><main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-6 text-center"><p className="text-sm font-black uppercase tracking-widest text-blue-700">404</p><h1 className="mt-3 text-4xl font-black text-blue-950">No encontramos esta página</h1><p className="mt-4 text-lg text-slate-600">La fase o tarjeta solicitada no existe, o no pertenece a esta parte del workshop.</p><Link href="/" className="mt-7 flex min-h-11 items-center rounded-lg bg-blue-700 px-5 font-bold text-white">Volver al inicio</Link></main></AppShell>;
}
