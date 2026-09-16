import test from "node:test";
import assert from "node:assert/strict";
import { safeTarget, fragment, products } from "./model.js";
test("refuse local, scripts, sous-domaines trompeurs et identifiants", () => {
  for (const u of [
    "http://localhost/",
    "javascript:alert(1)",
    "https://www.bercycopie.fr.evil.test/",
    "https://x@www.bercycopie.fr/",
  ])
    assert.equal(safeTarget(u), false);
  assert.equal(safeTarget(products[0].target), true);
});
test("export incomplet interdit, attributs échappés", () => {
  assert.throws(() => fragment(products));
  assert.match(
    fragment([
      { name: "A < B", target: "https://www.bercycopie.fr/devis/?a=1&b=2" },
    ]),
    /A &lt; B/,
  );
});
