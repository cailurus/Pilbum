"use client";

import { useEffect, useRef, useState } from "react";

interface MapDisplayProps {
  lat: number;
  lng: number;
}

// Check if Leaflet is already loaded
function isLeafletLoaded(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== "undefined" && !!(window as any).L;
}

// Load Leaflet CSS
function loadLeafletCSS(): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector('link[href*="leaflet.css"]')) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.onload = () => resolve();
    link.onerror = () => resolve(); // Continue even if CSS fails
    document.head.appendChild(link);
  });
}

// Load Leaflet JS
function loadLeafletJS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLeafletLoaded()) {
      resolve();
      return;
    }
    if (document.querySelector('script[src*="leaflet.js"]')) {
      // Script is loading, wait for it
      const checkLoaded = setInterval(() => {
        if (isLeafletLoaded()) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Leaflet"));
    document.head.appendChild(script);
  });
}

export function MapDisplay({ lat, lng }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (!mapRef.current) return;

      try {
        // Load Leaflet
        await loadLeafletCSS();
        await loadLeafletJS();

        if (!mounted || !mapRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        if (!L) {
          throw new Error("Leaflet not available");
        }

        // Destroy existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Create map
        const map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: false,
        }).setView([lat, lng], 13);

        // Add tile layer with error handling
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        // Add marker
        L.marker([lat, lng]).addTo(map);

        mapInstanceRef.current = map;
        setLoading(false);
      } catch (err) {
        console.error("Map init error:", err);
        if (mounted) {
          setError("地图加载失败");
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  if (error) {
    return (
      <div className="w-full h-48 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <div className="text-center text-neutral-500 dark:text-neutral-400">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
            <path d="M12 21c-4-4-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-4 8-8 12z" />
            <circle cx="12" cy="9" r="3" />
          </svg>
          <p className="text-xs">{error}</p>
          <p className="text-xs mt-1">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-600 dark:border-t-neutral-300 rounded-full animate-spin" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
