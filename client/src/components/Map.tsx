/// <reference types="google.maps" />

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global { interface Window { google?: typeof google; } }

const API_KEY = import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string | undefined;
let scriptPromise: Promise<void> | null = null;

function loadMapScript() {
  if (window.google?.maps) return Promise.resolve();
  if (!API_KEY) return Promise.reject(new Error("Google Maps key is not configured"));
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tripconnect-maps="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")));
      return;
    }
    const script = document.createElement("script");
    script.dataset.tripconnectMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({ className, initialCenter = { lat: 34.1526, lng: 77.5771 }, initialZoom = 11, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      if (!mapContainer.current || !window.google?.maps) throw new Error("Google Maps is unavailable");
      const map = new window.google.maps.Map(mapContainer.current, { zoom: initialZoom, center: initialCenter, mapTypeControl: false, fullscreenControl: true, zoomControl: true, streetViewControl: false, mapId: "DEMO_MAP_ID" });
      new window.google.maps.Marker({ map, position: initialCenter, title: "TripConnect route" });
      onMapReady?.(map);
    } catch (mapError) {
      console.error("[TripConnect Maps]", mapError);
      setError(mapError instanceof Error ? mapError.message : "Map unavailable");
    }
  });
  useEffect(() => { void init(); }, [init]);
  return <div className={cn("relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#dce7d8]", className)}><div ref={mapContainer} className="absolute inset-0" />{!error && !window.google?.maps && <div className="relative z-10 flex items-center gap-2 rounded-full bg-[#f7f2e9]/90 px-4 py-2 text-xs font-semibold text-[#536651] shadow-sm"><Loader2 className="animate-spin" size={14} />Opening the map...</div>}{error && <div className="relative z-10 max-w-[260px] rounded-2xl bg-[#f7f2e9]/95 p-5 text-center shadow-sm"><MapPin className="mx-auto text-[#c97a5b]" size={24} /><div className="mt-3 text-sm font-bold text-[#2e4036]">Map needs a little setup</div><p className="mt-2 text-xs leading-5 text-[#788078]">Add a referrer-restricted Maps key and enable Maps JavaScript API to show this route.</p></div>}</div>;
}
