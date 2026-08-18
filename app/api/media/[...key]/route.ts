import { getGarmentImage } from "@/src/services/media";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const objectKey = key.join("/");
  if (!objectKey.startsWith("garments/")) {
    return new Response("No encontrado", { status: 404 });
  }

  const image = await getGarmentImage(objectKey);
  if (!image) return new Response("No encontrado", { status: 404 });

  const headers = new Headers({
    "content-type": image.contentType,
    "content-length": String(image.byteSize),
  });
  headers.set("etag", image.etag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(image.body, { headers });
}
