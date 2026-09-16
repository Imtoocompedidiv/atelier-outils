import test from "node:test";
import assert from "node:assert/strict";
import { makeExample, validateCards, documentFor } from "./model.js";
test("export carnet does not contain any revelation fields", () => {
  const s = makeExample(),
    out = JSON.stringify(documentFor(s, "preparation"));
  for (const c of s.cards) {
    assert.equal(out.includes(c.instruction), false);
    assert.equal(out.includes(c.id), false);
  }
  assert.equal(documentFor(s, "preparation").ouvertureDesEnveloppes.length, 4);
});
test("one envelope export excludes every other instruction", () => {
  const s = makeExample(),
    out = JSON.stringify(documentFor(s, "eau"));
  assert.ok(out.includes(s.cards[1].instruction));
  assert.equal(out.includes(s.cards[2].instruction), false);
  assert.throws(() => documentFor(s, "missing"));
});
test("duplicate number or absent date prevents valid pack", () => {
  const s = makeExample();
  assert.deepEqual(validateCards(s.cards), []);
  s.cards[2].number = 2;
  s.cards[0].date = "";
  assert.equal(validateCards(s.cards).length, 2);
});
test("an impossible date cannot silently roll over to another month", () => {
  const s = makeExample();
  s.cards[0].date = "2026-02-31";
  assert.ok(validateCards(s.cards).some((e) => e.includes("date valide")));
  s.cards[0].date = "99999-01-01";
  assert.ok(validateCards(s.cards).some((e) => e.includes("date valide")));
  s.cards[0].date = "2028-02-29";
  assert.deepEqual(validateCards(s.cards), []);
});
