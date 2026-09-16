import { test } from "node:test";
import assert from "node:assert/strict";
import { base, validate } from "./model.js";
test("brief accepte le témoin et repère les travées étroites et cotes invalides", () => {
  assert.deepEqual(validate(base), []);
  assert.equal(validate({ ...base, width: 800 }).length, 1);
  assert.equal(validate({ ...base, depth: 0 }).length, 1);
});
