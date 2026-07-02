import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/Layout";
import { VehicleCard } from "@/components/VehicleCard";
import { BookingDialog } from "@/components/BookingDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, type Vehicle } from "@/lib/store";

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [
      { title: "Available Vehicles — Devika Rentals" },
      { name: "description", content: "Browse and book bikes and scooters available for rent." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <VehiclesPage />
    </PublicLayout>
  ),
});

function VehiclesPage() {
  const { vehicles } = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | "Bike" | "Scooter">("all");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const [booking, setBooking] = useState<Vehicle | null>(null);

  const list = useMemo(() => {
    let l = vehicles.filter((v) => {
      const matchQ =
        !q ||
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.brand.toLowerCase().includes(q.toLowerCase());
      const matchType = type === "all" || v.type === type;
      return matchQ && matchType;
    });
    if (sort === "asc") l = [...l].sort((a, b) => a.dailyPrice - b.dailyPrice);
    if (sort === "desc") l = [...l].sort((a, b) => b.dailyPrice - a.dailyPrice);
    return l;
  }, [vehicles, q, type, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Available Vehicles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose from scooters and bikes tuned for city rides and weekend trips.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or brand"
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Bike">Bike</SelectItem>
            <SelectItem value="Scooter">Scooter</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Default</SelectItem>
            <SelectItem value="asc">Price: Low to High</SelectItem>
            <SelectItem value="desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-20 text-center">
          <p className="text-lg font-semibold">No vehicles found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onBook={setBooking} />
          ))}
        </div>
      )}

      <BookingDialog
        vehicle={booking}
        open={!!booking}
        onOpenChange={(o) => !o && setBooking(null)}
      />
    </section>
  );
}
