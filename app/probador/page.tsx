import { CameraTryOn } from "@/src/components/CameraTryOn";
import { listGarments } from "@/src/services/catalog";

export const dynamic = "force-dynamic";

export default async function TryOnPage({ searchParams }: { searchParams: Promise<{ prenda?: string }> }) {
  const [{ prenda }, garments] = await Promise.all([searchParams, listGarments()]);
  return <CameraTryOn garments={garments} initialSlug={prenda} />;
}
