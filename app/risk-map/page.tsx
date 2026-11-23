"use client";

import { DataReadStamp } from "@/components/DataReadStamp";
import { DataSourceNote } from "@/components/DataSourceNote";
import { MapPanel } from "@/components/MapPanel";
import { LoadState } from "@/components/LoadState";
import { getLocations } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

export default function RiskMapPage() {
  const { data, loading, error } = useAsync(getLocations);
  const locations = data ?? [];
  const latestRead = locations[0]?.updated_at;
  const source = locations[0]?.source;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold">Risk Map</h1>
        <p className="mt-2 text-sm text-slate-600">
          Color-coded maritime risk based on wave height thresholds.
        </p>
        {latestRead ? <div className="mt-3"><DataReadStamp value={latestRead} /></div> : null}
        {source ? <div className="mt-2"><DataSourceNote source={source} /></div> : null}
      </div>
      <LoadState loading={loading} error={error} />
      <MapPanel locations={locations} />
    </div>
  );
}
