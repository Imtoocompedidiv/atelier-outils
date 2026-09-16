import test from "node:test";
import assert from "node:assert/strict";
import {
  initialSessions,
  validateSlot,
  confirmSlot,
  hourSummary,
  weekDays,
} from "../src/demos/blue-sky-formation/model.js";
import { calendarFile } from "../src/shared/calendar.js";
test("a moved session is replaced, never added or counted twice", () => {
  assert.deepEqual(hourSummary(initialSessions), {
    done: 4,
    planned: 6,
    unplanned: 2,
    total: 12,
  });
  const slot = { date: "2026-09-25", time: "10:00", duration: 120 };
  const first = confirmSlot(initialSessions, 6, slot);
  const repeated = confirmSlot(first.sessions, 6, slot);
  assert.equal(repeated.sessions.length, 6);
  assert.deepEqual(hourSummary(repeated.sessions), {
    done: 4,
    planned: 8,
    unplanned: 0,
    total: 12,
  });
});
test("overlaps block the proposal, adjacent slots are accepted", () => {
  assert.match(
    validateSlot(
      { date: "2026-09-22", time: "11:00", duration: 120 },
      initialSessions,
      6,
    ),
    /Chevauchement/,
  );
  assert.equal(
    validateSlot(
      { date: "2026-09-22", time: "12:00", duration: 120 },
      initialSessions,
      6,
    ),
    "",
  );
  assert.ok(
    validateSlot(
      { date: "2026-09-25", time: "17:00", duration: 120 },
      initialSessions,
      6,
    ),
  );
  assert.ok(
    validateSlot(
      { date: "2026-02-30", time: "10:00", duration: 120 },
      initialSessions,
      6,
    ),
  );
  assert.ok(
    validateSlot(
      { date: "2026-09-25", time: "10:00", duration: 60 },
      initialSessions,
      6,
    ),
  );
});
test("calendar retains local times, uses valid dates and escapes user text", () => {
  const ics = calendarFile([
    {
      id: "x",
      date: "2026-09-25",
      time: "10:00",
      duration: 120,
      title: "Cours, test; matin\nSuite",
    },
  ]);
  assert.match(ics, /DTSTART:20260925T100000\r\nDTEND:20260925T120000/);
  assert.match(ics, /SUMMARY:Cours\\, test\\; matin\\nSuite/);
  assert.throws(() => calendarFile([{ id: "x", date: "2026-02-30" }]));
  assert.deepEqual(weekDays("2026-09-25"), [
    "2026-09-21",
    "2026-09-22",
    "2026-09-23",
    "2026-09-24",
    "2026-09-25",
  ]);
});
