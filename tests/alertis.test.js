import test from "node:test";
import assert from "node:assert/strict";
import { analyze, seedSessions } from "../src/demos/alertis/model.js";
test("Missing data is not zero and invalid values cannot contaminate means", () => {
  const s = analyze(seedSessions[0].rows);
  assert.equal(s.responses, 6);
  assert.equal(s.missing.length, 1);
  assert.equal(s.invalid.length, 1);
  assert.equal(s.columns[1].count, 5);
  assert.equal(s.columns[1].mean, 4);
  assert.equal(s.columns[2].count, 5);
  assert.equal(s.pending.length, 1);
});
test("Exclusion is explicit and changes readiness rather than the valid mean", () => {
  const s = analyze(seedSessions[0].rows, new Set(["4-1"]));
  assert.equal(s.pending.length, 0);
  assert.equal(s.columns[1].mean, 4);
  assert.equal(analyze([["", "", "", ""]]).columns[0].mean, null);
});
