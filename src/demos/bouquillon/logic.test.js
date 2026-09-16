import test from "node:test";
import assert from "node:assert/strict";
import { initial, changeSpec, toggleStage, canComplete } from "./model.js";
test("révision invalide toutes les validations", () =>
  assert.equal(
    changeSpec(
      { ...initial, steps: Array(6).fill(true) },
      "width",
      "260",
    ).steps.some(Boolean),
    false,
  ));
test("forge attend le contrôle des six pièces", () => {
  assert.equal(canComplete(initial, 2), false);
  assert.equal(
    canComplete({ ...initial, pieces: Array(6).fill(true) }, 2),
    true,
  );
});
test("invalidation se propage aux étapes suivantes", () =>
  assert.deepEqual(
    toggleStage({ ...initial, steps: Array(6).fill(true) }, 2).steps,
    [true, true, false, false, false, false],
  ));
test("changement finition conserve étapes antérieures", () =>
  assert.deepEqual(
    changeSpec({ ...initial, steps: Array(6).fill(true) }, "finish", "Brut")
      .steps,
    [true, true, true, true, false, false],
  ));
