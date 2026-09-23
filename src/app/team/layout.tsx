import { AppShell } from "@/components/app-shell";
import { WorkshopProvider } from "@/context/workshop-context";

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <WorkshopProvider scope="team"><AppShell>{children}</AppShell></WorkshopProvider>;
}
