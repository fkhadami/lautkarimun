import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "SINERGI KARIMUNJAWA",
  description: "Sinergi Peningkatan Literasi Cuaca Maritim Berbasis Komunitas",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#dff4ff_55%,_#bae6fd)]">
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
