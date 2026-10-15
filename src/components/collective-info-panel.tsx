import Image from "next/image";
import type { WorkshopCollectiveAssets } from "@/domain/types";

export function CollectiveInfoPanel({ name, description, prioritizationCriteria = [], assets }: {
  name: string;
  description: string;
  prioritizationCriteria?: string[];
  assets?: WorkshopCollectiveAssets;
}) {
  return (
    <aside className={`relative mt-8 border-l-4 border-[#114dcd] bg-[#f8fafc] pb-6 pl-7 pr-6 pt-8 sm:rounded-r-xl ${assets?.illustrationSrc ? "lg:min-h-[363px]" : ""}`} aria-live="polite">
      <div className={assets?.illustrationSrc ? "max-w-[749px]" : undefined}>
        <div className="flex items-center gap-2">
          {assets?.iconSrc ? <img src={assets.iconSrc} alt="" width={24} height={24} aria-hidden="true" /> : null}
          <h2 className="text-lg font-bold leading-7 text-[#0a0a0a]">{name}</h2>
        </div>
        <p className="mt-2.5 text-sm leading-5 text-[#0a0a0a]">{description}</p>
        {prioritizationCriteria.length > 0 ? <>
          <h3 className="mt-6 text-sm font-bold leading-5 tracking-[0.35px] text-[#0a0a0a]">Criterios de priorización</h3>
          <ul className="mt-2.5 space-y-2 text-sm leading-5 text-[#0a0a0a]">{prioritizationCriteria.map((criterion) => <li key={criterion} className="flex gap-2"><span className="text-[#114dcd]" aria-hidden="true">•</span><span>{criterion}</span></li>)}</ul>
        </> : null}
      </div>
      {assets?.illustrationSrc ? <div className="mt-6 h-[205px] w-[308px] overflow-hidden lg:absolute lg:bottom-6 lg:right-6 lg:mt-0"><Image src={assets.illustrationSrc} alt="" width={308} height={205} className="block h-[205px] w-[308px] object-contain" /></div> : null}
    </aside>
  );
}
