"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIndividualParticipation } from "@/context/individual-context";
import { ResetConfirm } from "./reset-confirm";

const abandonMessage = "Si abandonas esta participación, se eliminará el progreso guardado en este dispositivo. La participación seguirá registrada como iniciada, pero no se contabilizará como completada.";

export function IndividualAbandonAction({ className }: { className?: string }) {
  const router = useRouter();
  const state = useIndividualParticipation();
  const [error, setError] = useState("");

  function abandonParticipation() {
    setError("");
    if (!state.clear()) {
      setError("No se pudo limpiar la participación guardada en este dispositivo.");
      return;
    }
    router.replace("/");
  }

  return (
    <div>
      <ResetConfirm
        triggerLabel="Abandonar participación"
        title="Abandonar participación"
        message={abandonMessage}
        confirmLabel="Abandonar participación"
        onConfirm={abandonParticipation}
        triggerClassName={className ?? "min-h-11 rounded-lg border border-red-300 bg-white px-5 text-sm font-bold text-red-800 focus-visible:outline-3"}
        modal
      />
      {error ? <p className="mt-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">{error}</p> : null}
    </div>
  );
}
