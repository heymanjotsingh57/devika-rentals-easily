import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { BookingDialog } from "@/components/BookingDialog";
import { useStore, type Vehicle } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: () => (
    <PublicLayout>
      <Home />
    </PublicLayout>
  ),
});

function Home() {
  const { vehicles } = useStore();
  const featured = vehicles.slice(0, 4);
  const [booking, setBooking] = useState<Vehicle | null>(null);

  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Trusted by 5,000+ riders
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Rent Scooters & Bikes <span className="text-primary">Easily</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
              Skip queues and paperwork. Pick your ride, upload your ID, and hit the road in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/vehicles">
                <Button size="lg" className="gap-2">
                  Book Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">Learn more</Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
              <Perk icon={<Clock className="h-5 w-5" />} label="2-min booking" />
              <Perk icon={<ShieldCheck className="h-5 w-5" />} label="Insured rides" />
              <Perk icon={<Sparkles className="h-5 w-5" />} label="Sanitised" />
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-primary/25 to-primary-glow/25 blur-3xl" />
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((v) => (
                <div key={v.id} className="card-vehicle grid aspect-square place-items-center rounded-2xl border border-border/40 text-center shadow-xl">
                  <div className="px-3">
                    <p className="font-display text-lg font-bold text-primary-foreground">{v.brand}</p>
                    <p className="text-xs text-primary-foreground/80">{v.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured Vehicles</h2>
            <p className="text-sm text-muted-foreground">Fresh from our garage, ready to ride.</p>
          </div>
          <Link to="/vehicles" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <VehicleCard key={v.id} vehicle={v} onBook={setBooking} />
          ))}
        </div>
      </section>

      <BookingDialog vehicle={booking} open={!!booking} onOpenChange={(o) => !o && setBooking(null)} />
    </>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}
