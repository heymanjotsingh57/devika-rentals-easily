import { createFileRoute } from "@tanstack/react-router";
import { Bike, ShieldCheck, MapPin, Users } from "lucide-react";
import { PublicLayout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Devika Rentals" },
      { name: "description", content: "Learn about Devika Rentals — our mission, values, and story." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <About />
    </PublicLayout>
  ),
});

function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">About Devika Rentals</h1>
      <p className="mt-4 text-muted-foreground">
        Devika Rentals started with a simple idea — make city exploration effortless.
        We handpick reliable bikes and scooters, service them weekly, and pass on
        transparent pricing to riders like you.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { icon: <Bike />, title: "50+ Vehicles", desc: "Curated fleet of scooters and bikes." },
          { icon: <ShieldCheck />, title: "Fully Insured", desc: "Every ride is safety-checked and insured." },
          { icon: <MapPin />, title: "3 City Hubs", desc: "Pickup points across the city." },
          { icon: <Users />, title: "5,000+ Riders", desc: "Loved by locals and travellers." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-border bg-card p-5">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              {f.icon}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
