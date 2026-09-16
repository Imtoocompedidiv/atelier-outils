import { test } from "node:test";
import assert from "node:assert/strict";
import { seed, schedule } from "./model.js";
test("tournée inclut le trajet et permet de corriger le créneau", () => {
  const p = schedule(seed);
  assert.equal(p[1].start, 625);
  assert.equal(p[1].late, true);
  const rows = structuredClone(seed);
  rows[1].to = "12:00";
  assert.equal(
    schedule(rows).every((s) => !s.late && s.valid),
    true,
  );
});
