import "server-only";

import { ensurePrototypeSchema, getRuntimeEnv } from "@/src/services/catalog";

export const MAX_GARMENT_IMAGE_BYTES = 1_400_000;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type MediaRow = {
  content_type: string;
  content: number[];
  byte_size: number;
  etag: string;
};

export async function storeGarmentImage(file: File): Promise<{
  key: string;
  url: string;
}> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("La imagen debe ser JPG, PNG o WebP.");
  }
  if (file.size <= 0 || file.size > MAX_GARMENT_IMAGE_BYTES) {
    throw new Error("La imagen optimizada debe pesar menos de 1.4 MB.");
  }

  const db = getRuntimeEnv().DB;
  if (!db) throw new Error("La base de datos de im\u00e1genes no est\u00e1 disponible.");
  await ensurePrototypeSchema(db);

  const extension = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const key = `garments/${crypto.randomUUID()}.${extension}`;
  const etag = crypto.randomUUID();
  const content = await file.arrayBuffer();

  await db.prepare(`INSERT INTO garment_media (
    key, content_type, content, byte_size, etag
  ) VALUES (?, ?, ?, ?, ?)`)
    .bind(key, file.type, content, file.size, etag)
    .run();

  const encodedPath = key.split("/").map(encodeURIComponent).join("/");
  return { key, url: `/api/media/${encodedPath}` };
}

export async function getGarmentImage(key: string): Promise<{
  body: ArrayBuffer;
  contentType: string;
  byteSize: number;
  etag: string;
} | null> {
  const db = getRuntimeEnv().DB;
  if (!db) return null;
  await ensurePrototypeSchema(db);

  const row = await db.prepare(`SELECT content_type, content, byte_size, etag
    FROM garment_media WHERE key = ? LIMIT 1`)
    .bind(key)
    .first<MediaRow>();
  if (!row) return null;

  return {
    body: Uint8Array.from(row.content).buffer,
    contentType: row.content_type,
    byteSize: row.byte_size,
    etag: row.etag,
  };
}
