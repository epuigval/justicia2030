import { orderedCategories } from "@/domain/catalog";
import type { CategoryId, WorkshopConfig } from "@/domain/types";

export function CategoryFilters({ config, active, onChange }: { config: WorkshopConfig; active: CategoryId | "all"; onChange: (id: CategoryId | "all") => void }) {
  const filters = [{ id: "all", name: "Todas" }, ...orderedCategories(config)];
  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          aria-pressed={active === filter.id}
          onClick={() => onChange(filter.id)}
          className={`rounded-full text-xs leading-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${active === filter.id ? "bg-[#1d4ed8] px-4 py-1.5 font-semibold text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]" : "border border-[#909090] bg-white px-[17px] py-[7px] font-medium text-[#0a0a0a]"}`}
        >
          {filter.name}
        </button>
      ))}
    </div>
  );
}
