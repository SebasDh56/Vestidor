import "server-only";

import { env } from "cloudflare:workers";
import { DEFAULT_GARMENTS, STANDARD_SIZE_CHART } from "@/src/data/garments";
import type { AdminUser } from "@/app/admin-auth";
import { ADMIN_EMAIL } from "@/src/config/brand";
import type { Garment, GarmentAvailability } from "@/src/types/garment";

type RuntimeEnv = {
  DB?: D1Database;
};

type GarmentRow = {
  id: number;
  slug: string;
  piece_code: string | null;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  availability: GarmentAvailability | null;
  units: number | null;
  image_url: string;
  image_key: string | null;
  image_focus: "left" | "center" | "right";
  overlay_color: string;
  overlay_accent: string;
  featured: number;
  sizes: string;
  size_chart: string;
};

export type NewGarmentInput = {
  slug: string;
  pieceCode: string;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  availability: GarmentAvailability;
  units: number;
  imageUrl: string;
  imageKey: string | null;
  overlayColor: string;
  overlayAccent: string;
};

export function getRuntimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
}

async function ensureGarmentMetadataColumns(db: D1Database): Promise<void> {
  const columns = await db.prepare("PRAGMA table_info(garments)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  if (!names.has("piece_code")) {
    await db.prepare("ALTER TABLE garments ADD COLUMN piece_code TEXT NOT NULL DEFAULT ''").run();
  }
  if (!names.has("availability")) {
    await db.prepare("ALTER TABLE garments ADD COLUMN availability TEXT NOT NULL DEFAULT 'available'").run();
  }
  if (!names.has("units")) {
    await db.prepare("ALTER TABLE garments ADD COLUMN units INTEGER NOT NULL DEFAULT 1").run();
  }
}

export async function ensurePrototypeSchema(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS garments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      piece_code TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      material TEXT NOT NULL,
      color TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'available',
      units INTEGER NOT NULL DEFAULT 1,
      image_url TEXT NOT NULL,
      image_key TEXT,
      image_focus TEXT NOT NULL DEFAULT 'center',
      overlay_color TEXT NOT NULL,
      overlay_accent TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 1,
      sizes TEXT NOT NULL,
      size_chart TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS customer_requests (
      id TEXT PRIMARY KEY,
      garment_slug TEXT NOT NULL,
      garment_name TEXT NOT NULL,
      color TEXT NOT NULL,
      size TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS garment_media (
      key TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      content BLOB NOT NULL,
      byte_size INTEGER NOT NULL,
      etag TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_garments_slug ON garments(slug)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_customer_requests_created_at ON customer_requests(created_at DESC)"),
  ]);
  await ensureGarmentMetadataColumns(db);
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_garments_piece_code ON garments(piece_code) WHERE piece_code <> ''").run();
}

async function seedGarments(db: D1Database): Promise<void> {
  const statements = DEFAULT_GARMENTS.map((garment) =>
    db.prepare(`INSERT INTO garments (
      slug, piece_code, name, category, description, material, color, availability,
      units, image_url, image_key, image_focus, overlay_color, overlay_accent,
      featured, sizes, size_chart
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      piece_code = excluded.piece_code,
      name = excluded.name,
      category = excluded.category,
      description = excluded.description,
      material = excluded.material,
      color = excluded.color,
      image_url = excluded.image_url,
      image_key = excluded.image_key,
      image_focus = excluded.image_focus,
      overlay_color = excluded.overlay_color,
      overlay_accent = excluded.overlay_accent,
      featured = excluded.featured,
      sizes = excluded.sizes,
      size_chart = excluded.size_chart,
      updated_at = CURRENT_TIMESTAMP`)
      .bind(
        garment.slug,
        garment.pieceCode,
        garment.name,
        garment.category,
        garment.description,
        garment.material,
        garment.color,
        garment.availability,
        garment.units,
        garment.imageUrl,
        garment.imageKey,
        garment.imageFocus,
        garment.overlayColor,
        garment.overlayAccent,
        garment.featured ? 1 : 0,
        JSON.stringify(garment.sizes),
        JSON.stringify(garment.sizeChart),
      ),
  );
  const removePreviousCatalog = db.prepare(`DELETE FROM garments WHERE slug IN (
    'chaqueta-killa-marfil', 'abrigo-inti-camel', 'blazer-sisay-camel', 'abrigo-sisa-rosa',
    'chaqueta-corta-andina', 'abrigo-bordado', 'chaqueta-corta-sin-cuello-bordada',
    'chaqueta-larga-andina'
  )`);
  await db.batch([...statements, removePreviousCatalog]);
}

function mapGarment(row: GarmentRow): Garment {
  return {
    id: row.id,
    slug: row.slug,
    pieceCode: row.piece_code || `KAE-${String(row.id).padStart(3, "0")}`,
    name: row.name,
    category: row.category,
    description: row.description,
    material: row.material,
    color: row.color,
    availability: row.availability ?? "available",
    units: row.units ?? 1,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    imageFocus: row.image_focus,
    overlayColor: row.overlay_color,
    overlayAccent: row.overlay_accent,
    featured: Boolean(row.featured),
    sizes: JSON.parse(row.sizes),
    sizeChart: JSON.parse(row.size_chart),
  };
}

export async function listGarments(): Promise<Garment[]> {
  const db = getRuntimeEnv().DB;
  if (!db) return DEFAULT_GARMENTS;
  try {
    await ensurePrototypeSchema(db);
    await seedGarments(db);
    const result = await db.prepare(`SELECT * FROM garments
      ORDER BY CASE availability WHEN 'available' THEN 0 WHEN 'reserved' THEN 1 ELSE 2 END,
      featured DESC, id ASC`).all<GarmentRow>();
    return result.results.map(mapGarment);
  } catch {
    return DEFAULT_GARMENTS;
  }
}

export async function getGarmentBySlug(slug: string): Promise<Garment | null> {
  const garments = await listGarments();
  return garments.find((garment) => garment.slug === slug) ?? null;
}

export async function ensureAdminMembership(user: AdminUser): Promise<{ allowed: boolean; bootstrapped: boolean }> {
  if (user.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return { allowed: false, bootstrapped: false };
  }
  const db = getRuntimeEnv().DB;
  if (!db) return { allowed: true, bootstrapped: false };
  await ensurePrototypeSchema(db);
  const existing = await db.prepare("SELECT id FROM admins WHERE user_id = ? LIMIT 1")
    .bind(user.userId).first<{ id: number }>();
  const bootstrapped = !existing;
  if (!existing) {
    await db.prepare(`INSERT INTO admins (user_id, email) VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET email = excluded.email`)
      .bind(user.userId, user.email).run();
  }
  return { allowed: true, bootstrapped };
}

export async function createGarment(input: NewGarmentInput): Promise<Garment> {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("La base de datos no está disponible.");
  await ensurePrototypeSchema(db);
  const sizes = ["S", "M", "L", "XL"];
  const result = await db.prepare(`INSERT INTO garments (
    slug, piece_code, name, category, description, material, color, availability,
    units, image_url, image_key, image_focus, overlay_color, overlay_accent,
    featured, sizes, size_chart
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'center', ?, ?, 1, ?, ?)
  RETURNING *`).bind(
    input.slug,
    input.pieceCode,
    input.name,
    input.category,
    input.description,
    input.material,
    input.color,
    input.availability,
    input.units,
    input.imageUrl,
    input.imageKey,
    input.overlayColor,
    input.overlayAccent,
    JSON.stringify(sizes),
    JSON.stringify(STANDARD_SIZE_CHART),
  ).first<GarmentRow>();
  if (!result) throw new Error("No se pudo guardar la prenda.");
  return mapGarment(result);
}

export async function updateGarmentAvailability(slug: string, availability: GarmentAvailability): Promise<void> {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("La base de datos no está disponible.");
  await ensurePrototypeSchema(db);
  await db.prepare("UPDATE garments SET availability = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?")
    .bind(availability, slug).run();
}
