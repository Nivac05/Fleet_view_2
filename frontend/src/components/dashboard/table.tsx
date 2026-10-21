"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap, Fuel, Layers } from "lucide-react";

interface ZoneAlloc {
  zone: string;
  demand: number;
  alloc_ev: number;
  alloc_ice: number;
  alloc_total: number;
  capacity_est: number;
  unserved: number;
}

interface Reposition {
  from: string;
  to: string;
  count: number;
}

interface DecisionData {
  zone_alloc: ZoneAlloc[];
  reposition_ev: Reposition[];
  reposition_ice: Reposition[];
}

export default function DecisionTable() {
  const [data, setData] = useState<DecisionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

    async function fetchData() {
      try {
        const res = await fetch(`${apiBase}/decision_layer?horizon=12`);
        if (!res.ok) throw new Error("Failed to fetch decision layer");
        const json = await res.json();
        setData({
          zone_alloc: json.zone_alloc || [],
          reposition_ev: json.reposition_ev || [],
          reposition_ice: json.reposition_ice || [],
        });
      } catch (err: any) {
        setError(err.message);
      }
    }

    fetchData();

    // Live SSE stream
    const es = new EventSource(`${apiBase}/decision_stream`);
    es.onmessage = (e) => {
      try {
        const json = JSON.parse(e.data);
        setData({
          zone_alloc: json.zone_alloc || [],
          reposition_ev: json.reposition_ev || [],
          reposition_ice: json.reposition_ice || [],
        });
      } catch (err) {
        console.error("Decision stream parse error:", err);
      }
    };

    es.onerror = (err) => {
      console.warn("Decision stream connecting...", err);
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-400">
        Connecting to optimization service... ({error})
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-muted-foreground animate-pulse">
        Computing multi-zone optimization heuristics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Zone Allocation Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Per-Zone Allocation & Estimated Capacity
          </h3>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-[11px] font-medium border-b border-border/60">
              <tr>
                <th className="px-4 py-2.5">Zone</th>
                <th className="px-4 py-2.5 text-right">Demand</th>
                <th className="px-4 py-2.5 text-center">EV Alloc</th>
                <th className="px-4 py-2.5 text-center">ICE Alloc</th>
                <th className="px-4 py-2.5 text-center">Total Units</th>
                <th className="px-4 py-2.5 text-right">Capacity Est.</th>
                <th className="px-4 py-2.5 text-right">Unserved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.zone_alloc.map((z, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground">{z.zone}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-purple-400 font-semibold">{z.demand?.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                      ⚡ {z.alloc_ev}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      🚗 {z.alloc_ice}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-semibold font-mono text-foreground">{z.alloc_total}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">{z.capacity_est?.toFixed(1)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {z.unserved > 0 ? (
                      <span className="text-amber-400 font-medium">+{z.unserved?.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted-foreground">0.0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reposition Moves Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EV Reposition */}
        <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-purple-400">
              <Zap className="h-3.5 w-3.5" />
              Dynamic Repositioning (EV)
            </h4>
            <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/30">
              {data.reposition_ev.length} Actions
            </Badge>
          </div>
          <div className="p-3">
            {data.reposition_ev.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-2">Fleet balanced. No EV repositioning required.</p>
            ) : (
              <div className="space-y-2">
                {data.reposition_ev.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{r.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.to}</span>
                    </div>
                    <span className="font-mono font-semibold text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40">
                      +{r.count} EVs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ICE Reposition */}
        <div className="rounded-lg border border-border/60 overflow-hidden bg-card/40">
          <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <h4 className="text-xs font-semibold flex items-center gap-1.5 text-cyan-400">
              <Fuel className="h-3.5 w-3.5" />
              Dynamic Repositioning (ICE)
            </h4>
            <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30">
              {data.reposition_ice.length} Actions
            </Badge>
          </div>
          <div className="p-3">
            {data.reposition_ice.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-2">Fleet balanced. No ICE repositioning required.</p>
            ) : (
              <div className="space-y-2">
                {data.reposition_ice.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{r.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.to}</span>
                    </div>
                    <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      +{r.count} ICE
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
