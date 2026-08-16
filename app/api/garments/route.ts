import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  createGarment,
  ensureAdminMembership,
  getRuntimeEnv,
  listGarments,
  updateGarmentAvailability,
} from "@/src/services/catalog";
import type { GarmentAvailability } from "@/src/types/garment";

const slugify = (value: string) => value.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function requireAdmin() {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Inicia sesión." }, { status: 401 }) };
  const membership = await ensureAdminMembership(user);
  if (!membership.allowed) return { error: Response.json({ error: "Acceso solo para administración." }, { status: 403 }) };
  return { user };
}

export async function GET() {
  return Response.json({ garments: await listGarments() });
}

export async function POST(request: Request) {
  const access = await requireAdmin();
  if ("error" in access) return access.error;
  try {
    const form = await request.formData();
    const pieceCode = String(form.get("pieceCode") ?? "").trim().toUpperCase();
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "Abrigo Andino · Pieza única").trim();
    const description = String(form.get("description") ?? "").trim();
    const material = String(form.get("material") ?? "").trim();
    const color = String(form.get("color") ?? "").trim();
    const availability = String(form.get("availability") ?? "available") as GarmentAvailability;
    const units = Math.max(1, Math.min(20, Number(form.get("units") ?? 1) || 1));
    const overlayColor = String(form.get("overlayColor") ?? "#c6b39a");
    const overlayAccent = String(form.get("overlayAccent") ?? "#a6462e");
    const image = form.get("image");

    if (!pieceCode || !name || !description || !material || !color) {
      return Response.json({ error: "Completa código, nombre, descripción, material y color." }, { status: 400 });
    }
    if (!["available", "reserved", "sold"].includes(availability)) {
      return Response.json({ error: "Estado de disponibilidad inválido." }, { status: 400 });
    }

    let imageKey: string | null = null;
    let imageUrl = "/images/catalog/abrigo-andino-a01-gris-geometrico-v2.png";
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/") || image.size > 5 * 1024 * 1024) {
        return Response.json({ error: "La imagen debe ser JPG, PNG o WebP y pesar menos de 5 MB." }, { status: 400 });
      }
      const bucket = getRuntimeEnv().GARMENT_IMAGES;
      if (!bucket) return Response.json({ error: "El almacenamiento de imágenes no está disponible." }, { status: 503 });
      const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
      imageKey = `garments/${crypto.randomUUID()}.${extension}`;
      await bucket.put(imageKey, await image.arrayBuffer(), { httpMetadata: { contentType: image.type } });
      imageUrl = `/api/media/${encodeURIComponent(imageKey)}`;
    }

    const garment = await createGarment({
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      pieceCode,
      name,
      category,
      description,
      material,
      color,
      availability,
      units,
      imageUrl,
      imageKey,
      overlayColor,
      overlayAccent,
    });
    return Response.json({ garment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la prenda.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const access = await requireAdmin();
  if ("error" in access) return access.error;
  try {
    const body = await request.json() as { slug?: string; availability?: GarmentAvailability };
    if (!body.slug || !body.availability || !["available", "reserved", "sold"].includes(body.availability)) {
      return Response.json({ error: "Datos de disponibilidad inválidos." }, { status: 400 });
    }
    await updateGarmentAvailability(body.slug, body.availability);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No se pudo actualizar la pieza." }, { status: 500 });
  }
}
