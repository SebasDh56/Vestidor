import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("storefront presents the unique-piece business model", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /KILLAÉ · ELEGANCIA DE RAÍZ/);
  assert.match(source, /Ninguna vuelve/);
  assert.match(source, /Cuatro piezas\. Ninguna repetida/);
  assert.match(source, /Pide la evidencia real/);
  assert.match(source, /Consultar por WhatsApp/);
  assert.doesNotMatch(source, /Elige tu color|Cuatro formas de ser|codex-preview|SkeletonPreview/);
});

test("try-on stays private and does not invent product colors", async () => {
  const source = await readFile(new URL("../src/components/CameraTryOn.tsx", import.meta.url), "utf8");
  assert.match(source, /getUserMedia/);
  assert.match(source, /enumerateDevices/);
  assert.match(source, /La imagen se procesa en tu dispositivo/);
  assert.match(source, /Ver puntos/);
  assert.doesNotMatch(source, /GARMENT_COLORS|setVirtualColor/);
  assert.match(source, /Color fijo de esta pieza/);
  assert.match(source, /Separa ligeramente los brazos/);
});

test("AR renderer keeps fitting when one joint is briefly hidden", async () => {
  const source = await readFile(new URL("../src/engines/VirtualTryOnEngine.ts", import.meta.url), "utf8");
  assert.match(source, /resolveArm/);
  assert.match(source, /hasLeftHip/);
  assert.match(source, /isEmbroidered/);
});

test("admin manages unique-piece availability with a signed Cloudflare session", async () => {
  const [adminPage, auth, catalog, brand] = await Promise.all([
    readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin-auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/services/catalog.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/config/brand.ts", import.meta.url), "utf8"),
  ]);

  assert.match(adminPage, /Entrar al panel/);
  assert.match(adminPage, /AdminAvailabilityControl/);
  assert.match(auth, /ADMIN_SESSION_COOKIE/);
  assert.match(auth, /ADMIN_PASSWORD/);
  assert.match(auth, /HMAC/);
  assert.match(catalog, /updateGarmentAvailability/);
  assert.match(catalog, /ADMIN_EMAIL/);
  assert.match(brand, /quimbiulcoerika@gmail\.com/);
});

test("Cloudflare deploy uses D1 media without requiring R2", async () => {
  const [wrangler, media, adminForm] = await Promise.all([
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
    readFile(new URL("../src/services/media.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AdminGarmentForm.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(wrangler, /"name": "vestidor"/);
  assert.match(wrangler, /"binding": "DB"/);
  assert.doesNotMatch(wrangler, /r2_buckets|GARMENT_IMAGES/);
  assert.match(media, /garment_media/);
  assert.match(media, /1_400_000/);
  assert.match(adminForm, /optimizeImage/);
  assert.match(adminForm, /image\/webp/);
});
