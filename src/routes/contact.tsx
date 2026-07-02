import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Devika Rentals" },
      { name: "description", content: "Reach Devika Rentals for bookings and support." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Contact />
    </PublicLayout>
  ),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success("Message sent! We'll get back to you shortly.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Contact us</h1>
      <p className="mt-2 text-sm text-muted-foreground">We're here to help with bookings, damages or questions.</p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: <Phone />, title: "Phone", value: "+91 98765 43210" },
            { icon: <Mail />, title: "Email", value: "hello@devikarentals.com" },
            { icon: <MapPin />, title: "Address", value: "42 MG Road, Bengaluru 560001" },
            { icon: <Clock />, title: "Working Hours", value: "Mon–Sun · 8:00 AM – 9:00 PM" },
          ].map((c) => (
            <div key={c.title} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                {c.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.title}</p>
                <p className="mt-0.5 font-medium">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Message</Label>
            <Textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </div>
    </section>
  );
}
