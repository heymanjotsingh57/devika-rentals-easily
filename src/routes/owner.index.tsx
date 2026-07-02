import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bike, CheckCircle2, ClipboardList, IndianRupee, XCircle } from "lucide-react";
import { formatCurrency, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/")({
  component: Dashboard,
});

function Dashboard() {
  const { vehicles, bookings } = useStore();

  const stats = useMemo(() => {
    const totalVehicles = vehicles.length;
    const available = vehicles.filter((v) => v.available).length;
    const booked = totalVehicles - available;
    const totalBookings = bookings.length;
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + b.totalAmount, 0);
    return { totalVehicles, available, booked, totalBookings, revenue };
  }, [vehicles, bookings]);

  const cards = [
    { label: "Total Vehicles", value: stats.totalVehicles, icon: Bike, tone: "text-primary bg-primary/10" },
    { label: "Available", value: stats.available, icon: CheckCircle2, tone: "text-success bg-success/10" },
    { label: "Booked", value: stats.booked, icon: XCircle, tone: "text-warning bg-warning/10" },
    { label: "Total Bookings", value: stats.totalBookings, icon: ClipboardList, tone: "text-primary bg-primary/10" },
    { label: "Revenue Estimate", value: formatCurrency(stats.revenue), icon: IndianRupee, tone: "text-success bg-success/10" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground">A quick pulse of your rental business.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <span className={cn("grid h-8 w-8 place-items-center rounded-lg", c.tone)}>
                <c.icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold">Recent Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No bookings yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {bookings.slice(0, 5).map((b) => {
              const v = vehicles.find((x) => x.id === b.vehicleId);
              return (
                <div key={b.id} className="grid grid-cols-[1fr_auto] gap-2 p-4 sm:flex sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.customerName} · <span className="text-muted-foreground">{b.id}</span></p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v?.name ?? "Vehicle removed"} · {b.startDate} → {b.endDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(b.totalAmount)}</p>
                    <p className="text-xs capitalize text-muted-foreground">{b.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
