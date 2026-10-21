"use client";

import type { Kpi } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Percent, Upload, Car, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { useRef, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { provideFleetOptimizationSuggestions } from "@/ai/flows/fleet-optimization-suggestions";
import { improveDemandForecast } from "@/ai/flows/improve-demand-forecast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

function KpiCard({ title, value, icon: Icon, description }: KpiCardProps) {
  return (
    <Card className="transition-all hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium font-body">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-headline text-primary">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
            </CardContent>
        </Card>
    );
}

export function KpiSidebar({ kpis, loading }: { kpis: Kpi | null, loading: boolean }) {
  const { toast } = useToast();
  const fleetInputRef = useRef<HTMLInputElement>(null);
  const demandInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: `${type} file uploaded`,
        description: `Successfully uploaded ${file.name}`,
      });
      // For demonstration, we'll log the file info. In a real app, you'd process the file.
      console.log(`Uploaded ${type} file:`, file.name, file.size);
      // Reset the input value to allow uploading the same file again
      event.target.value = "";
    }
  };

  const handleGenAIOptimization = () => {
    startTransition(async () => {
      try {
        const result = await provideFleetOptimizationSuggestions({
          fleetCurrentData: '{"info": "dummy fleet data"}',
          demandForecastData: '{"info": "dummy demand data"}',
          kpiData: JSON.stringify(kpis)
        });
        setSuggestion(result.suggestions);
        setIsModalOpen(true);
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Error generating suggestions",
          description: "There was an issue with the AI model. Please try again.",
        });
      }
    });
  }

  const handleGenAIDemand = () => {
    startTransition(async () => {
      try {
        const result = await improveDemandForecast({
          historicalDemandData: '{"info": "dummy historical data"}',
          externalFactors: '{"info": "dummy external factors"}'
        });
        setSuggestion(result.analysis);
        setIsModalOpen(true);
      } catch (e) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "Error improving forecast",
          description: "There was an issue with the AI model. Please try again.",
        });
      }
    });
  }

  const kpiContent = (
    <>
      <KpiCard
        title="Requests Served"
        value={kpis!.requests_served}
        icon={Users}
      />
      <KpiCard
        title="Avg. Wait Time"
        value={`${kpis!.avg_wait.toFixed(1)}m`}
        icon={Clock}
      />
      <KpiCard
        title="P90 Wait Time"
        value={`${kpis!.p90_wait.toFixed(1)}m`}
        icon={Clock}
      />
      <KpiCard
        title="EV vs ICE Trips"
        value={`${kpis!.ev_trips} / ${kpis!.ice_trips}`}
        icon={Car}
        description="Last hour"
      />
      <KpiCard
        title="Fleet Utilization"
        value={`${kpis!.utilization.toFixed(1)}%`}
        icon={Percent}
      />
    </>
  );

  const uploadContent = (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium font-body">
          Data Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <input
          type="file"
          ref={fleetInputRef}
          onChange={(e) => handleFileUpload(e, "Fleet")}
          className="hidden"
          accept=".csv"
        />
        <Button variant="outline" onClick={() => fleetInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Fleet CSV
        </Button>
        <input
          type="file"
          ref={demandInputRef}
          onChange={(e) => handleFileUpload(e, "Demand")}
          className="hidden"
          accept=".csv"
        />
        <Button variant="outline" onClick={() => demandInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Demand CSV
        </Button>
      </CardContent>
    </Card>
  );

  const aiContent = (
     <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium font-body">
          GenAI Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button onClick={handleGenAIOptimization} disabled={isPending}>
          <Bot className="mr-2 h-4 w-4" />
          {isPending ? 'Analyzing...' : 'Get Fleet Suggestions'}
        </Button>
         <Button onClick={handleGenAIDemand} disabled={isPending} variant="secondary">
          <Bot className="mr-2 h-4 w-4" />
          {isPending ? 'Analyzing...' : 'Improve Demand Forecast'}
        </Button>
      </CardContent>
    </Card>
  )

  const content = (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="font-headline text-lg font-semibold px-2">Live KPIs</h2>
        {loading || !kpis ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />) : kpiContent}
        
        {loading ? <Skeleton className="h-[140px]" /> : uploadContent}

        {loading ? <Skeleton className="h-[140px]" /> : aiContent}
      </div>

       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">AI Suggestion</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm text-muted-foreground pt-4">
                <p className="whitespace-pre-wrap">{suggestion}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      {content}
    </div>
  );
}
