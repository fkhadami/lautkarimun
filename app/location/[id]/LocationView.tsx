"use client";

import { DataReadStamp } from "@/components/DataReadStamp";
import { DataSourceNote } from "@/components/DataSourceNote";
import { InfoCard } from "@/components/InfoCard";
import { LoadState } from "@/components/LoadState";
import { StatusBadge } from "@/components/StatusBadge";
import { TimeSeriesPanel } from "@/components/TimeSeriesPanel";
import { buildSummary, getLocationForecast, getLocationTimeSeries } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

export default function LocationView({ id }: { id: string }) {
  const { data, loading, error } = useAsync(async () => {
    const [forecast, series] = await Promise.all([getLocationForecast(id), getLocationTimeSeries(id)]);
    return { forecast, series, summary: forecast ? buildSummary(forecast, series) : null };
  }, [id]);

  if (loading || error) return <LoadState loading={loading} error={error} />;
  const location = data?.forecast;
  if (!location || !data) return <p className="text-sm text-slate-500">Location not found.</p>;
  const { summary, series } = data;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
      <InfoCard title={location.name}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Operational sea-state snapshot</p>
            <div className="mt-2">
              <DataReadStamp value={location.updated_at} />
            </div>
            <div className="mt-2">
              <DataSourceNote source={location.source} />
            </div>
          </div>
          <StatusBadge status={location.risk_status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Metric label="Wave Height" value={`${location.wave_height} m`} />
          <Metric label="Wind Speed" value={`${location.wind_speed} knots`} />
          <Metric label="Current Speed" value={`${location.current_speed} knots`} />
          <Metric label="Tide Condition" value={location.tide_condition} />
        </div>
      </InfoCard>
      <InfoCard title="AI Summary">
        <p className="text-sm leading-6 text-slate-600">{summary?.summary}</p>
      </InfoCard>
      <TimeSeriesPanel series={series} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
