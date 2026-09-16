"use client";

import Link from "next/link";
import { useWorkshop } from "@/context/workshop-context";
import { Justicia2030 } from "./justicia-2030";
import { LoadingState } from "./loading-state";
import { StorageNotice } from "./notice";

export function TeamJusticia() {
  const { hydrated } = useWorkshop();
  if (!hydrated) return <LoadingState />;
  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><StorageNotice /><Link href="/team" className="mb-6 inline-flex min-h-11 items-center font-bold text-blue-800 underline">Volver al resumen</Link><Justicia2030 /></main>;
}
