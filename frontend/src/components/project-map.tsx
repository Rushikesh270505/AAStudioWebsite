"use client";

import type { LatLngBoundsExpression } from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";

type ProjectMapProps = {
  center: [number, number];
  title: string;
  location: string;
};

export function ProjectMap({ center, title, location }: ProjectMapProps) {
  const bounds: LatLngBoundsExpression = [
    [center[0] - 0.02, center[1] - 0.02],
    [center[0] + 0.02, center[1] + 0.02],
  ];

  return (
    <div className="map-shell h-[360px] overflow-hidden rounded-[28px]">
      <MapContainer bounds={bounds} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker center={center} radius={12} pathOptions={{ color: "#111111", fillColor: "#c8a97e", fillOpacity: 1 }}>
          <Popup>
            <strong>{title}</strong>
            <br />
            {location}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
