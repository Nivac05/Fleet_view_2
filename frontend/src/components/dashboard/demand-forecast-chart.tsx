"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { DemandForecast } from "@/types";

interface ChartProps {
  data: DemandForecast[];
}

// ✅ export the props type so other components (like livedata.tsx) can reuse it
export type { ChartProps };

export function DemandForecastChart({ data }: ChartProps) {
  // transform API data → flatten tuple into lower/upper
  const chartData = data.map((d) => ({
    time: new Date(d.time).toLocaleTimeString([], { hour: "2-digit" }), // nice x-axis label
    p50: d.p50,
    lower: d.p90_range[0],
    upper: d.p90_range[1],
  }));

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
            }}
          />
          {/* Shaded P90 band */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="hsl(var(--accent) / 0.2)"
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="hsl(var(--background))"
          />
          {/* P50 median line */}
          <Line
            type="monotone"
            dataKey="p50"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
            name="P50 Forecast"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
