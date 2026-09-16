import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, resolve, cents } from "./model.js";
test("révision bloque unité différente et prestations nouvelles sans prix validé", () => {
  assert.equal(resolve({ ...seed[1], approved: true }).ready, false);
  assert.equal(
    resolve({ ...seed[1], manual: "95,25", approved: true }).total,
    76200,
  );
  assert.equal(resolve(seed[4]).chosenPrice, null);
  assert.equal(cents("12,34"), 1234);
  assert.equal(cents("12.345"), null);
});
