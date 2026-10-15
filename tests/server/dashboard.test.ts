import { describe, expect, it, vi } from "vitest";

const supabase = vi.hoisted(() => ({ createServerSupabaseClient: vi.fn() }));

vi.mock("@/server/supabase", () => supabase);

import { getDashboardMetrics } from "@/server/dashboard";

interface Call {
  table: string;
  method: string;
  args: unknown[];
}

function createClient() {
  const calls: Call[] = [];
  const results: Record<string, { data: unknown[]; error: null }> = {
    participations: {
      data: [
        { id: "completed-id", status: "completed", collective_id: "collective-a", started_at: "2026-10-15T10:00:00.000Z" },
        { id: "started-id", status: "started", collective_id: "collective-a", started_at: "2026-10-15T11:00:00.000Z" },
      ],
      error: null,
    },
    collectives: { data: [{ id: "collective-a", name: "Colectivo A" }], error: null },
    participation_selections: { data: [], error: null },
  };

  function builder(table: string) {
    const query = {
      select(...args: unknown[]) { calls.push({ table, method: "select", args }); return query; },
      eq(...args: unknown[]) { calls.push({ table, method: "eq", args }); return query; },
      order(...args: unknown[]) { calls.push({ table, method: "order", args }); return query; },
      range(...args: unknown[]) { calls.push({ table, method: "range", args }); return query; },
      gte(...args: unknown[]) { calls.push({ table, method: "gte", args }); return query; },
      lt(...args: unknown[]) { calls.push({ table, method: "lt", args }); return query; },
      in(...args: unknown[]) { calls.push({ table, method: "in", args }); return query; },
      then(resolve: (value: { data: unknown[]; error: null }) => unknown) { return Promise.resolve(results[table]).then(resolve); },
    };
    return query;
  }

  return { client: { from: (table: string) => builder(table) }, calls };
}

describe("lectura server-only del dashboard", () => {
  it("filtra por started_at, usa catálogo activo y trae selecciones sólo para completed", async () => {
    const { client, calls } = createClient();
    supabase.createServerSupabaseClient.mockReturnValue(client);

    const dto = await getDashboardMetrics({
      from: "2026-10-15",
      to: "2026-10-15",
      fromUtc: "2026-10-14T22:00:00.000Z",
      toExclusiveUtc: "2026-10-15T22:00:00.000Z",
    });

    expect(calls).toContainEqual({ table: "collectives", method: "eq", args: ["active", true] });
    expect(calls).toContainEqual({ table: "participations", method: "gte", args: ["started_at", "2026-10-14T22:00:00.000Z"] });
    expect(calls).toContainEqual({ table: "participations", method: "lt", args: ["started_at", "2026-10-15T22:00:00.000Z"] });
    expect(calls).toContainEqual({ table: "participation_selections", method: "in", args: ["participation_id", ["completed-id"]] });
    expect(dto.summary).toEqual({ startedParticipations: 2, completedParticipations: 1 });
    expect(JSON.stringify(dto)).not.toMatch(/completed-id|started-id|participationId/);
  });
});
