"use client";

import { useEffect, useRef, useState } from "react";

interface MapDisplayProps {
  lat: number;
  lng: number;
}

export function MapDisplay({ lat, lng }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || loaded) return;

    // Dynamically load Leaflet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );

      L.marker([lat, lng]).addTo(map);
      setLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, [lat, lng, loaded]);

  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-xl overflow-hidden bg-neutral-900"
    />
  );
}
