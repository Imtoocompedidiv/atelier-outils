import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, layout } from "./model.js";
test("implantation, capacité limitée et rejet des données hors plage", () => {
  const normal = layout(initial);
  assert.equal(normal.needed, 20);
  assert.equal(normal.tables.length, 20);
  assert.equal(normal.missing, 0);
  const small = layout({ ...initial, width: 5, length: 5 });
  assert.ok(small.missing > 0);
  assert.ok(small.tables.every((t) => t.x + t.w <= 5 && t.y + t.h <= 5));
  assert.equal(layout({ ...initial, guests: 0 }).valid, false);
  assert.equal(layout({ ...initial, width: NaN }).valid, false);
});
