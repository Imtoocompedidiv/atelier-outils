import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, compare } from "./model.js";
test("périmètre commun retient les mêmes trois postes puis évolue après correction", () => {
  const start = compare(initial);
  assert.deepEqual(start.commonRows, ["01", "04", "05"]);
  assert.deepEqual(start.commonTotals, [628400, 620600, 657800]);
  const rows = structuredClone(initial);
  rows[1].offers[1] = { price: "90", unit: "m²" };
  const next = compare(rows);
  assert.deepEqual(next.commonRows, ["01", "02", "04", "05"]);
  assert.equal(next.commonTotals[1], 800600);
  rows.forEach((r) => {
    r.offers[2].price = "";
  });
  assert.deepEqual(compare(rows).commonRows, []);
  assert.deepEqual(compare(rows).commonTotals, [0, 0, 0]);
});
test("comparateur exclut prix manquant et unité divergente puis réintègre une correction", () => {
  const r = compare(initial);
  assert.deepEqual(r.missing, [0, 2, 0]);
  assert.equal(r.questions.length, 2);
  assert.equal(r.totals[1], 23900 * 12 + 60500 * 4 + 5100 * 18);
  const rows = structuredClone(initial);
  rows[1].offers[1] = { price: "90", unit: "m²" };
  assert.equal(compare(rows).missing[1], 1);
});
