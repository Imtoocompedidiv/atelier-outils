import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  arrivals,
  schedule,
  toIcs,
} from "../src/demos/voluntae/model.js";
test("Calendar arithmetic crosses month, year and daylight-saving changes", () => {
  assert.equal(addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(addDays("2026-12-28", 7), "2027-01-04");
  assert.throws(() => addDays("2026-02-30", 1));
});
test("Calendar exports only pending events and escapes delimiters", () => {
  const events = schedule(arrivals, [7, 21, 45], { "em-0": true });
  const ics = toIcs(events, new Date("2026-09-16T12:00:00Z"));
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 11);
  assert.ok(ics.includes("DTSTAMP:20260916T120000Z"));
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20260928"));
  for (const line of ics.split("\r\n"))
    assert.ok(new TextEncoder().encode(line).length <= 75);
});
