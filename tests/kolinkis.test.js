import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateCents,
  updateSeats,
  initialCompanies,
  COST,
} from "../src/demos/kolinkis/model.js";
test("Largest remainder allocation preserves every cent, including uneven shares", () => {
  for (let total = 1; total < 1500; total += 17) {
    const parts = allocateCents(total, [2, 3, 4]);
    assert.equal(
      parts.reduce((a, b) => a + b, 0),
      total,
    );
  }
  assert.deepEqual(allocateCents(COST, [2, 1, 0]), [242000, 121000, 0]);
  assert.deepEqual(allocateCents(COST, [0, 0, 0]), [null, null, null]);
});
test("Requests and confirmations enforce separate capacity invariants", () => {
  assert.ok(updateSeats(initialCompanies, "a", "requested", 4).error);
  assert.ok(updateSeats(initialCompanies, "a", "confirmed", 4).error);
  assert.ok(updateSeats(initialCompanies, "a", "requested", 1).error);
  assert.equal(
    updateSeats(initialCompanies, "c", "confirmed", 2).companies[2].confirmed,
    2,
  );
});
