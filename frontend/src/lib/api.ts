// src/lib/api.ts
import type { DemandForecast } from "@/types"; // adjust if your type is elsewhere

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export async function fetchForecast(
  horizon = 24,
  lastY?: number
): Promise<DemandForecast[]> {
  const qs = new URLSearchParams({ horizon: String(horizon) });
  if (lastY != null) qs.set("last_y", String(lastY));

  const res = await fetch(`${API_BASE}/forecast?${qs.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as DemandForecast[];
}
