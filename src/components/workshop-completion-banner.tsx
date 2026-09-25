"use client";

import { workshopConfig } from "@/config/workshop";
import { useWorkshop } from "@/context/workshop-context";

export function WorkshopCompletionBanner({ className = "" }: { className?: string }) {
  const { hydrated, sentPhaseIds } = useWorkshop();
  const complete = workshopConfig.phases.every((phase) => sentPhaseIds.includes(phase.id));

  if (!hydrated || !complete) return null;

  return (
    <section role="status" className={`rounded-xl border border-[#ddc238] bg-[#fff9e6] p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <img src="/icons/error.svg" alt="" className="size-6 shrink-0" />
        <p className="text-sm font-medium leading-6 text-[#0a0a0a]">Ya habéis completado todas las fases. Esperad al resto de grupos para conocer el resultado al final de la sesión.</p>
      </div>
    </section>
  );
}