"use client";

import { useEffect, useState } from "react";

export function PromptArea({ prompt }: { prompt: string | null }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function copyPrompt() {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setMessage("Prompt copiado");
    } catch {
      setMessage("No se pudo copiar automáticamente. Selecciona el texto y cópialo manualmente");
    }
  }

  return (
    <div className="mt-6">
      <label htmlFor="generated-prompt" className="text-lg font-black text-blue-950">Prompt generado</label>
      <textarea id="generated-prompt" readOnly value={prompt ?? ""} placeholder="El prompt aparecerá cuando todas las fases estén completas." className="mt-3 min-h-96 w-full rounded-2xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 focus-visible:outline-3 focus-visible:outline-blue-600" />
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <button type="button" disabled={!prompt} onClick={copyPrompt} className="min-h-11 rounded-lg bg-blue-700 px-5 font-bold text-white focus-visible:outline-3 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">Copiar prompt</button>
        <p className="font-semibold text-slate-700" role="status" aria-live="polite">{message}</p>
      </div>
    </div>
  );
}
