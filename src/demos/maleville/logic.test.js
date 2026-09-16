import test from "node:test";
import assert from "node:assert/strict";
import { initial, assign, review } from "./model.js";
test("room segregation and crate capacity are enforced", () => {
  assert.match(assign(initial, "B05", "A").error, /autre pièce/);
  assert.match(assign(initial, "S06", "A").error, /capacité/);
  assert.equal(assign(initial, "S06", "B").error, "");
});
test("manifest needs every unique piece assigned and checked; reassignment invalidates check", () => {
  let p = initial.map((x) => ({
    ...x,
    crate: x.crate || (x.room === "Salon" ? "B" : "C"),
    checked: true,
  }));
  assert.equal(review(p).ready, true);
  p = assign(p, "S05", "").pieces;
  assert.equal(p.find((x) => x.id === "S05").checked, false);
  assert.equal(review(p).ready, false);
  assert.equal(
    review([...initial, initial[0]]).errors.some((e) => e.includes("dupliqué")),
    true,
  );
});
