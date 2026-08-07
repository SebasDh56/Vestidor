import "server-only";

import { env } from "cloudflare:workers";
import { DEFAULT_GARMENTS, STANDARD_SIZE_CHART } from "@/src/data/garments";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import type { Garment } from "@/src/types/garment";

type RuntimeEnv = {
  DB?: D1Database;
  GARMENT_IMAGES?: R2Bucket;
};

type GarmentRow = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
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
  name: string;
  category: string;
  description: string;
  material: string;
  color: string;
  imageUrl: string;
  imageKey: string | null;
  overlayColor: string;
  overlayAccent: string;
};

export function getRuntimeEnv(): RuntimeEnv {
  return env as unknown as RuntimeEnv;
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
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      material TEXT NOT NULL,
      color TEXT NOT NULL,
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
    db.prepare(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_garments_slug ON garments(slug)",
    ),
    db.prepare(
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id)",
    ),
  ]);
}

async function seedGarments(db: D1Database): Promise<void> {
  const statements = DEFAULT_GARMENTS.map((garment) =>
    db
      .prepare(`INSERT OR IGNORE INTO garments (
        slug, name, category, description, material, color, image_url, image_key,
        image_focus, overlay_color, overlay_accent, featured, sizes, size_chart
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        garment.slug,
        garment.name,
        garment.category,
        garment.description,
        garment.material,
        garment.color,
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
  await db.batch(statements);
}

function mapGarment(row: GarmentRow): Garment {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    material: row.material,
    color: row.color,
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
    const result = await db
      .prepare("SELECT * FROM garments ORDER BY featured DESC, id ASC")
      .all<GarmentRow>();
    return result.results.map(mapGarment);
  } catch {
    return DEFAULT_GARMENTS;
  }
}

export async function getGarmentBySlug(slug: string): Promise<Garment | null> {
  const garments = await listGarments();
  return garments.find((garment) => garment.slug === slug) ?? null;
}

export async function ensureAdminMembership(
  user: ChatGPTUser,
): Promise<{ allowed: boolean; bootstrapped: boolean }> {
  const db = getRuntimeEnv().DB;
  if (!db) return { allowed: true, bootstrapped: true };

  await ensurePrototypeSchema(db);
  const count = await db
    .prepare("SELECT COUNT(*) AS total FROM admins")
    .first<{ total: number }>();
  const bootstrapped = Number(count?.total ?? 0) === 0;

  if (bootstrapped) {
    await db
      .prepare("INSERT OR IGNORE INTO admins (user_id, email) VALUES (?, ?)")
      .bind(user.userId, user.email)
      .run();
  }

  const admin = await db
    .prepare("SELECT id FROM admins WHERE user_id = ? LIMIT 1")
    .bind(user.userId)
    .first<{ id: number }>();

  return { allowed: Boolean(admin), bootstrapped };
}

export async function createGarment(input: NewGarmentInput): Promise<Garment> {
  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("La base de datos no está disponible.");
  await ensurePrototypeSchema(db);

  const sizes = ["S", "M", "L", "XL"];
  const result = await db
    .prepare(`INSERT INTO garments (
      slug, name, category, description, material, color, image_url, image_key,
      image_focus, overlay_color, overlay_accent, featured, sizes, size_chart
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'center', ?, ?, 1, ?, ?)
    RETURNING *`)
    .bind(
      input.slug,
      input.name,
      input.category,
      input.description,
      input.material,
      input.color,
      input.imageUrl,
      input.imageKey,
      input.overlayColor,
      input.overlayAccent,
      JSON.stringify(sizes),
      JSON.stringify(STANDARD_SIZE_CHART),
    )
    .first<GarmentRow>();

  if (!result) throw new Error("No se pudo guardar la prenda.");
  return mapGarment(result);
}
