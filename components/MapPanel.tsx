"use client";

import dynamic from "next/dynamic";

import type { Location } from "@/lib/types";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
        Loading map...
      </div>
    ),
  }
);

export function MapPanel({ locations }: { locations: Location[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm">
      <LeafletMap locations={locations} />
    </div>
  );
}
