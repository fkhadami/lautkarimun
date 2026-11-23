"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { statusColor } from "@/lib/api";
import type { Location } from "@/lib/types";

export function LeafletMap({ locations }: { locations: Location[] }) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={5} scrollWheelZoom className="h-[520px] w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <CircleMarker
          key={location.id}
          center={[location.lat, location.lng]}
          pathOptions={{ color: statusColor(location.risk_status), fillOpacity: 0.8 }}
          radius={12}
        >
          <Popup>
            <div className="space-y-2">
              <p className="font-medium">{location.name}</p>
              <p className="text-sm">Wave {location.wave_height} m</p>
              <Link className="text-sm text-sea underline" href={`/location/${location.id}`}>
                View details
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
