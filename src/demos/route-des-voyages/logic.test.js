import test from "node:test";
import assert from "node:assert/strict";
import { original, makeRevision, compare, cents, checkSteps } from "./model.js";
test("money and revision totals stay in cents", () => {
  const r = compare(original, makeRevision());
  assert.equal(r.delta, 18000);
  assert.equal(r.beforeNights, r.afterNights);
  assert.equal(r.changes.length, 3);
  assert.equal(cents("12,03"), 1203);
  assert.equal(cents("12.005"), null);
});
test("addition removal and restoration are distinct", () => {
  const r = makeRevision().filter((x) => x.id !== "sf");
  r.push({
    id: "new",
    destination: "Exemple",
    hotel: "Test",
    nights: "1",
    budget: "42.10",
    activity: "",
  });
  const diff = compare(original, r);
  assert.equal(diff.changes.find((x) => x.id === "sf").type, "retirée");
  assert.equal(diff.changes.find((x) => x.id === "new").type, "ajoutée");
  assert.deepEqual(compare(original, original).changes, []);
});
test("invalid figures prevent export acceptance", () => {
  const r = makeRevision();
  r[0].nights = "-1";
  r[1].budget = "Infinity";
  assert.equal(checkSteps(r).length, 2);
});
