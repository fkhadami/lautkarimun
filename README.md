# Laut Karimun — Sinergi Karimunjawa

Sinergi Peningkatan Literasi Cuaca Maritim Berbasis Komunitas.

Live site: https://fkhadami.github.io/lautkarimun/

Static version of the `karimun` Maritime Weather Intelligence MVP, built for GitHub Pages.
The former FastAPI backend logic (risk classification, alerts, tide condition, summary, time series)
now runs in the browser (`lib/api.ts`), fetching live data directly from:

- Open-Meteo Marine API (wave height, ocean current, sea level)
- Open-Meteo Forecast API (10 m wind)

Map: Leaflet + OpenStreetMap tiles.

## Pages

- `/dashboard` — map + regional snapshot
- `/risk-map` — colour-coded risk map (wave thresholds: < 1.25 m safe, ≤ 2.5 m warning, > 2.5 m danger)
- `/alerts` — active alerts
- `/location/<id>` — sea-state snapshot, summary, 1-day history + 3-day forecast

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy

Every push to `main` builds a static export (`next build`, `output: "export"`) and publishes
`out/` to the `gh-pages` branch via GitHub Actions.

To add a location, edit `lib/locations.json`.
