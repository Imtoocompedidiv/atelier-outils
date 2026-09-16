import test from "node:test";
import assert from "node:assert/strict";
import { initial, assess, worksheet } from "./model.js";
test("six measures produce exact differences, not fabricated working dimensions", () => {
  const r = assess(initial);
  assert.equal(r.minWidth, 1102);
  assert.equal(r.widthGap, 18);
  assert.equal(r.heightGap, 12);
  assert.equal(r.minHeight, 2388);
  assert.ok(worksheet(initial).includes("pas des dimensions de fabrication"));
});
test("invalid or ambiguous measures block the worksheet", () => {
  for (const value of ["", "1.2", "-1", "11000", "1e3"]) {
    const f = { ...initial, top: value };
    assert.equal(assess(f).valid, false);
    assert.throws(() => worksheet(f));
  }
});
test("site questions follow changed measurements and declared obstacles", () => {
  const f = {
    ...initial,
    bottom: "1102",
    middle: "1102",
    left: "2388",
    plinth: false,
    uneven: false,
    socket: true,
  };
  const r = assess(f);
  assert.equal(r.widthGap, 0);
  assert.equal(r.heightGap, 0);
  assert.equal(r.questions.length, 1);
  assert.ok(r.questions[0].includes("prise"));
});
