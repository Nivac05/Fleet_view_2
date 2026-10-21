"use client";

import { useFleetData } from "@/hooks/use-fleet-data";
import { Header } from "@/components/dashboard/header";
import { KpiSidebar } from "@/components/dashboard/kpi-sidebar";
import { MapVisualization } from "@/components/dashboard/map-visualization";
import { WaitTimeChart } from "@/components/dashboard/wait-time-chart";
import { FuelTypeChart } from "@/components/dashboard/fuel-type-chart";
import { UtilizationChart } from "@/components/dashboard/utilization-chart";
import { DemandForecastChart } from "@/components/dashboard/livedata";
import DecisionTable from "@/components/dashboard/table";   // ✅ added

import { FleetTable } from "@/components/dashboard/fleet-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function DashboardPage() {
  const {
    kpis,
    fleetData,
    waitTimeData,
    fuelData,
    utilizationData,
    demandForecastData,
    trips,
    zones,
    loading,
  } = useFleetData();

  const sidebarContent = <KpiSidebar kpis={kpis} loading={loading} />;

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block border-r w-[320px] overflow-y-auto p-4 shrink-0">
          {sidebarContent}
        </div>
        
        <div className="lg:hidden p-2 absolute top-16 left-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 w-[320px] overflow-y-auto">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4 overflow-y-auto flex-1">
          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MapVisualization trips={trips} zones={zones} />
            </div>
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Wait Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-[200px] w-full" /> : <WaitTimeChart data={waitTimeData} />}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Trips by Fuel Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-[200px] w-full" /> : <FuelTypeChart data={fuelData} />}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Utilization Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? <Skeleton className="h-[250px] w-full" /> : <UtilizationChart data={utilizationData} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Demand Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <DemandForecastChart />   {/* live chart */}
              </CardContent>
            </Card>
          </div>

          {/* ✅ Decision Layer Table right below Forecast */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Decision Layer</CardTitle>
              </CardHeader>
              <CardContent>
                <DecisionTable />
              </CardContent>
            </Card>
          </div>
          
          <div className="xl:col-span-3">
            {loading ? <Skeleton className="h-[400px] w-full" /> : <FleetTable data={fleetData} />}
          </div>
        </div>
      </main>
    </div>
  );
  
}
