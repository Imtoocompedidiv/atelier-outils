import test from "node:test";
import assert from "node:assert/strict";
import {
  allowedDocuments,
  buildManifest,
} from "../src/demos/talent-in-sight/model.js";
test("Video approval is bound to its recipient and internal notes never leave", () => {
  const ids = ["cv", "pitch", "internal"];
  assert.deepEqual(
    allowedDocuments(ids, "A", { recipient: "B", confirmed: true }).map(
      (d) => d.id,
    ),
    ["cv"],
  );
  assert.deepEqual(
    allowedDocuments(ids, "A", { recipient: "A", confirmed: true }).map(
      (d) => d.id,
    ),
    ["cv", "pitch"],
  );
  assert.deepEqual(
    allowedDocuments(ids, "A", { recipient: "A", confirmed: false }).map(
      (d) => d.id,
    ),
    ["cv"],
  );
});
test("Manifest hashes exact exported text and excludes absent permissions", async () => {
  const manifest = await buildManifest(["cv", "pitch", "internal"], "A", null);
  assert.equal(manifest.files.length, 1);
  assert.match(manifest.files[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal(
    manifest.files[0].bytes,
    new TextEncoder().encode(manifest.files[0].content).length,
  );
  assert.doesNotMatch(JSON.stringify(manifest), /notes-internes/);
});
