"use client";

import { InfoCard } from "@/components/InfoCard";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadState } from "@/components/LoadState";
import { getAlerts } from "@/lib/api";
import { useAsync } from "@/lib/useAsync";

export default function AlertsPage() {
  const { data, loading, error } = useAsync(getAlerts);
  const alerts = data ?? [];

  return (
    <InfoCard title="Active Alerts">
      <div className="space-y-3">
        <LoadState loading={loading} error={error} />
        {!loading && !error && alerts.length === 0 ? <p className="text-sm text-slate-500">No active alerts. All locations are in safe condition.</p> : null}
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{alert.title}</p>
                <p className="mt-1 text-sm text-slate-500">{alert.message}</p>
              </div>
              <StatusBadge status={alert.severity} />
            </div>
          </div>
        ))}
      </div>
    </InfoCard>
  );
}
