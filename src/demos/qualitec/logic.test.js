import { test } from "node:test";
import assert from "node:assert/strict";
import { duration } from "./model.js";
test("durée intervention calcule les minutes et refuse horaires inversés ou invalides", () => {
  assert.equal(duration("08:15", "09:35"), 80);
  assert.equal(duration("09:35", "08:15"), null);
  assert.equal(duration("25:00", "26:00"), null);
  assert.equal(duration("", "10:00"), null);
});
