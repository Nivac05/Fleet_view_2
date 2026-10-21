"use client";

import { useEffect, useState } from "react";
import type { DemandForecast } from "@/types";
import { DemandForecastChart as Chart } from "@/components/dashboard/demand-forecast-chart";

export function DemandForecastChart() {
  const [data, setData] = useState<DemandForecast[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
    const es = new EventSource(`${apiBase}/stream`);

    es.onmessage = (e) => {
      try {
        const rows = JSON.parse(e.data) as any[];
        if (!rows.length) return;

        // format all rows in this batch
        const formatted: DemandForecast[] = rows.map((r) => {
          const p50 = r.p50 ?? r.demand ?? 0;
          const lo = r.lower ?? (p50 - 10);
          const hi = r.upper ?? (p50 + 10);
          const t = r.time ?? r.Time;
          const iso =
            typeof t === "string"
              ? new Date(t).toISOString()
              : new Date(t).toISOString();

          return { time: iso, p50, p90_range: [lo, hi] };
        });

        // append batch, but keep only last 7 points overall
        setData((prev) => {
          const next = [...prev, ...formatted];
          return next.slice(-7);
        });
      } catch (err) {
        console.error("Stream parse error:", err, e.data);
      }
    };

    es.onerror = (err) => {
      console.warn("EventSource stream waiting for backend connection...", err);
    };

    return () => {
      es.close();
    };
  }, []);

  return <Chart data={data} />;
}
