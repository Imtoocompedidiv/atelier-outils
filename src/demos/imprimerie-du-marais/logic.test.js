import test from "node:test";
import assert from "node:assert/strict";
import { initial, schedule, removeNode } from "./model.js";
test("serial dependency computes 11h and all nodes critical", () => {
  const r = schedule(initial);
  assert.equal(r.valid, true);
  assert.equal(r.total, 1100);
  assert.equal(
    Object.values(r.times).every((t) => t.critical),
    true,
  );
});
test("parallel branches use longest path, not sum", () => {
  const nodes = [
    initial[0],
    { ...initial[1], hours: "4" },
    { ...initial[2], hours: "2", deps: ["P1"] },
    { ...initial[3], deps: ["P2", "P3"] },
  ];
  const r = schedule(nodes);
  assert.equal(r.total, 900);
  assert.equal(r.times.P3.critical, false);
  assert.equal(r.times.P4.start, 600);
});
test("cycles and invalid references block export; removing a node clears references", () => {
  assert.equal(
    schedule(initial.map((n) => (n.id === "P1" ? { ...n, deps: ["P4"] } : n)))
      .valid,
    false,
  );
  assert.equal(schedule([{ ...initial[0], deps: ["missing"] }]).valid, false);
  assert.equal(schedule(removeNode(initial, "P2")).valid, true);
  assert.equal(schedule([{ ...initial[0], hours: "0" }]).valid, false);
});
