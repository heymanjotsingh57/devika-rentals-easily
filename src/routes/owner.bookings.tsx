import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, CheckCircle2, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, useStore, type Booking } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/owner/bookings")({
  component: OwnerBookings,
});

function OwnerBookings() {
  const { bookings, vehicles, updateBooking, updateVehicle } = useStore();
  const [q, setQ] = useState("");
  const [view, setView] = useState<Booking | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return bookings;
    return bookings.filter((b) => {
      const v = vehicles.find((x) => x.id === b.vehicleId);
      return (
        b.customerName.toLowerCase().includes(s) ||
        b.phone.includes(s) ||
        b.id.toLowerCase().includes(s) ||
        (v?.name.toLowerCase().includes(s) ?? false)
      );
    });
  }, [bookings, vehicles, q]);

  const cancel = (b: Booking) => {
    if (!confirm("Cancel this booking?")) return;
    updateBooking(b.id, { status: "cancelled" });
    updateVehicle(b.vehicleId, { available: true });
    toast.success("Booking cancelled");
  };
  const complete = (b: Booking) => {
    updateBooking(b.id, { status: "completed" });
    updateVehicle(b.vehicleId, { available: true });
    toast.success("Marked as completed");
  };

  const statusVariant = (s: Booking["status"]) =>
    s === "confirmed"
      ? "bg-primary/15 text-primary"
      : s === "completed"
        ? "bg-success/15 text-success"
        : "bg-destructive/15 text-destructive";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Bookings</h1>
          <p className="text-sm text-muted-foreground">Search, view and manage every reservation.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customer, phone, ID, vehicle" className="pl-9" />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-semibold">No bookings found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3 text-left">Booking</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Vehicle</th>
                <th className="p-3 text-left">Dates</th>
                <th className="p-3 text-left">Gov ID</th>
                <th className="p-3 text-right">Deposit</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((b) => {
                const v = vehicles.find((x) => x.id === b.vehicleId);
                return (
                  <tr key={b.id}>
                    <td className="p-3 font-mono text-xs">{b.id}</td>
                    <td className="p-3">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-muted-foreground">{b.phone}</div>
                    </td>
                    <td className="p-3">{v?.name ?? "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {b.startDate}<br />→ {b.endDate}
                    </td>
                    <td className="p-3">
                      {b.govIdData?.startsWith("data:image") ? (
                        <img src={b.govIdData} alt={b.govIdName} className="h-10 w-14 rounded border border-border object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{b.govIdName || "—"}</span>
                      )}
                    </td>
                    <td className="p-3 text-right">{formatCurrency(b.deposit)}</td>
                    <td className="p-3 text-right font-semibold text-primary">{formatCurrency(b.totalAmount)}</td>
                    <td className="p-3">
                      <Badge className={`${statusVariant(b.status)} border-0 capitalize`}>{b.status}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="outline" onClick={() => setView(b)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {b.status === "confirmed" && (
                          <>
                            <Button size="icon" variant="outline" onClick={() => complete(b)} title="Mark completed">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </Button>
                            <Button size="icon" variant="outline" onClick={() => cancel(b)} title="Cancel">
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking {view?.id}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="grid gap-2 text-sm">
              <Row label="Customer" value={view.customerName} />
              <Row label="Phone" value={view.phone} />
              <Row label="Vehicle" value={vehicles.find((x) => x.id === view.vehicleId)?.name ?? "—"} />
              <Row label="From" value={view.startDate} />
              <Row label="To" value={view.endDate} />
              <Row label="Days" value={String(view.totalDays)} />
              <Row label="Deposit" value={formatCurrency(view.deposit)} />
              <Row label="Total" value={formatCurrency(view.totalAmount)} highlight />
              <Row label="Status" value={view.status} />
              <Row label="Gov ID" value={view.govIdName} />
              {view.govIdData?.startsWith("data:image") && (
                <img src={view.govIdData} alt="ID" className="mt-2 max-h-48 rounded-md border border-border" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-primary" : "font-medium capitalize"}>{value}</span>
    </div>
  );
}
