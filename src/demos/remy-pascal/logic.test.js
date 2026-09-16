import test from "node:test";
import assert from "node:assert/strict";
import { initial, missing, edit, validate } from "./model.js";
test("completion requires sequential human records", () => {
  let s = structuredClone(initial[0]);
  assert.equal(validate(s, 3).stages[3], false);
  s = edit(s, "technician", "AB");
  s = validate(s, 0);
  s = edit(s, "diagnosis", "Rapport professionnel de démonstration");
  s = validate(s, 1);
  s = edit(s, "approval", true);
  s = edit(s, "approvalRef", "Accord fictif D026");
  s = validate(s, 2);
  assert.equal(missing(s, 3).length, 2);
  s = edit(s, "testNote", "Compte rendu contrôle témoin");
  s = edit(s, "recipient", "Déposant témoin");
  s = validate(s, 3);
  assert.equal(s.stages.every(Boolean), true);
});
test("changed diagnosis cancels downstream approval; final note preserves earlier stages", () => {
  const complete = {
    ...initial[0],
    approval: true,
    approvalRef: "X",
    stages: [true, true, true, true],
  };
  const next = edit(complete, "diagnosis", "Changement");
  assert.deepEqual(next.stages, [true, false, false, false]);
  assert.equal(next.approval, false);
  assert.deepEqual(edit(complete, "testNote", "Y").stages, [
    true,
    true,
    true,
    false,
  ]);
});
