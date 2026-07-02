import { useMemo, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/lib/store";
import { daysBetween, formatCurrency, useStore } from "@/lib/store";

const today = () => new Date().toISOString().slice(0, 10);

export function BookingDialog({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { addBooking, isVehicleBookedInRange } = useStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [deposit, setDeposit] = useState<string>("500");
  const [idFile, setIdFile] = useState<{ name: string; data?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<null | { id: string; name: string; start: string; end: string; total: number; deposit: number }>(null);

  const totalDays = useMemo(() => daysBetween(start, end), [start, end]);
  const totalAmount = totalDays * (vehicle?.dailyPrice ?? 0);

  const t = today();
  const dateInvalid = start < t || end < start;
  const overlap = useMemo(
    () => !!vehicle && !dateInvalid && isVehicleBookedInRange(vehicle.id, start, end),
    [vehicle, start, end, dateInvalid, isVehicleBookedInRange],
  );
  const formInvalid =
    !name.trim() ||
    !/^\d{10}$/.test(phone) ||
    dateInvalid ||
    !idFile ||
    !deposit ||
    Number(deposit) <= 0 ||
    overlap;

  const reset = () => {
    setName(""); setPhone(""); setStart(today()); setEnd(today());
    setDeposit("500"); setIdFile(null); setErrors({}); setConfirmed(null);
  };

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 200);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Phone must be exactly 10 digits";
    const t = today();
    if (start < t) e.start = "Start date cannot be in the past";
    if (end < start) e.end = "End date must be after start date";
    if (!idFile) e.id = "Government ID is required";
    const dep = Number(deposit);
    if (!deposit || isNaN(dep) || dep <= 0) e.deposit = "Enter a positive deposit";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (f: File | null) => {
    if (!f) return setIdFile(null);
    if (f.size > 2 * 1024 * 1024) {
      // skip storing large data urls
      setIdFile({ name: f.name });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setIdFile({ name: f.name, data: reader.result as string });
    reader.readAsDataURL(f);
  };

  const submit = () => {
    if (!vehicle) return;
    if (!validate()) return;
    if (isVehicleBookedInRange(vehicle.id, start, end)) {
      toast.error("This scooter is already booked for the selected dates.");
      return;
    }
    const b = addBooking({
      customerName: name.trim(),
      phone,
      vehicleId: vehicle.id,
      startDate: start,
      endDate: end,
      govIdName: idFile!.name,
      govIdData: idFile!.data,
      deposit: Number(deposit),
      totalDays,
      totalAmount,
    });
    toast.success("Booking confirmed!");
    setConfirmed({ id: b.id, name: b.customerName, start: b.startDate, end: b.endDate, total: b.totalAmount, deposit: b.deposit });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {confirmed ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-display text-xl font-bold">Booking Confirmed</h3>
            <p className="mt-1 text-sm text-muted-foreground">Show this ID at pickup.</p>
            <div className="mt-4 grid gap-2 rounded-lg border border-border bg-muted/40 p-4 text-left text-sm">
              <Row label="Booking ID" value={confirmed.id} />
              <Row label="Customer" value={confirmed.name} />
              <Row label="Vehicle" value={vehicle?.name ?? ""} />
              <Row label="From" value={confirmed.start} />
              <Row label="To" value={confirmed.end} />
              <Row label="Deposit" value={formatCurrency(confirmed.deposit)} />
              <Row label="Total" value={formatCurrency(confirmed.total)} highlight />
            </div>
            <Button className="mt-6 w-full" onClick={() => handleClose(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Book {vehicle?.name}</DialogTitle>
              <DialogDescription>
                {vehicle && (
                  <>
                    {vehicle.brand} · {vehicle.model} · {formatCurrency(vehicle.dailyPrice)}/day
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Field label="Customer Name" error={errors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <Input
                  value={phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date" error={errors.start}>
                  <Input type="date" min={today()} value={start} onChange={(e) => setStart(e.target.value)} />
                </Field>
                <Field label="End Date" error={errors.end}>
                  <Input type="date" min={start} value={end} onChange={(e) => setEnd(e.target.value)} />
                </Field>
              </div>
              <Field label="Government ID" error={errors.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  <Upload className="h-4 w-4" />
                  <span className="truncate text-muted-foreground">
                    {idFile?.name ?? "Upload ID (image/pdf)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </Field>
              <Field label="Deposit Amount (₹)" error={errors.deposit}>
                <Input
                  type="number"
                  min={1}
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 500"
                />
              </Field>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {totalDays} Day{totalDays === 1 ? "" : "s"} × {formatCurrency(vehicle?.dailyPrice ?? 0)}
                  </span>
                  <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                <div className="mt-1 flex justify-between text-base">
                  <span className="font-semibold">Grand Total</span>
                  <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {overlap && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                  This scooter is already booked for the selected dates.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => handleClose(false)}>Cancel</Button>
              <Button onClick={submit} disabled={formInvalid}>Confirm Booking</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-bold text-primary" : "font-medium"}>{value}</span>
    </div>
  );
}
