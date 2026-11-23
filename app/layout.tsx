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
    <html lang="id">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#dff4ff_55%,_#bae6fd)]">
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-xs text-slate-500">
            <div className="border-t border-slate-200/70 pt-4">
              Program Pengabdian kepada Masyarakat ITB 2026 ·{" "}
              <a className="font-medium text-teal-700 hover:underline" href="https://fkhadami.github.io/">
                Faruq Khadami
              </a>
              , Oseanografi FITB – Institut Teknologi Bandung ·{" "}
              <a
                className="font-medium text-teal-700 hover:underline"
                href="https://fkhadami.github.io/files/modul-penggunaan-sinergi-karimunjawa.pdf"
              >
                Modul penggunaan (PDF)
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
