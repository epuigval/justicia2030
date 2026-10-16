"use client";

import { useEffect, useRef } from "react";

export function splitInterpretationText(interpretation: string): { title: string; body: string } {
  const firstSentenceEnd = interpretation.search(/[.!?](?=\s|$)/);
  if (firstSentenceEnd === -1) return { title: interpretation, body: "" };

  return {
    title: interpretation.slice(0, firstSentenceEnd + 1).trim(),
    body: interpretation.slice(firstSentenceEnd + 1).trim(),
  };
}

export function IndividualCompletionModal({
  error,
  interpretation,
  pending,
  onEdit,
  onComplete,
}: {
  error: string;
  interpretation: string;
  pending: boolean;
  onEdit: () => void;
  onComplete: () => void;
}) {
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const { title, body } = splitInterpretationText(interpretation);

  useEffect(() => {
    editButtonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="individual-completion-title"
        aria-describedby={body ? "individual-completion-body" : undefined}
        className="w-full max-w-[620px] rounded-[20px] bg-white px-7 py-9 text-center shadow-2xl sm:px-10 sm:py-11"
      >
        <h2 id="individual-completion-title" className="mx-auto max-w-[470px] text-xl font-bold leading-7 text-[#0a0a0a]">
          {title}
        </h2>
        {body ? <p id="individual-completion-body" className="mt-5 text-left text-sm leading-7 text-[#0a0a0a]">{body}</p> : null}

        {error ? <p className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-left text-sm text-red-950" role="alert">{error}</p> : null}

        <div className="mt-7 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <button
            ref={editButtonRef}
            type="button"
            disabled={pending}
            onClick={onEdit}
            className="min-h-11 cursor-pointer rounded-lg border border-[#114dcd] bg-white px-7 text-sm font-semibold text-[#114dcd] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd] disabled:cursor-wait disabled:border-[#7898dc] disabled:text-[#7898dc]"
          >
            Editar tarjetas
          </button>
          <button
            type="button"
            disabled={pending}
            aria-busy={pending}
            onClick={onComplete}
            className="min-h-11 cursor-pointer rounded-lg bg-[#114dcd] px-7 text-sm font-semibold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd] disabled:cursor-wait disabled:bg-[#7898dc]"
          >
            Guardar y finalizar
          </button>
        </div>
      </section>
    </div>
  );
}
