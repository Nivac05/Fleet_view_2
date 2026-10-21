"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type Vehicle = {
  id?: string;
  Vehicle_ID: string;
  Vehicle_Type: string;
  Fuel_Type: string;
  Current_Zone?: string;
  Capacity?: number;
  soc?: number;
  lat: number;
  lng: number;
  status?: "free" | "busy" | "charging" | "moving" | "idle";
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function fetchVehicles(): Promise<Vehicle[]> {
  // 1. Try Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("vehicles").select("*");
      if (!error && data && data.length > 0) {
        return data.map((v: any) => ({
          id: v.id || v.vehicle_id,
          Vehicle_ID: v.vehicle_id || v.id,
          Vehicle_Type: v.vehicle_type || "Car",
          Fuel_Type: v.fuel_type || "EV",
          Current_Zone: v.current_zone || "Downtown",
          Capacity: v.capacity || 4,
          soc: v.soc ?? 80,
          lat: Number(v.lat) || 13.0827,
          lng: Number(v.lng) || 80.2707,
          status: v.status || "free",
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch fallback:", err);
    }
  }

  // 2. Try FastAPI Backend
  try {
    const res = await fetch(`${API_BASE}/vehicles`);
    if (res.ok) {
      const data = await res.json();
      return data.map((v: any) => ({
        id: v.id || v.vehicle_id,
        Vehicle_ID: v.vehicle_id || v.id,
        Vehicle_Type: v.vehicle_type || "Car",
        Fuel_Type: v.fuel_type || "EV",
        Current_Zone: v.current_zone || "Downtown",
        Capacity: v.capacity || 4,
        soc: v.soc ?? 80,
        lat: Number(v.lat) || 13.0827,
        lng: Number(v.lng) || 80.2707,
        status: v.status || "free",
      }));
    }
  } catch (err) {
    console.warn("Backend API fallback:", err);
  }

  // 3. Fallback default vehicles (Chennai coordinates)
  return [
    { Vehicle_ID: "FVT-1001", Vehicle_Type: "Car", Fuel_Type: "EV", lat: 13.0827, lng: 80.2707, status: "busy", soc: 85 },
    { Vehicle_ID: "FVT-1002", Vehicle_Type: "Car", Fuel_Type: "ICE", lat: 12.9863, lng: 80.2432, status: "free", soc: 100 },
    { Vehicle_ID: "FVT-1003", Vehicle_Type: "Ambulance", Fuel_Type: "ICE", lat: 13.0732, lng: 80.2376, status: "busy", soc: 100 },
    { Vehicle_ID: "FVT-1004", Vehicle_Type: "Bus", Fuel_Type: "EV", lat: 13.0102, lng: 80.2355, status: "free", soc: 72 },
    { Vehicle_ID: "FVT-1005", Vehicle_Type: "Car", Fuel_Type: "EV", lat: 13.0604, lng: 80.2496, status: "charging", soc: 35 },
    { Vehicle_ID: "FVT-1006", Vehicle_Type: "Car", Fuel_Type: "EV", lat: 13.0359, lng: 80.2144, status: "free", soc: 90 },
    { Vehicle_ID: "FVT-1007", Vehicle_Type: "Car", Fuel_Type: "ICE", lat: 13.0850, lng: 80.2750, status: "busy", soc: 100 },
  ];
}

export function MapVisualization({ trips, zones }: { trips?: any[]; zones?: any[] }) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 1. Dynamically load Leaflet (OpenStreetMap) with zero API keys required
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if Leaflet CSS is already injected
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is already loaded
    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // 2. Initialize Leaflet Map with Dark Theme tiles (CartoDB Dark Matter / OSM)
  useEffect(() => {
    if (!mapLoaded || mapRef.current || typeof window === "undefined") return;

    const L = (window as any).L;
    if (!L) return;

    // Center on Chennai
    const map = L.map("fleet-map-container", {
      center: [13.05, 80.24],
      zoom: 12,
      zoomControl: true,
    });

    // 100% Free, NO API KEY, NO WATERMARK: Esri World Dark Gray Canvas
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapLoaded]);

  // 3. Fetch Vehicles & Subscribe to Supabase Realtime
  useEffect(() => {
    fetchVehicles().then(setVehicles);

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel("realtime:vehicles")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "vehicles" },
          (payload: any) => {
            const updated = payload.new;
            if (!updated) return;
            setVehicles((prev) =>
              prev.map((v) =>
                v.Vehicle_ID === updated.vehicle_id
                  ? {
                      ...v,
                      lat: Number(updated.lat) || v.lat,
                      lng: Number(updated.lng) || v.lng,
                      soc: updated.soc ?? v.soc,
                      status: updated.status || v.status,
                    }
                  : v
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // 4. Render and update vehicle markers smoothly on the map
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;
    const L = (window as any).L;
    if (!L) return;

    vehicles.forEach((v) => {
      const isEv = v.Fuel_Type === "EV";
      const statusColor =
        v.status === "charging"
          ? "#eab308"
          : v.status === "busy"
          ? "#ef4444"
          : "#10b981";

      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #18181b;
          border: 2px solid ${isEv ? "#a855f7" : "#06b6d4"};
          box-shadow: 0 0 10px ${isEv ? "rgba(168,85,247,0.5)" : "rgba(6,182,212,0.5)"};
          color: white;
          font-size: 11px;
          font-weight: bold;
          position: relative;
        ">
          ${v.Vehicle_Type === "Ambulance" ? "🚑" : v.Vehicle_Type === "Bus" ? "🚌" : isEv ? "⚡" : "🚗"}
          <span style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${statusColor};
            border: 1px solid black;
          "></span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "fleet-custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; color: #18181b; min-width: 140px;">
          <strong style="font-size: 13px;">${v.Vehicle_ID}</strong><br/>
          <span>Type: <b>${v.Vehicle_Type} (${v.Fuel_Type})</b></span><br/>
          <span>Battery/Fuel: <b>${v.soc}%</b></span><br/>
          <span>Status: <b style="color: ${statusColor}; text-transform: uppercase;">${v.status}</b></span>
        </div>
      `;

      if (markersRef.current[v.Vehicle_ID]) {
        // Smoothly update existing marker position and popup
        markersRef.current[v.Vehicle_ID].setLatLng([v.lat, v.lng]);
        markersRef.current[v.Vehicle_ID].setPopupContent(popupContent);
      } else {
        // Create new marker
        const marker = L.marker([v.lat, v.lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup(popupContent);
        markersRef.current[v.Vehicle_ID] = marker;
      }
    });
  }, [vehicles, mapLoaded]);

  return (
    <Card className="h-[464px] lg:h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>Live Fleet Map</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry
            </span>
          </span>
          <span className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
            Active Fleet ({vehicles.length} Units)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div
          id="fleet-map-container"
          className="w-full h-full min-h-[380px] bg-zinc-950 rounded-lg relative overflow-hidden border"
        />
      </CardContent>
    </Card>
  );
}