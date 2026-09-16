import test from "node:test";
import assert from "node:assert/strict";
import {
  makeDocuments,
  documentStatus,
  newVersion,
  review,
  manifest,
} from "./model.js";
test("outdated dependent reference blocks manifest", () => {
  const d = makeDocuments();
  assert.equal(documentStatus(d[1], d).ready, false);
  assert.throws(() => manifest(d));
  const r = review(d, "lettre");
  assert.equal(manifest(r).documents.length, 3);
  assert.deepEqual(manifest(r).documents[1].validatedReferences, { vols: 2 });
});
test("new version re-invalidates a previously reviewed letter", () => {
  const d = newVersion(review(makeDocuments(), "lettre"), "vols", "version 3");
  assert.equal(documentStatus(d[1], d).ready, false);
  assert.equal(d[1].references.vols, 2);
  assert.equal(d[0].version, 3);
  assert.throws(() => manifest(d));
});
test("editing content requires self review and manifest excludes content", () => {
  const d = newVersion(
    review(makeDocuments(), "lettre"),
    "lettre",
    "new private sample",
  );
  assert.equal(documentStatus(d[1], d).selfPending, true);
  const r = review(d, "lettre");
  assert.equal(manifest(r).documents[1].version, 2);
  assert.equal(
    JSON.stringify(manifest(r)).includes("new private sample"),
    false,
  );
});
