import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Justicia 2030",
  description: "Workshop para construir una visión compartida de la Justicia 2030.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
