import { test } from "node:test";
import assert from "node:assert/strict";
import { assess, initialItems } from "./model.js";
test("préparation accessoires sans double comptage ni quantités fractionnaires", () => {
  assert.equal(assess(initialItems).missing, 2);
  const completed = initialItems.map((x) =>
    x.id === "lest" ? { ...x, quantity: 8 } : x,
  );
  assert.equal(assess(completed).missing, 0);
  assert.equal(assess(completed).pieces, 78);
  assert.equal(
    assess([{ id: "barnum", quantity: 1.2, price: 100 }]).invalid,
    true,
  );
  assert.equal(
    assess([{ id: "barnum", quantity: NaN, price: 100 }]).invalid,
    true,
  );
});
