export function DataSourceNote({ source }: { source: string }) {
  return (
    <p className="text-xs text-slate-500">
      Data source: {formatSource(source)}. Marine conditions from Open-Meteo Marine API and wind data from
      {" "}Open-Meteo Forecast API.
    </p>
  );
}

function formatSource(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("-");
}
