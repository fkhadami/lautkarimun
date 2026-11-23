import Link from "next/link";

export default function HomePage() {
  return (
    <div className="rounded-3xl bg-white/80 p-10 shadow-sm">
      <h1 className="text-4xl font-semibold text-ink">
        SINERGI KARIMUNJAWA
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        Sinergi Peningkatan Literasi Cuaca Maritim Berbasis Komunitas
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="rounded-full bg-sea px-5 py-3 text-sm text-white" href="/dashboard">
          Open dashboard
        </Link>
        <Link className="rounded-full border border-slate-200 px-5 py-3 text-sm" href="/alerts">
          View alerts
        </Link>
      </div>
    </div>
  );
}
