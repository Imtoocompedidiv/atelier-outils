import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, reconcile } from "./model.js";
test("retour sépare intact, cassé et manquant sans double comptage", () => {
  const r = reconcile(seed)[0];
  assert.equal(r.missing, 1);
  assert.equal(r.adjustment, 750);
  const found = reconcile([{ ...seed[0], back: 118 }])[0];
  assert.equal(found.missing, 0);
  assert.equal(found.adjustment, 500);
  assert.equal(reconcile([{ ...seed[0], back: 120 }])[0].valid, false);
});
