import { connection } from "next/server";

import { AppShell } from "@/components/app-shell";
import { DashboardView, type DashboardOrigin } from "@/components/dashboard";
import { parseDashboardDateRange } from "@/domain/dashboard";
import { getDashboardMetrics } from "@/server/dashboard";

interface DashboardPageProps {
  searchParams: Promise<{
    from?: string | string[];
    to?: string | string[];
    origin?: string | string[];
  }>;
}

function parseOrigin(value: string | string[] | undefined): DashboardOrigin {
  return value === "home" || value === "result" ? value : null;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  await connection();
  const params = await searchParams;
  const origin = parseOrigin(params.origin);
  const rangeResult = parseDashboardDateRange(params.from, params.to);

  if (!rangeResult.ok) {
    return (
      <AppShell>
        <DashboardView data={null} from={rangeResult.from} to={rangeResult.to} origin={origin} error={rangeResult.message} />
      </AppShell>
    );
  }

  let data = null;
  let readError: string | undefined;

  try {
    data = await getDashboardMetrics(rangeResult.value);
  } catch {
    readError = "No se han podido leer los datos. Inténtalo de nuevo en unos instantes.";
  }

  return (
    <AppShell>
      <DashboardView
        data={data}
        from={rangeResult.value.from}
        to={rangeResult.value.to}
        origin={origin}
        error={readError}
      />
    </AppShell>
  );
}
