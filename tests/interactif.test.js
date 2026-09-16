import test from "node:test";
import assert from "node:assert/strict";
import {
  initialPeople,
  readiness,
  reminder,
  isReady,
} from "../src/demos/interactif/model.js";

test("Readiness includes human interview and unspecified funding", () => {
  assert.deepEqual(readiness(initialPeople), { ready: 3, total: 6, onsite: 4 });
  assert.equal(
    isReady({
      interview: true,
      agreement: true,
      expectations: true,
      funding: "À préciser",
    }),
    false,
  );
});
test("Reminder mentions only missing actions", () => {
  const text = reminder(initialPeople[0], "28 septembre");
  assert.match(text, /questionnaire/);
  assert.doesNotMatch(text, /convention signée/);
  assert.doesNotMatch(text, /rendez-vous de positionnement/);
  assert.equal(reminder(initialPeople[1], "28 septembre"), "");
});
test("Completing received items clears only the matching blocker", () => {
  const person = { ...initialPeople[3], interview: true };
  assert.equal(isReady(person), false);
  assert.match(reminder(person, "28 septembre"), /financement/);
  assert.doesNotMatch(
    reminder(person, "28 septembre"),
    /rendez-vous de positionnement/,
  );
  assert.equal(isReady({ ...person, funding: "Entreprise" }), true);
});
