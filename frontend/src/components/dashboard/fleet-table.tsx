"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Vehicle } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortKey = keyof Vehicle;

export function FleetTable({ data }: { data: Vehicle[] }) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>({ key: "vehicle_id", direction: "ascending" });

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortConfig.direction === 'ascending' ? 
      <ArrowUpDown className="ml-2 h-4 w-4" /> : 
      <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  }

  const statusVariant = {
    free: "default",
    busy: "secondary",
    charging: "outline",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Fleet Status</CardTitle>
        <CardDescription>
          Real-time status of all vehicles in the fleet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("vehicle_id")}>
                    Vehicle ID
                    {getSortIcon("vehicle_id")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("type")}>
                    Type
                    {getSortIcon("type")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("soc")}>
                    SOC (%)
                    {getSortIcon("soc")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort("status")}>
                    Status
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((vehicle) => (
                <TableRow key={vehicle.id} className="transition-colors">
                  <TableCell className="font-medium font-code">{vehicle.vehicle_id}</TableCell>
                  <TableCell>
                    <Badge variant={vehicle.type === 'EV' ? 'default' : 'secondary'} className={cn(vehicle.type === 'EV' && 'bg-primary/80 text-primary-foreground')}>
                      {vehicle.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.type === 'EV' ? `${vehicle.soc.toFixed(0)}%` : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[vehicle.status] as any} className="capitalize">
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
