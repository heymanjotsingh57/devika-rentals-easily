import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type VehicleType = "Bike" | "Scooter";

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  dailyPrice: number;
  available: boolean;
  image?: string; // data url or external
  color?: string; // fallback accent
}

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  vehicleId: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string;
  govIdName: string;
  govIdData?: string; // base64 preview
  deposit: number;
  totalDays: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
}

const VEHICLES_KEY = "dr.vehicles";
const BOOKINGS_KEY = "dr.bookings";
const AUTH_KEY = "dr.auth";
const THEME_KEY = "dr.theme";

export const OWNER_EMAIL = "owner@devikarentals.com";
export const OWNER_PASSWORD = "Demo@123";

const seedVehicles: Vehicle[] = [
  { id: "v1", name: "Honda Activa 6G", type: "Scooter", brand: "Honda", model: "Activa 6G", dailyPrice: 400, available: true, color: "180 60% 55%" },
  { id: "v2", name: "TVS Jupiter", type: "Scooter", brand: "TVS", model: "Jupiter", dailyPrice: 380, available: true, color: "200 60% 55%" },
  { id: "v3", name: "Suzuki Access 125", type: "Scooter", brand: "Suzuki", model: "Access 125", dailyPrice: 450, available: true, color: "160 60% 50%" },
  { id: "v4", name: "Ola S1 Pro", type: "Scooter", brand: "Ola", model: "S1 Pro", dailyPrice: 600, available: true, color: "220 65% 60%" },
  { id: "v5", name: "Royal Enfield Classic 350", type: "Bike", brand: "Royal Enfield", model: "Classic 350", dailyPrice: 1200, available: true, color: "20 70% 55%" },
  { id: "v6", name: "Bajaj Pulsar NS200", type: "Bike", brand: "Bajaj", model: "Pulsar NS200", dailyPrice: 900, available: true, color: "0 70% 55%" },
  { id: "v7", name: "KTM Duke 250", type: "Bike", brand: "KTM", model: "Duke 250", dailyPrice: 1400, available: true, color: "35 90% 55%" },
  { id: "v8", name: "Yamaha MT-15", type: "Bike", brand: "Yamaha", model: "MT-15", dailyPrice: 1100, available: true, color: "260 60% 60%" },
];

function todayOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeSeedBookings(): Booking[] {
  return [
    {
      id: "BK-1001",
      customerName: "Ravi Kumar",
      phone: "9876543210",
      vehicleId: "v1",
      startDate: todayOffset(-2),
      endDate: todayOffset(1),
      govIdName: "aadhaar.jpg",
      deposit: 500,
      totalDays: 3,
      totalAmount: 1200,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "BK-1002",
      customerName: "Priya Sharma",
      phone: "9123456780",
      vehicleId: "v5",
      startDate: todayOffset(-10),
      endDate: todayOffset(-7),
      govIdName: "license.png",
      deposit: 1000,
      totalDays: 3,
      totalAmount: 3600,
      status: "completed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "BK-1003",
      customerName: "Arjun Nair",
      phone: "9012345678",
      vehicleId: "v7",
      startDate: todayOffset(3),
      endDate: todayOffset(6),
      govIdName: "aadhaar.pdf",
      deposit: 1500,
      totalDays: 3,
      totalAmount: 4200,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  ];
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

// ---------------- Store Context ----------------

interface StoreCtx {
  vehicles: Vehicle[];
  bookings: Booking[];
  addVehicle: (v: Omit<Vehicle, "id">) => Vehicle;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>) => void;
  isVehicleBookedInRange: (vehicleId: string, start: string, end: string, ignoreBookingId?: string) => boolean;
}

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => load(VEHICLES_KEY, seedVehicles));
  const [bookings, setBookings] = useState<Booking[]>(() => load(BOOKINGS_KEY, makeSeedBookings()));

  useEffect(() => save(VEHICLES_KEY, vehicles), [vehicles]);
  useEffect(() => save(BOOKINGS_KEY, bookings), [bookings]);

  const isVehicleBookedInRange: StoreCtx["isVehicleBookedInRange"] = (vehicleId, start, end, ignoreBookingId) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return bookings.some((b) => {
      if (b.vehicleId !== vehicleId) return false;
      if (b.status === "cancelled") return false;
      if (ignoreBookingId && b.id === ignoreBookingId) return false;
      const bs = new Date(b.startDate).getTime();
      const be = new Date(b.endDate).getTime();
      return s <= be && e >= bs; // overlap
    });
  };

  const ctx: StoreCtx = {
    vehicles,
    bookings,
    addVehicle: (v) => {
      const nv: Vehicle = { ...v, id: "v" + Date.now() };
      setVehicles((prev) => [...prev, nv]);
      return nv;
    },
    updateVehicle: (id, patch) => {
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    },
    deleteVehicle: (id) => {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    },
    addBooking: (b) => {
      const id = "BK-" + Math.floor(1000 + Math.random() * 9000);
      const nb: Booking = { ...b, id, createdAt: new Date().toISOString(), status: "confirmed" };
      setBookings((prev) => [nb, ...prev]);
      return nb;
    },
    updateBooking: (id, patch) => {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    },
    isVehicleBookedInRange,
  };

  return <StoreContext.Provider value={ctx}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// ---------------- Auth Context ----------------

interface AuthCtx {
  isOwner: boolean;
  login: (email: string, password: string, remember: boolean) => boolean;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOwner, setIsOwner] = useState<boolean>(() => load(AUTH_KEY, false));

  useEffect(() => save(AUTH_KEY, isOwner), [isOwner]);

  const login: AuthCtx["login"] = (email, password) => {
    if (email.trim().toLowerCase() === OWNER_EMAIL && password === OWNER_PASSWORD) {
      setIsOwner(true);
      return true;
    }
    return false;
  };
  const logout = () => setIsOwner(false);

  return <AuthContext.Provider value={{ isOwner, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be within AuthProvider");
  return c;
}

// ---------------- Theme ----------------

export type Theme = "light" | "dark" | "system";
interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}
const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => load<Theme>(THEME_KEY, "system"));
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolved: "light" | "dark" = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    save(THEME_KEY, t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const c = useContext(ThemeContext);
  if (!c) throw new Error("useTheme must be within ThemeProvider");
  return c;
}

// ---------------- Utilities ----------------

export function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 0;
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export function formatCurrency(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
