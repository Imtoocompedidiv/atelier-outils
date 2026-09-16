import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, review, example } from "./model.js";
test("deux lignes dupliquées sont toutes deux signalées", () => {
  const x = review(parseCsv(example));
  assert.match(x[1].join(), /double/);
  assert.match(x[3].join(), /double/);
  assert.match(x[2].join(), /Prénom/);
});
test("CSV respecte guillemets, séparateurs inclus et retours ligne", () => {
  const x = parseCsv(
    'Nom;Prénom;ID;Fonction\r\n"Martin;Dupont";Élise;A1;"Design\nProduit"',
  );
  assert.equal(x[0].nom, "Martin;Dupont");
  assert.equal(x[0].fonction, "Design\nProduit");
});
test("en-têtes et guillemets invalides refusés", () => {
  assert.throws(() =>
    parseCsv('Nom;Prénom;ID;Fonction\n"Martin;Élise;A1;Design'),
  );
  assert.throws(() => parseCsv("Nom;ID;Fonction\nMartin;A1;Design"));
});
