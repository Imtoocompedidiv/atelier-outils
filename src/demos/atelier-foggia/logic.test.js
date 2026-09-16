import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  assess,
  addPoint,
  photoRequest,
  dossier,
  printableDossier,
} from "./model.js";
test("Le dossier initial demande seulement les deux vues absentes", () => {
  const s = initial(),
    r = assess(s);
  assert.equal(r.received, 2);
  assert.deepEqual(
    r.missing.map((v) => v.id),
    ["dessous", "assemblage"],
  );
  assert.equal(r.ready, false);
  assert.match(photoRequest(s), /Le dessous/);
  assert.equal(dossier(s), null);
});
test("Une nouvelle annotation doit être rédigée et reste dans les bornes de la photo", () => {
  let s = initial();
  s.received.dessous = true;
  s.received.assemblage = true;
  s = addPoint(s, "dessous", -20, 150);
  assert.equal(s.points.dessous[0].x, 0);
  assert.equal(s.points.dessous[0].y, 100);
  assert.equal(assess(s).ready, false);
  s.points.dessous[0].text = "Fixation à examiner";
  assert.equal(assess(s).ready, true);
  assert.equal(dossier(s).views[2].observations[0].text, "Fixation à examiner");
  assert.equal(photoRequest(s), "");
});
test("Les exports HTML neutralisent les textes et exigent une image locale valide", () => {
  const s = initial();
  s.received.dessous = s.received.assemblage = true;
  s.points.assise[0].text = "<script>alert(1)</script>";
  const html = printableDossier(s, "data:image/png;base64,AAAA");
  assert.ok(html);
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.equal(printableDossier(s, "javascript:alert(1)"), null);
});
test("Aucun point ajouté sur une vue absente, suppression de réception rebloque le dossier", () => {
  let s = initial();
  assert.equal(addPoint(s, "dessous"), s);
  s.received.dessous = s.received.assemblage = true;
  assert.equal(assess(s).ready, true);
  s.received.ensemble = false;
  assert.equal(assess(s).ready, false);
});
