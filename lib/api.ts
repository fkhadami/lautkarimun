// Client-side data layer: fetches Open-Meteo directly from the browser
// (port of the former FastAPI backend so the site can be hosted statically).
import type { Alert, Location, RiskStatus, Summary, TimeSeries, TimeSeriesPoint } from "@/lib/types";
import catalogJson from "@/lib/locations.json";

type CatalogEntry = { id: string; name: string; lat: number; lng: number };

const WEATHER_API_URL =
  process.env.NEXT_PUBLIC_OPEN_METEO_WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast";
const MARINE_API_URL =
  process.env.NEXT_PUBLIC_OPEN_METEO_MARINE_API_URL || "https://marine-api.open-meteo.com/v1/marine";
const TIMEZONE = "Asia/Jakarta";
const CACHE_TTL_MS = 15 * 60 * 1000;

export const catalog: CatalogEntry[] = (catalogJson as { locations: CatalogEntry[] }).locations;

let locationCache: { expiresAt: number; data: Location[] } | null = null;

async function fetchJson(base: string, params: Record<string, string | number>): Promise<any> {
  const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const response = await fetch(`${base}?${query.toString()}`);
  if (!response.ok) throw new Error(`Failed to fetch upstream data from ${base}`);
  return response.json();
}

const asList = (payload: any): any[] => (Array.isArray(payload) ? payload : [payload]);
const csv = (key: "lat" | "lng") => catalog.map((row) => row[key]).join(",");
const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;
const kmhToKnots = (speed: number) => speed * 0.539957;

export async function getLocations(): Promise<Location[]> {
  if (locationCache && locationCache.expiresAt > Date.now()) return locationCache.data;
  const [weather, marine] = await Promise.all([
    fetchJson(WEATHER_API_URL, {
      latitude: csv("lat"),
      longitude: csv("lng"),
      current: "wind_speed_10m",
      wind_speed_unit: "kn",
      timezone: TIMEZONE,
      forecast_days: 1,
    }),
    fetchJson(MARINE_API_URL, {
      latitude: csv("lat"),
      longitude: csv("lng"),
      current: "wave_height,ocean_current_velocity,sea_level_height_msl",
      hourly: "sea_level_height_msl",
      length_unit: "metric",
      timezone: TIMEZONE,
      forecast_days: 1,
      cell_selection: "sea",
    }),
  ]);
  const weatherRows = asList(weather);
  const marineRows = asList(marine);
  const data = catalog.map((location, idx) => mergeLocation(location, weatherRows[idx], marineRows[idx]));
  locationCache = { expiresAt: Date.now() + CACHE_TTL_MS, data };
  return data;
}

export async function getLocationForecast(id: string): Promise<Location | null> {
  const locations = await getLocations();
  return locations.find((row) => row.id === id) ?? null;
}

export async function getAlerts(): Promise<Alert[]> {
  const locations = await getLocations();
  return locations
    .filter((location) => location.risk_status !== "safe")
    .map((location) => ({
      id: `alert-${location.id}`,
      location_id: location.id,
      title: location.risk_status === "danger" ? "High wave advisory" : "Moderate weather caution",
      severity: location.risk_status,
      message: `${location.name} wave height is ${location.wave_height} m with ${location.wind_speed.toFixed(1)} knots wind and ${location.current_speed.toFixed(1)} knots current.`,
    }));
}

export async function getLocationTimeSeries(id: string, pastDays = 1, forecastDays = 3): Promise<TimeSeries> {
  const location = catalog.find((row) => row.id === id);
  if (!location) throw new Error("Location not found");
  const [weather, marine] = await Promise.all([
    fetchJson(WEATHER_API_URL, {
      latitude: location.lat,
      longitude: location.lng,
      hourly: "wind_speed_10m",
      wind_speed_unit: "kn",
      timezone: TIMEZONE,
      past_days: pastDays,
      forecast_days: forecastDays,
      cell_selection: "sea",
    }),
    fetchJson(MARINE_API_URL, {
      latitude: location.lat,
      longitude: location.lng,
      hourly: "wave_height,ocean_current_velocity,sea_level_height_msl",
      timezone: TIMEZONE,
      length_unit: "metric",
      past_days: pastDays,
      forecast_days: forecastDays,
      cell_selection: "sea",
    }),
  ]);

  const windMap = new Map<string, number>();
  (weather.hourly?.time ?? []).forEach((t: string, i: number) => windMap.set(t, weather.hourly.wind_speed_10m[i]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });

  const hourly = marine.hourly ?? { time: [] };
  const points: TimeSeriesPoint[] = [];
  hourly.time.forEach((t: string, i: number) => {
    if (Number(t.split("T")[1].slice(0, 2)) % 6 !== 0) return;
    const wave = hourly.wave_height[i];
    const current = hourly.ocean_current_velocity[i];
    const sea = hourly.sea_level_height_msl[i];
    if (wave == null || current == null || sea == null) return;
    points.push({
      time: t,
      wave_height: round(wave, 2),
      wind_speed: round(windMap.get(t) ?? 0, 1),
      current_speed: round(kmhToKnots(current), 1),
      sea_level: round(sea, 3),
      risk_status: classifyRisk(wave),
      period: t.slice(0, 10) >= today ? "forecast" : "history",
    });
  });

  return {
    location_id: location.id,
    location_name: location.name,
    past_days: pastDays,
    forecast_days: forecastDays,
    points,
  };
}

export function buildSummary(forecast: Location, series: TimeSeries | null): Summary {
  const tide = forecast.tide_condition.toLowerCase();
  let text: string;
  if (forecast.risk_status === "danger") {
    text = `${forecast.name} shows dangerous sea conditions. Waves are at ${forecast.wave_height} m with ${tide} tide, so non-essential operations should be delayed.`;
  } else if (forecast.risk_status === "warning") {
    text = `${forecast.name} is under caution. Waves near ${forecast.wave_height} m and winds at ${forecast.wind_speed} knots require tighter route planning.`;
  } else {
    text = `${forecast.name} is currently in a safer operating window. Wave height is ${forecast.wave_height} m with ${forecast.current_speed} knots current speed.`;
  }
  const fc = series?.points.filter((p) => p.period === "forecast") ?? [];
  if (series && fc.length) {
    const peak = fc.reduce((a, b) => (b.wave_height > a.wave_height ? b : a));
    const maxWind = Math.max(...fc.map((p) => p.wind_speed));
    const when = peak.time.replace("T", " ");
    if (peak.risk_status === "danger") {
      text += ` Forecast analysis shows the highest risk at ${when} with waves reaching ${peak.wave_height} m. Conditions may escalate to danger, so routing and operations should be reviewed in advance.`;
    } else if (peak.risk_status === "warning") {
      text += ` Forecast analysis indicates a caution window around ${when} with waves up to ${peak.wave_height} m and winds peaking near ${maxWind} knots.`;
    } else {
      text += ` Forecast analysis for the next ${series.forecast_days} days remains relatively stable. The highest projected wave is ${peak.wave_height} m at ${when}, with peak winds around ${maxWind} knots.`;
    }
  }
  return { location_id: forecast.id, summary: text };
}

function mergeLocation(location: CatalogEntry, weather: any, marine: any): Location {
  const current = marine.current;
  return {
    ...location,
    wave_height: round(current.wave_height, 2),
    wind_speed: round(weather.current.wind_speed_10m, 1),
    current_speed: round(kmhToKnots(current.ocean_current_velocity), 1),
    tide_condition: deriveTide(marine.hourly, current),
    risk_status: classifyRisk(current.wave_height),
    source: "open-meteo",
    updated_at: weather.current.time,
  };
}

function deriveTide(hourly: any, current: any): string {
  const pairs: [string, number][] = (hourly?.time ?? [])
    .map((t: string, i: number) => [t, hourly.sea_level_height_msl[i]] as [string, number])
    .filter(([, level]: [string, number]) => level != null);
  if (!pairs.length) return "Unknown";
  const levels = pairs.map(([, l]) => l);
  const level = current.sea_level_height_msl;
  const high = Math.max(...levels);
  const low = Math.min(...levels);
  const spread = Math.max(high - low, 0.01);
  if (Math.abs(level - high) <= spread * 0.08) return "High";
  if (Math.abs(level - low) <= spread * 0.08) return "Low";
  const times = pairs.map(([t]) => t);
  const idx = times.indexOf(current.time);
  const mid = idx >= 0 ? idx : Math.max(times.length - 2, 0);
  const next = levels[Math.min(mid + 1, levels.length - 1)];
  return next >= level ? "Rising" : "Falling";
}

export function classifyRisk(waveHeight: number): RiskStatus {
  if (waveHeight < 1.25) return "safe";
  if (waveHeight <= 2.5) return "warning";
  return "danger";
}

export function statusColor(status: RiskStatus): string {
  return { safe: "#10b981", warning: "#f59e0b", danger: "#f43f5e" }[status];
}
