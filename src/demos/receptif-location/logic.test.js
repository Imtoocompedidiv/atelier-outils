import { test } from "node:test";
import assert from "node:assert/strict";
import { events, prepare } from "./model.js";
test("préparation facturation exige des écarts documentés et un comptage confirmé", () => {
  const e = structuredClone(events[0]);
  assert.equal(prepare(e).ready, false);
  assert.equal(prepare(e).extra, 600);
  e.rows[0].note = "1 cassé, 1 absent";
  e.checked = true;
  assert.equal(prepare(e).ready, true);
  e.rows[0].back = 100;
  assert.equal(prepare(e).valid, false);
  assert.equal(prepare(e).ready, false);
});
