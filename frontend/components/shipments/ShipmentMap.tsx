"use client";

import { useEffect, useState } from "react";

interface Props { origin: string; destination: string; }
type LatLng = [number, number];

async function geocode(place: string): Promise<LatLng | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (!data.length) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {
    return null;
  }
}

export default function ShipmentMap({ origin, destination }: Props) {
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([geocode(origin), geocode(destination)]).then(([from, to]) => {
      if (!from || !to) { setError(true); return; }
      const pad = 2;
      const left   = Math.min(from[1], to[1]) - pad;
      const bottom = Math.min(from[0], to[0]) - pad;
      const right  = Math.max(from[1], to[1]) + pad;
      const top    = Math.max(from[0], to[0]) + pad;
      setEmbedSrc(
        `https://www.openstreetmap.org/export/embed.html?bbox=${left},${bottom},${right},${top}&layer=mapnik`
      );
    });
  }, [origin, destination]);

  if (error) return null;
  if (!embedSrc) return <div className="h-64 animate-pulse rounded-lg bg-gray-100" aria-busy="true" />;

  return (
    <div
      className="h-64 w-full overflow-hidden rounded-lg border border-gray-200"
      role="img"
      aria-label={`Map from ${origin} to ${destination}`}
    >
      <iframe
        src={embedSrc}
        title={`Route from ${origin} to ${destination}`}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
