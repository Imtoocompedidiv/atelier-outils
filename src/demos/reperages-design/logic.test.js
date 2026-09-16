import test from "node:test";
import assert from "node:assert/strict";
import { initialOrders, orderMath, dateShift, money } from "./model.js";
test("40 % acompte et échéance dix jours avant départ", () => {
  const r = orderMath(initialOrders[0]);
  assert.equal(r.total, 480000);
  assert.equal(r.advance, 192000);
  assert.equal(r.balance, 288000);
  assert.equal(r.due, "2026-10-02");
});
test("dates et arrondis robustes", () => {
  assert.equal(dateShift("2026-03-02", 10), "2026-02-20");
  assert.equal(dateShift("2026-02-30", 10), null);
  assert.equal(money("19,99"), 1999);
  assert.equal(money("19.999"), null);
  assert.equal(orderMath({ ...initialOrders[0], quantity: "" }).valid, false);
});
