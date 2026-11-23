export function LoadState({ loading, error }: { loading: boolean; error?: string }) {
  if (loading) return <p className="text-sm text-slate-500">Loading live data from Open-Meteo...</p>;
  if (error) return <p className="text-sm text-rose-600">Data unavailable: {error}</p>;
  return null;
}
