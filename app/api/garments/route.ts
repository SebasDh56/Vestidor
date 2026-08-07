import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  createGarment,
  ensureAdminMembership,
  getRuntimeEnv,
  listGarments,
} from "@/src/services/catalog";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function GET() {
  return Response.json({ garments: await listGarments() });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Inicia sesión." }, { status: 401 });

  const membership = await ensureAdminMembership(user);
  if (!membership.allowed) {
    return Response.json({ error: "Acceso solo para administración." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const material = String(form.get("material") ?? "").trim();
    const color = String(form.get("color") ?? "").trim();
    const overlayColor = String(form.get("overlayColor") ?? "#c6b39a");
    const overlayAccent = String(form.get("overlayAccent") ?? "#a6462e");
    const image = form.get("image");

    if (!name || !category || !description || !material || !color) {
      return Response.json(
        { error: "Completa todos los campos de información." },
        { status: 400 },
      );
    }

    let imageKey: string | null = null;
    let imageUrl = "/images/products/chaqueta-killa-reference.png";

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/") || image.size > 5 * 1024 * 1024) {
        return Response.json(
          { error: "La imagen debe ser JPG, PNG o WebP y pesar menos de 5 MB." },
          { status: 400 },
        );
      }
      const bucket = getRuntimeEnv().GARMENT_IMAGES;
      if (!bucket) {
        return Response.json(
          { error: "El almacenamiento de imágenes no está disponible." },
          { status: 503 },
        );
      }
      const extension = image.name.split(".").pop()?.toLowerCase() ?? "jpg";
      imageKey = `garments/${crypto.randomUUID()}.${extension}`;
      await bucket.put(imageKey, await image.arrayBuffer(), {
        httpMetadata: { contentType: image.type },
      });
      imageUrl = `/api/media/${encodeURIComponent(imageKey)}`;
    }

    const garment = await createGarment({
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      name,
      category,
      description,
      material,
      color,
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
