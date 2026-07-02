import { createFileRoute, Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Bike as BikeIcon, ClipboardList, LogOut } from "lucide-react";
import { Header } from "@/components/Layout";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [{ title: "Owner Dashboard — Devika Rentals" }],
  }),
  component: OwnerLayout,
});

const tabs = [
  { to: "/owner", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/owner/vehicles", label: "Vehicles", icon: BikeIcon },
  { to: "/owner/bookings", label: "Bookings", icon: ClipboardList },
];

function OwnerLayout() {
  const { isOwner, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!isOwner) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="border-b border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-1">
            {tabs.map((t) => {
              const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                    active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </Link>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
    </div>
  );
}
