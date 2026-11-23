"use client";

import Link from "next/link";

import { DataReadStamp } from "@/components/DataReadStamp";
import { DataSourceNote } from "@/components/DataSourceNote";
import { InfoCard } from "@/components/InfoCard";
import { MapPanel } from "@/components/MapPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadState } from "@/components/LoadState";
import { getLocations } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

export default function DashboardPage() {
  const { data, loading, error } = useAsync(getLocations);
  const locations = data ?? [];
  const latestRead = locations[0]?.updated_at;
  const source = locations[0]?.source;


  return (
    <div className="space-y-6">
      <LoadState loading={loading} error={error} />
      {latestRead ? <DataReadStamp value={latestRead} /> : null}
      {source ? <DataSourceNote source={source} /> : null}
      <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <MapPanel locations={locations} />
        <InfoCard title="Regional Snapshot">
          <div className="space-y-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/location/${location.id}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 transition hover:bg-slate-100"
              >
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-slate-500">
                    Wave {location.wave_height} m · Wind {location.wind_speed} kn
                  </p>
                </div>
                <StatusBadge status={location.risk_status} />
              </Link>
            ))}
          </div>
        </InfoCard>
      </section>
    </div>
  );
}
