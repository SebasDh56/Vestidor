import "server-only";

import { ensurePrototypeSchema, getRuntimeEnv } from "@/src/services/catalog";
import type { CustomerRequest } from "@/src/types/request";

type RequestRow = {
  id: string;
  garment_slug: string;
  garment_name: string;
  color: string;
  size: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  notes: string;
  status: string;
  created_at: string;
};

function mapRequest(row: RequestRow): CustomerRequest {
  return {
    id: row.id,
    garmentSlug: row.garment_slug,
    garmentName: row.garment_name,
    color: row.color,
    size: row.size,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    city: row.city,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createCustomerRequest(input: Omit<CustomerRequest, "id" | "status" | "createdAt">) {
  const db = getRuntimeEnv().DB;
  if (!db) return { id: crypto.randomUUID(), persisted: false };
  await ensurePrototypeSchema(db);
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO customer_requests (
    id, garment_slug, garment_name, color, size, customer_name,
    customer_phone, city, notes, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`).bind(
    id,
    input.garmentSlug,
    input.garmentName,
    input.color,
    input.size,
    input.customerName,
    input.customerPhone,
    input.city,
    input.notes,
  ).run();
  return { id, persisted: true };
}

export async function listCustomerRequests(): Promise<CustomerRequest[]> {
  const db = getRuntimeEnv().DB;
  if (!db) return [];
  await ensurePrototypeSchema(db);
  const result = await db.prepare(
    "SELECT * FROM customer_requests ORDER BY created_at DESC LIMIT 100",
  ).all<RequestRow>();
  return result.results.map(mapRequest);
}
