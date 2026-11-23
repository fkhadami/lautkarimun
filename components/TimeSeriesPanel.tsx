import type { TimeSeries } from "@/lib/types";

const metrics = [
  { key: "wave_height", label: "Wave Height", unit: "m", color: "#0f766e" },
  { key: "wind_speed", label: "Wind Speed", unit: "kn", color: "#2563eb" },
  { key: "current_speed", label: "Current Speed", unit: "kn", color: "#f59e0b" },
] as const;

export function TimeSeriesPanel({ series }: { series: TimeSeries }) {
  const recent = series.points.slice(-12).reverse();

  return (
    <section className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm lg:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">History and Forecast</h2>
          <p className="mt-1 text-sm text-slate-500">
            Past {series.past_days} day and next {series.forecast_days} days, every 6 hours.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.key} className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{metric.label}</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{metric.unit}</span>
            </div>
            <MetricChart
              color={metric.color}
              points={series.points}
              valueKey={metric.key}
            />
          </article>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Time</th>
              <th className="pb-3 font-medium">Period</th>
              <th className="pb-3 font-medium">Risk</th>
              <th className="pb-3 font-medium">Wave</th>
              <th className="pb-3 font-medium">Wind</th>
              <th className="pb-3 font-medium">Current</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((point) => (
              <tr key={point.time} className="border-t border-slate-100">
                <td className="py-3">{formatTime(point.time)}</td>
                <td className="py-3 capitalize">{point.period}</td>
                <td className="py-3 capitalize">{point.risk_status}</td>
                <td className="py-3">{point.wave_height} m</td>
                <td className="py-3">{point.wind_speed} kn</td>
                <td className="py-3">{point.current_speed} kn</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MetricChart({
  color,
  points,
  valueKey,
}: {
  color: string;
  points: TimeSeries["points"];
  valueKey: "wave_height" | "wind_speed" | "current_speed";
}) {
  const values = points.map((point) => point[valueKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const width = 320;
  const height = 120;
  const axisWidth = 28;
  const plotWidth = width - axisWidth;
  const dateLabels = buildDateLabels(points, width);
  const path = points
    .map((point, index) => {
      const x = axisWidth + (index / Math.max(points.length - 1, 1)) * plotWidth;
      const y = height - ((point[valueKey] - min) / span) * (height - 12) - 6;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const forecastStart = points.findIndex((point) => point.period === "forecast");
  const splitX =
    forecastStart > 0
      ? axisWidth + (forecastStart / Math.max(points.length - 1, 1)) * plotWidth
      : null;
  const yTicks = [
    { value: max, y: 6 },
    { value: roundTick(min + span / 2), y: height / 2 },
    { value: min, y: height - 6 },
  ];

  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} className="mt-4 h-36 w-full overflow-visible">
      <line x1={axisWidth} y1="0" x2={axisWidth} y2={height} stroke="#cbd5e1" />
      {splitX ? <line x1={splitX} y1="0" x2={splitX} y2={height} stroke="#cbd5e1" strokeDasharray="4 4" /> : null}
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {points.map((point, index) => {
        const x = axisWidth + (index / Math.max(points.length - 1, 1)) * plotWidth;
        const y = height - ((point[valueKey] - min) / span) * (height - 12) - 6;
        return <circle key={point.time} cx={x} cy={y} r="3" fill={color} />;
      })}
      {yTicks.map((tick) => (
        <g key={`${tick.value}-${tick.y}`}>
          <line x1={axisWidth - 4} y1={tick.y} x2={axisWidth} y2={tick.y} stroke="#cbd5e1" />
          <text x={axisWidth - 6} y={tick.y + 3} textAnchor="end" fontSize="10" fill="#64748b">
            {tick.value}
          </text>
        </g>
      ))}
      {dateLabels.map((label) => (
        <g key={label.text}>
          <line x1={label.x} y1={height - 6} x2={label.x} y2={height} stroke="#cbd5e1" />
          <text x={label.x} y={height + 16} textAnchor="middle" fontSize="10" fill="#64748b">
            {label.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

function formatTime(value: string) {
  return value.replace("T", " ");
}

function buildDateLabels(points: TimeSeries["points"], width: number) {
  const axisWidth = 28;
  const plotWidth = width - axisWidth;
  const labels: Array<{ x: number; text: string }> = [];
  points.forEach((point, index) => {
    if (!point.time.endsWith("00:00")) return;
    const x = axisWidth + (index / Math.max(points.length - 1, 1)) * plotWidth;
    labels.push({ x, text: formatDate(point.time) });
  });
  return labels;
}

function formatDate(value: string) {
  const [date] = value.split("T");
  return date.slice(5);
}

function roundTick(value: number) {
  return Math.round(value * 10) / 10;
}
