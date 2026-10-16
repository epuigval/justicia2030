"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getIndividualCollectivePresentation } from "@/config/individual-collectives";
import { createIndividualCredentials } from "@/domain/individual-credentials";
import { individualResumeHref, type IndividualCatalog } from "@/domain/individual-flow";
import { useIndividualParticipation } from "@/context/individual-context";
import { LoadingState } from "./loading-state";
import { CollectiveInfoPanel } from "./collective-info-panel";
import { SelectChevron } from "./select-chevron";

export function IndividualStart({ catalog, catalogUnavailable = false }: { catalog: IndividualCatalog; catalogUnavailable?: boolean }) {
  const router = useRouter();
  const state = useIndividualParticipation();
  const { hydrated, participationId, completed, start, storageNotice } = state;
  const [collectiveId, setCollectiveId] = useState("");
  const [subprofileId, setSubprofileId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const subprofiles = useMemo(
    () => catalog.subprofiles.filter((subprofile) => subprofile.collectiveId === collectiveId),
    [catalog.subprofiles, collectiveId],
  );
  const collective = catalog.collectives.find((item) => item.id === collectiveId);
  const collectivePresentation = collective ? getIndividualCollectivePresentation(collective.id) : undefined;

  useEffect(() => {
    if (!hydrated || !participationId) return;
    if (completed) {
      router.replace("/individual/result");
      return;
    }
    router.replace(individualResumeHref(state));
  }, [completed, hydrated, participationId, router, state]);

  if (!hydrated || participationId) return <LoadingState />;

  async function beginParticipation() {
    if (!collectiveId || pending) return;
    setPending(true);
    setError("");
    const credentials = createIndividualCredentials();

    try {
      const response = await fetch("/api/individual/participations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participationId: credentials.participationId,
          writeToken: credentials.writeToken,
          collectiveId,
          subprofileId: subprofileId || null,
        }),
      });

      if (!response.ok) {
        setError("No se pudo iniciar la participación. Revisa la selección e inténtalo de nuevo.");
        return;
      }

      start({ ...credentials, collectiveId, subprofileId: subprofileId || null });
      router.push("/individual/overview");
    } catch {
      setError("No se pudo conectar con el servicio. Inténtalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[var(--container-7xl)] px-3 py-8 sm:px-6">
      <section className="rounded-[20px] border border-[#d2d2d2] bg-white p-8 sm:p-10 lg:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.6px] text-[#114dcd]">Participación individual</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-9 text-[#0a0a0a] sm:text-[36px]">Construye tu visión de Justicia 2030</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#565656]">Selecciona tu colectivo y, si corresponde, tu perfil.</p>

        {storageNotice ? <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950" role="status">{storageNotice}</p> : null}
        {catalogUnavailable ? <p className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">El catálogo no está disponible ahora mismo. Inténtalo de nuevo más tarde.</p> : null}

        <div className="mt-8 grid max-w-3xl gap-6 sm:grid-cols-2">
          <label className="text-sm font-bold text-[#0a0a0a]">
            Colectivo <span className="text-red-700">*</span>
            <span className="relative mt-2 block">
              <select
                aria-label="Colectivo"
                value={collectiveId}
                disabled={catalogUnavailable || pending}
                onChange={(event) => {
                  setCollectiveId(event.target.value);
                  setSubprofileId("");
                  setError("");
                }}
                className="peer min-h-11 w-full appearance-none rounded-lg border border-[#909090] bg-white py-2 pl-3 pr-11 font-normal text-[#0a0a0a] focus-visible:outline-3 focus-visible:outline-[#114dcd] disabled:bg-slate-100"
              >
                <option value="">Selecciona un colectivo</option>
                {catalog.collectives.map((collective) => <option key={collective.id} value={collective.id}>{collective.name}</option>)}
              </select>
              <SelectChevron />
            </span>
          </label>

          <label className="text-sm font-bold text-[#0a0a0a]">
            Perfil <span className="font-normal text-[#565656]">(opcional)</span>
            <span className="relative mt-2 block">
              <select
                aria-label="Perfil (opcional)"
                value={subprofileId}
                disabled={!collectiveId || catalogUnavailable || pending}
                onChange={(event) => {
                  setSubprofileId(event.target.value);
                  setError("");
                }}
                className="peer min-h-11 w-full appearance-none rounded-lg border border-[#909090] bg-white py-2 pl-3 pr-11 font-normal text-[#0a0a0a] focus-visible:outline-3 focus-visible:outline-[#114dcd] disabled:bg-slate-100"
              >
                <option value="">Sin perfil</option>
                {subprofiles.map((subprofile) => <option key={subprofile.id} value={subprofile.id}>{subprofile.name}</option>)}
              </select>
              <SelectChevron />
            </span>
          </label>
        </div>

        {collective && collectivePresentation ? <CollectiveInfoPanel name={collective.name} description={collectivePresentation.description} assets={collectivePresentation.assets} /> : null}

        {error ? <p className="mt-5 max-w-3xl rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-950" role="alert">{error}</p> : null}

        <button
          type="button"
          disabled={!collectiveId || catalogUnavailable || pending}
          onClick={beginParticipation}
          className="mt-7 min-h-11 rounded-lg bg-[#114dcd] px-6 text-sm font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#114dcd] disabled:cursor-not-allowed disabled:bg-[#d2d2d2] disabled:text-[#565656]"
        >
          {pending ? "Iniciando…" : "Continuar"}
        </button>
      </section>
    </main>
  );
}
