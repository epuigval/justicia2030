import { AppShell } from "@/components/app-shell";
import { IndividualProvider } from "@/context/individual-context";

export default function IndividualLayout({ children }: { children: React.ReactNode }) {
  return <IndividualProvider><AppShell brandHref={null}>{children}</AppShell></IndividualProvider>;
}
