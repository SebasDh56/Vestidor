import assert from "node:assert/strict";
import test from "node:test";
import { selectClosestSize } from "../src/engines/size-recommendation-core.mjs";

const chart = [
  { size: "S", shoulderWidth: 37 },
  { size: "M", shoulderWidth: 39 },
  { size: "L", shoulderWidth: 41 },
  { size: "XL", shoulderWidth: 44 },
];

test("selects the closest garment-specific shoulder measurement", () => {
  assert.equal(selectClosestSize(chart, 39.4).size, "M");
  assert.equal(selectClosestSize(chart, 42.7).size, "XL");
});
