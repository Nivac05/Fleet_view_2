

export interface Vehicle {
  id: string;
  vehicle_id: string;
  type: "EV" | "ICE";
  soc: number;
  status: "free" | "busy" | "charging";
  location: { lat: number; lng: number };
}

export interface Kpi {
  requests_served: number;
  avg_wait: number;
  p90_wait: number;
  ev_trips: number;
  ice_trips: number;
  utilization: number;
}

export interface WaitTime {
  name: string;
  count: number;
}

export interface FuelTrip {
  name: string;
  ev: number;
  ice: number;
}

export interface Utilization {
  time: string;
  utilization: number;
}

export interface DemandForecast {
  time: string;
  p50: number;
  p90_range: [number, number];
}

export interface Trip {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}

export interface Zone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
}
