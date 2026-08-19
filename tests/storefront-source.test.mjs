import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("storefront presents the Abrigo Andino combinations by size", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /KILLAÉ · ELEGANCIA DE RAÍZ/);
  assert.match(source, /Tu talla\./);
  assert.match(source, /Tu combinación\./);
  assert.match(source, /CombinationCollection/);
  assert.match(source, /CapsCollection/);
  assert.match(source, /PIEZAS ÚNICAS · MANOS LOCALES · ECUADOR/);
  assert.match(source, /Empieza por tu talla/);
  assert.match(source, /Consultar por WhatsApp/);
  assert.doesNotMatch(source, /Cuatro piezas\. Ninguna repetida|codex-preview|SkeletonPreview/);
});

test("branding and caps line communicate real availability without promising repeated designs", async () => {
  const [layout, logo, header, caps] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/BrandLogo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CapsCollection.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /Piezas artesanales con raíz ecuatoriana/);
  assert.match(layout, /favicon\.png/);
  assert.match(logo, /killae-emblem\.png/);
  assert.match(header, /\/#gorras/);
  assert.match(caps, /LÍNEA SOL · GORRAS BORDADAS/);
  assert.match(caps, /no garantizamos que un diseño se repita/);
  assert.match(caps, /fotografías reales de los diseños actuales/);
  assert.equal((caps.match(/\/images\/caps\//g) ?? []).length, 3);
});

test("combination catalog maps girls, S, M and L with one editorial model per size", async () => {
  const [data, component] = await Promise.all([
    readFile(new URL("../src/data/combinations.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/CombinationCollection.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(data, /Combinaciones 01–03/);
  assert.match(data, /Combinaciones 04–06/);
  assert.match(data, /Combinaciones 07–10/);
  assert.match(data, /Combinaciones 11–13/);
  assert.match(data, /sizeLabel: "Niñas"/);
  assert.match(data, /sizeLabel: "Talla S"/);
  assert.match(data, /sizeLabel: "Talla M"/);
  assert.match(data, /sizeLabel: "Talla L"/);
  assert.equal((data.match(/modelImageUrl: "\/images\/models\//g) ?? []).length, 4);
  assert.match(component, /Visualización editorial con IA/);
  assert.match(component, /wa\.me/);
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
  const [wrangler, media, adminForm, deployScript, packageJson] = await Promise.all([
    readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
    readFile(new URL("../src/services/media.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/AdminGarmentForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../scripts/deploy-cloudflare.mjs", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(wrangler, /"name": "vestidor"/);
  assert.match(wrangler, /"binding": "DB"/);
  assert.doesNotMatch(wrangler, /r2_buckets|GARMENT_IMAGES/);
  assert.match(media, /garment_media/);
  assert.match(media, /1_400_000/);
  assert.match(adminForm, /optimizeImage/);
  assert.match(adminForm, /image\/webp/);
  assert.match(deployScript, /d1", "list", "--json"/);
  assert.match(deployScript, /database_id/);
  assert.match(packageJson, /node scripts\/deploy-cloudflare\.mjs/);
});
