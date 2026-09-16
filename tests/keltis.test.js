import test from "node:test";
import assert from "node:assert/strict";
import {
  seed,
  auditAnnouncement,
  applyFields,
} from "../src/demos/keltis/model.js";
test("Editorial checker finds exact placeholders, duplicate and absent field", () => {
  const issues = auditAnnouncement(seed);
  assert.equal(issues.length, 5);
  assert.equal(issues.filter((i) => i.id.startsWith("marker")).length, 3);
  for (const issue of issues.filter((i) => i.start !== undefined))
    assert.equal(seed.body.slice(issue.start, issue.end), issue.detail);
});
test("Applying fields never erases a placeholder when the value is missing", () => {
  const partial = applyFields(seed);
  assert.match(partial.body, /\[localisation du poste\]/);
  assert.doesNotMatch(partial.body, /\[intitulé du poste\]/);
  const complete = applyFields({ ...seed, location: "Lyon" });
  assert.equal(auditAnnouncement(complete).length, 1);
});
