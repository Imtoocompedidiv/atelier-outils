import test from "node:test";
import assert from "node:assert/strict";
import { initial, cents, billableMinutes, calculate } from "./model.js";
test("first hour then half-hour indivisible with exact boundaries", () => {
  for (const [v, r] of [
    [1, 60],
    [59, 60],
    [60, 60],
    [61, 90],
    [90, 90],
    [91, 120],
    [95, 120],
    [120, 120],
    [121, 150],
  ])
    assert.equal(billableMinutes(v), r);
  for (const v of [0, -1, 1.5, "x", 1441])
    assert.equal(billableMinutes(v), null);
});
test("amounts are cents and tax rounded once on HT total", () => {
  assert.equal(cents("18,4"), 1840);
  assert.equal(cents("1.001"), null);
  const r = calculate({ ...initial, supplies: "0" });
  assert.equal(r.labor, 16000);
  assert.equal(r.ht, 21500);
  assert.equal(r.total, 25800);
  assert.equal(calculate({ ...initial, hourly: "-3" }).valid, false);
});
