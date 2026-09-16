import test from "node:test";
import assert from "node:assert/strict";
import {
  initialRoster,
  compatiblePairs,
} from "../src/demos/proformalys/model.js";
test("Each pair has all attendees and the same retained trainer", () => {
  const pairs = compatiblePairs(initialRoster);
  assert.equal(pairs.length, 3);
  assert.deepEqual(
    pairs.map((p) => p.dates),
    [
      ["2026-10-05", "2026-10-07"],
      ["2026-10-05", "2026-10-12"],
      ["2026-10-07", "2026-10-12"],
    ],
  );
});
test("No fallback creates a proposal when there is no common availability", () => {
  assert.equal(
    compatiblePairs(
      initialRoster.map((p) =>
        p.kind === "trainer" ? { ...p, enabled: false } : p,
      ),
    ).length,
    0,
  );
  assert.equal(compatiblePairs(initialRoster, true).length, 0);
  assert.equal(
    compatiblePairs(
      initialRoster.map((p) =>
        p.id === "p1" ? { ...p, available: Array(8).fill(false) } : p,
      ),
    ).length,
    0,
  );
});
