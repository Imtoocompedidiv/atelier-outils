import test from "node:test";
import assert from "node:assert/strict";
import {
  seedEvents,
  sharedEvents,
  buildReport,
} from "../src/demos/lcrh/model.js";
test("Internal notes cannot enter a client export even if sharing flag is set", () => {
  const events = seedEvents.map((e) => ({ ...e, shared: true }));
  const result = sharedEvents(events, "2026-09-14", "2026-09-20");
  assert.equal(result.length, 8);
  assert.ok(result.every((e) => !e.internal));
  assert.doesNotMatch(
    JSON.stringify(buildReport(events, "2026-09-14", "2026-09-20")),
    /passation|relecture entre consultants/,
  );
});
test("Date windows and empty windows cannot leak other events", () => {
  assert.equal(sharedEvents(seedEvents, "2026-09-20", "2026-09-14").length, 0);
  assert.equal(sharedEvents(seedEvents, "2026-09-18", "2026-09-18").length, 2);
  assert.equal(buildReport(seedEvents, "2026-08-01", "2026-08-02").count, 0);
});
