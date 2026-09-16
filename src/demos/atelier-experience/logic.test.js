import test from "node:test";
import assert from "node:assert/strict";
import { components, differences, validComponent } from "./model.js";
test("modification de finition cible la peinture sans changer la menuiserie", () =>
  assert.deepEqual(
    differences(components[0], {
      ...components[0],
      finish: "Ivoire satiné",
    }).impacts.map((x) => x.name),
    ["Peinture"],
  ));
test("dimensions affectent fabrication et logistique", () =>
  assert.equal(
    differences(components[0], { ...components[0], width: 1400 }).impacts
      .length,
    2,
  ));
test("absence de changement, valeur vide et quantité décimale", () => {
  assert.equal(differences(components[0], components[0]).changes.length, 0);
  assert.equal(validComponent({ ...components[0], width: "" }), false);
  assert.equal(validComponent({ ...components[0], quantity: 2.4 }), false);
});
