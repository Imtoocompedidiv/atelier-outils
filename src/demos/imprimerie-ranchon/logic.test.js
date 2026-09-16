import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, assess } from "./model.js";
test("pagination piquée et dates bloquent le brief, masse suit le tirage", () => {
  assert.equal(assess(initial).valid, false);
  const fixed = { ...initial, pages: 28 };
  assert.equal(assess(fixed).valid, true);
  assert.equal(
    assess({ ...fixed, quantity: 1000 }).mass,
    2 * assess(fixed).mass,
  );
  assert.equal(assess({ ...fixed, delivery: "2026-09-22" }).valid, false);
  assert.equal(
    assess({ ...fixed, pages: 25, binding: "Dos carré collé" }).valid,
    false,
  );
});
