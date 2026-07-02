import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bike, Pencil, Plus, Trash2, Zap, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, useStore, type Vehicle, type VehicleType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/owner/vehicles")({
  component: OwnerVehicles,
});

type Draft = {
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  dailyPrice: string;
  available: boolean;
  image?: string;
};

const empty: Draft = {
  name: "", type: "Scooter", brand: "", model: "", dailyPrice: "", available: true,
};

function OwnerVehicles() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useStore();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);

  const openNew = () => {
    setEditingId(null);
    setDraft(empty);
    setOpen(true);
  };
  const openEdit = (v: Vehicle) => {
    setEditingId(v.id);
    setDraft({
      name: v.name, type: v.type, brand: v.brand, model: v.model,
      dailyPrice: String(v.dailyPrice), available: v.available, image: v.image,
    });
    setOpen(true);
  };

  const save = () => {
    if (!draft.name.trim() || !draft.brand.trim() || !draft.model.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const price = Number(draft.dailyPrice);
    if (isNaN(price) || price <= 0) {
      toast.error("Enter a valid daily price");
      return;
    }
    if (editingId) {
      updateVehicle(editingId, { ...draft, dailyPrice: price });
      toast.success("Vehicle updated");
    } else {
      addVehicle({ ...draft, dailyPrice: price });
      toast.success("Vehicle added");
    }
    setOpen(false);
  };

  const handleImage = (f: File | null) => {
    if (!f) return;
    if (f.size > 800 * 1024) {
      toast.error("Image too large (max 800KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, image: reader.result as string }));
    reader.readAsDataURL(f);
  };

  const remove = (v: Vehicle) => {
    if (confirm(`Delete ${v.name}?`)) {
      deleteVehicle(v.id);
      toast.success("Vehicle deleted");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Vehicles</h1>
          <p className="text-sm text-muted-foreground">Manage your rental fleet.</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
      </div>

      {vehicles.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-semibold">No vehicles yet</p>
          <Button className="mt-4" onClick={openNew}>Add your first vehicle</Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="hidden grid-cols-[80px_1.5fr_1fr_1fr_1fr_120px_auto] items-center gap-4 border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span></span>
            <span>Name</span>
            <span>Type</span>
            <span>Brand / Model</span>
            <span>Price</span>
            <span>Available</span>
            <span></span>
          </div>
          <div className="divide-y divide-border">
            {vehicles.map((v) => {
              const Icon = v.type === "Bike" ? Bike : Zap;
              return (
                <div key={v.id} className="grid gap-3 p-4 md:grid-cols-[80px_1.5fr_1fr_1fr_1fr_120px_auto] md:items-center md:gap-4">
                  <div className="card-vehicle grid h-14 w-14 place-items-center rounded-lg md:h-16 md:w-16">
                    {v.image ? (
                      <img src={v.image} alt={v.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{v.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{v.brand} · {v.model}</p>
                  </div>
                  <div><Badge variant="secondary">{v.type}</Badge></div>
                  <div className="hidden text-sm md:block">{v.brand} · {v.model}</div>
                  <div className="font-semibold text-primary">{formatCurrency(v.dailyPrice)}</div>
                  <div>
                    <Switch
                      checked={v.available}
                      onCheckedChange={(c) => updateVehicle(v.id, { available: c })}
                    />
                    <span className={cn("ml-2 text-xs", v.available ? "text-success" : "text-muted-foreground")}>
                      {v.available ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => remove(v)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as VehicleType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scooter">Scooter</SelectItem>
                    <SelectItem value="Bike">Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Daily Price (₹)</Label>
                <Input
                  type="number"
                  min={1}
                  value={draft.dailyPrice}
                  onChange={(e) => setDraft({ ...draft, dailyPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Brand</Label>
                <Input value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Model</Label>
                <Input value={draft.model} onChange={(e) => setDraft({ ...draft, model: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Vehicle Image (optional)</Label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" />
                <span className="truncate text-muted-foreground">
                  {draft.image ? "Image selected" : "Upload image"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-border p-3 text-sm">
              <span>Available for booking</span>
              <Switch checked={draft.available} onCheckedChange={(c) => setDraft({ ...draft, available: c })} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? "Save Changes" : "Add Vehicle"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
