import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, validate } from "./model.js";
test("dossier prépare les sujets non confirmés sans autoriser la fabrication", () => {
  assert.equal(validate(initial).valid, true);
  assert.deepEqual(validate(initial).missing, ["Cotes relevées à revoir"]);
  assert.equal(validate({ ...initial, route: "Fournisseur" }).valid, false);
  assert.equal(
    validate({ ...initial, route: "Fournisseur", supplier: "Exemple" }).valid,
    true,
  );
  assert.equal(validate({ ...initial, width: NaN }).valid, false);
  assert.equal(validate({ ...initial, ral: "70" }).valid, false);
});
