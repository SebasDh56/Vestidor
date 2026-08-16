"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GarmentAvailability } from "@/src/types/garment";

export function AdminAvailabilityControl({ slug, value }: { slug: string; value: GarmentAvailability }) {
  const router = useRouter();
  const [availability, setAvailability] = useState(value);
  const [saving, setSaving] = useState(false);

  async function update(next: GarmentAvailability) {
    setAvailability(next);
    setSaving(true);
    const response = await fetch("/api/garments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, availability: next }),
    });
    setSaving(false);
    if (response.ok) router.refresh();
    else setAvailability(value);
  }

  return (
    <label className="availability-control">
      <span>{saving ? "Guardando…" : "Estado"}</span>
      <select value={availability} onChange={(event) => void update(event.target.value as GarmentAvailability)} disabled={saving}>
        <option value="available">Disponible</option>
        <option value="reserved">Reservada</option>
        <option value="sold">Vendida</option>
      </select>
    </label>
  );
}
