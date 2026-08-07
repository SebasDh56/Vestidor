import { getRuntimeEnv } from "@/src/services/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const objectKey = key.join("/");
  if (!objectKey.startsWith("garments/")) {
    return new Response("No encontrado", { status: 404 });
  }

  const object = await getRuntimeEnv().GARMENT_IMAGES?.get(objectKey);
  if (!object) return new Response("No encontrado", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
