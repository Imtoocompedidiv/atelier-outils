import test from "node:test";
import assert from "node:assert/strict";
import { initial, estimate, editLine, amount } from "./model.js";
test("one exclusive variant plus shared base and optional finish, never both", () => {
  assert.equal(estimate(initial, "A").ht, 130500);
  assert.equal(estimate(initial, "B").ht, 304500);
  assert.equal(estimate({ ...initial, option: true }, "A").ht, 164100);
  assert.equal(estimate(initial, "A").total, 156600);
});
test("fractional quantities rounded by line and changes invalidate scope confirmation", () => {
  assert.equal(amount({ quantity: "1,25", price: "12.35" }), 1544);
  assert.equal(amount({ quantity: "-1", price: "10" }), null);
  assert.equal(amount({ quantity: "1", price: "12.345" }), null);
  const next = editLine(
    { ...initial, checked: { ...initial.checked, scope: true } },
    "A",
    "A1",
    "price",
    "150",
  );
  assert.equal(next.checked.scope, false);
  assert.equal(initial.variants.A[0].price, "145.00");
});
