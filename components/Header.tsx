import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/risk-map", label: "Risk Map" },
  { href: "/alerts", label: "Alerts" },
];

export function Header() {
  return (
    <header className="border-b border-white/60 bg-white/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="max-w-2xl">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-sea">
            SINERGI KARIMUNJAWA
          </Link>
          <p className="mt-1 text-xs text-slate-500">
            Sinergi Peningkatan Literasi Cuaca Maritim Berbasis Komunitas
          </p>
        </div>
        <nav className="flex gap-3 text-sm text-slate-600">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 hover:bg-white/70">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
