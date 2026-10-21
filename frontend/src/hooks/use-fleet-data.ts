"use client";

import { useState, useEffect } from "react";
import type {
  Vehicle,
  Kpi,
  WaitTime,
  FuelTrip,
  Utilization,
  DemandForecast,
  Trip,
  Zone,
} from "@/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const initialFleet: Vehicle[] = Array.from({ length: 15 }, (_, i) => ({
  id: `v${i + 1}`,
  vehicle_id: `FVT-${1001 + i}`,
  type: i % 2 === 0 ? "EV" : "ICE",
  soc: i % 2 === 0 ? Math.floor(Math.random() * 50) + 50 : 100,
  status: ["free", "busy", "charging"][i % 3] as "free" | "busy" | "charging",
  location: { lat: 13.0827 + (i * 0.003), lng: 80.2707 + (i * 0.003) },
}));

const initialKpis: Kpi = {
  requests_served: 230,
  avg_wait: 5.2,
  p90_wait: 12.8,
  ev_trips: 98,
  ice_trips: 89,
  utilization: 74.5,
};

const initialWaitTime: WaitTime[] = [
  { name: "0-2m", count: 30 },
  { name: "2-5m", count: 75 },
  { name: "5-10m", count: 50 },
  { name: "10-15m", count: 25 },
  { name: "15m+", count: 7 },
];

const initialFuelData: FuelTrip[] = [
  { name: "00:00", ev: 4, ice: 3 },
  { name: "04:00", ev: 6, ice: 5 },
  { name: "08:00", ev: 15, ice: 12 },
  { name: "12:00", ev: 25, ice: 20 },
  { name: "16:00", ev: 30, ice: 28 },
  { name: "20:00", ev: 18, ice: 21 },
];

const initialUtilization: Utilization[] = Array.from({ length: 12 }, (_, i) => ({
  time: `${i * 2}:00`,
  utilization: 60 + Math.sin(i) * 15 + Math.random() * 5,
}));

const initialDemand: DemandForecast[] = Array.from({ length: 12 }, (_, i) => {
  const p50 = 50 + Math.sin(i / 2) * 20;
  return {
    time: `+${i * 2}h`,
    p50: p50,
    p90_range: [p50 - 10, p50 + 10],
  };
});

const initialZones: Zone[] = [
  { id: "zone1", name: "Downtown", center: { lat: 13.0827, lng: 80.2707 }, radius: 80 },
  { id: "zone2", name: "IT Park", center: { lat: 12.9863, lng: 80.2432 }, radius: 50 },
  { id: "zone3", name: "Airport", center: { lat: 12.9941, lng: 80.1709 }, radius: 60 },
];

const initialTrips: Trip[] = Array.from({ length: 5 }, (_, i) => ({
  id: `trip${i}`,
  from: { lat: 13.0827 + (Math.random() - 0.5) * 0.05, lng: 80.2707 + (Math.random() - 0.5) * 0.05 },
  to: { lat: 12.9863 + (Math.random() - 0.5) * 0.05, lng: 80.2432 + (Math.random() - 0.5) * 0.05 },
}));

export function useFleetData() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<Kpi>(initialKpis);
  const [fleetData, setFleetData] = useState<Vehicle[]>(initialFleet);
  const [waitTimeData] = useState<WaitTime[]>(initialWaitTime);
  const [fuelData] = useState<FuelTrip[]>(initialFuelData);
  const [utilizationData, setUtilizationData] = useState<Utilization[]>(initialUtilization);
  const [demandForecastData] = useState<DemandForecast[]>(initialDemand);
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [zones] = useState<Zone[]>(initialZones);

  // Initial fetch from backend / Supabase
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch(`${API_BASE}/kpis`);
        if (res.ok) {
          const kpiJson = await res.json();
          setKpis((prev) => ({ ...prev, ...kpiJson }));
        }
      } catch (err) {
        console.warn("Could not fetch /kpis from backend:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Supabase Realtime Subscription for KPIs
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("realtime:kpis")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kpis" },
        (payload: any) => {
          if (payload.new) {
            setKpis((prev) => ({
              ...prev,
              requests_served: payload.new.requests_served ?? prev.requests_served,
              avg_wait: payload.new.avg_wait ?? prev.avg_wait,
              p90_wait: payload.new.p90_wait ?? prev.p90_wait,
              ev_trips: payload.new.ev_trips ?? prev.ev_trips,
              ice_trips: payload.new.ice_trips ?? prev.ice_trips,
              utilization: payload.new.utilization ?? prev.utilization,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Periodic utilization and trips updates
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      // Dynamic utilization tick
      setUtilizationData((prev) => {
        const last = prev[prev.length - 1];
        const newUtil = {
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
          utilization: Math.max(50, Math.min(95, Math.round(last.utilization + (Math.random() - 0.5) * 3))),
        };
        return [...prev.slice(1), newUtil];
      });

      // Periodic trip updates
      if (Math.random() > 0.6) {
        setTrips((prev) => [
          ...prev.slice(1),
          {
            id: `trip-${Date.now()}`,
            from: { lat: 13.0827 + (Math.random() - 0.5) * 0.05, lng: 80.2707 + (Math.random() - 0.5) * 0.05 },
            to: { lat: 12.9863 + (Math.random() - 0.5) * 0.05, lng: 80.2432 + (Math.random() - 0.5) * 0.05 },
          },
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  return { kpis, fleetData, waitTimeData, fuelData, utilizationData, demandForecastData, trips, zones, loading };
}
