import test from "node:test";
import assert from "node:assert/strict";
import { initial, valid, change, ready, checks } from "./model.js";
test("valid dimensions quantities and actual dates required", () => {
  assert.ok(valid(initial));
  assert.equal(Boolean(valid({ ...initial, date: "2026-02-30" })), false);
  assert.equal(Boolean(valid({ ...initial, quantity: "0" })), false);
  assert.equal(Boolean(valid({ ...initial, width: "201" })), false);
});
test("geometric and ink changes invalidate appropriate declarations", () => {
  const s = {
    ...initial,
    checked: Object.fromEntries(checks.map(([k]) => [k, true])),
  };
  assert.equal(ready(s), true);
  const resized = change(s, "width", "35");
  assert.equal(resized.checked.scale, false);
  assert.equal(resized.checked.resolution, false);
  assert.equal(resized.checked.type, true);
  const ink = change(s, "colors", ["#000000", "#ffffff"]);
  assert.equal(ink.checked.layers, false);
  assert.equal(ink.checked.preview, false);
  assert.equal(ready(ink), false);
});
