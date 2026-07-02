import { Bike, Zap } from "lucide-react";
import type { Vehicle } from "@/lib/store";
import { formatCurrency } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function VehicleCard({
  vehicle,
  onBook,
}: {
  vehicle: Vehicle;
  onBook?: (v: Vehicle) => void;
}) {
  const Icon = vehicle.type === "Bike" ? Bike : Zap;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="card-vehicle relative flex h-44 items-center justify-center">
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-20 w-20 text-primary-foreground/90 drop-shadow" strokeWidth={1.5} />
        )}
        <Badge
          className={cn(
            "absolute right-3 top-3 border-0",
            vehicle.available ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
          )}
        >
          {vehicle.available ? "Available" : "Unavailable"}
        </Badge>
        <Badge variant="secondary" className="absolute left-3 top-3">
          {vehicle.type}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold">{vehicle.name}</h3>
            <p className="text-xs text-muted-foreground">
              {vehicle.brand} · {vehicle.model}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(vehicle.dailyPrice)}</div>
            <div className="text-xs text-muted-foreground">per day</div>
          </div>
          <Button
            size="sm"
            disabled={!vehicle.available}
            onClick={() => onBook?.(vehicle)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
