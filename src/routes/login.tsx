import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OWNER_EMAIL, useAuth } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Owner Login — Devika Rentals" },
      { name: "description", content: "Owner sign-in for Devika Rentals administrators." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <Login />
    </PublicLayout>
  ),
});

function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password, remember);
      setLoading(false);
      if (ok) {
        toast.success("Welcome back!");
        nav({ to: "/owner" });
      } else {
        toast.error("Invalid credentials");
      }
    }, 400);
  };

  return (
    <section className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-14 sm:px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Owner Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to manage vehicles and bookings.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-1.5">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
          </div>
          <div className="grid gap-1.5">
            <Label>Password</Label>
            <div className="relative">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-accent"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            <span>Remember me</span>
          </label>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p><span className="font-semibold text-foreground">Demo:</span> {OWNER_EMAIL}</p>
          <p>Password: Demo@123</p>
        </div>
      </div>
    </section>
  );
}
