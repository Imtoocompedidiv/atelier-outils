import { test } from "node:test";
import assert from "node:assert/strict";
import { initial, inspect, readCsv } from "./model.js";
test("index détecte doublon et date impossible, corrigés par révision distincte", () => {
  const rows = structuredClone(initial);
  assert.equal(inspect(rows).filter((r) => !r.valid).length, 3);
  rows[2].date = "2026-02-30";
  assert.ok(inspect(rows)[2].errors.some((x) => x.includes("Date")));
  rows[2].date = "2026-09-12";
  rows[4].revision = "B";
  assert.equal(inspect(rows).filter((r) => !r.valid).length, 0);
});
test("import CSV conserve les séparateurs cités et refuse un fichier mal formé", () => {
  const rows = readCsv(
    'fichier;reference;revision;date;pages;groupe\n"Plan; entrée.pdf";A-1;A;2026-09-12;1;Architecture',
  );
  assert.equal(rows[0].fichier, "Plan; entrée.pdf");
  assert.throws(() => readCsv("a;b\n1;2"));
  assert.throws(() =>
    readCsv('fichier;reference;revision;date;pages;groupe\n"ouvert'),
  );
});
