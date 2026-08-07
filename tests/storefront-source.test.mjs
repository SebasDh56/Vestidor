import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("storefront contains the finished editorial content", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Raíces que/);
  assert.match(source, /Piezas con historia/);
  assert.match(source, /Abrir probador virtual/);
  assert.doesNotMatch(source, /codex-preview|Your site is taking shape|SkeletonPreview/);
});

test("try-on UI exposes camera privacy and device controls", async () => {
  const source = await readFile(
    new URL("../src/components/CameraTryOn.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /getUserMedia/);
  assert.match(source, /enumerateDevices/);
  assert.match(source, /No guardamos ni enviamos tu video/);
  assert.match(source, /Ver puntos/);
});
