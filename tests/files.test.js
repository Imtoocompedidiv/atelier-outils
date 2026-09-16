import test from "node:test";
import assert from "node:assert/strict";
import { csvCell, toCsv, parseQuantity } from "../src/shared/files.js";

test("CSV preserves French text, multiline values and quotes", () => {
  assert.equal(csvCell('Étagère "A"\nAtelier'), '"Étagère ""A""\nAtelier"');
  assert.equal(
    toCsv(["Lot", "Qté"], [["Décor; bleu", 4]]),
    '\uFEFF"Lot";"Qté"\r\n"Décor; bleu";"4"',
  );
});
test("Spreadsheet exports neutralize formula injection", () => {
  for (const sample of [
    '=HYPERLINK("https://example.com")',
    "+SUM(A1)",
    "@cmd",
    "  =1+1",
  ])
    assert.ok(csvCell(sample).startsWith("\"'"));
});
test("Quantity parsing bounds malformed and unbounded values", () => {
  assert.equal(parseQuantity("2,5"), 2.5);
  assert.equal(parseQuantity("-8"), 0);
  assert.equal(parseQuantity("Infinity"), 0);
  assert.equal(parseQuantity("99999", { max: 500 }), 500);
});
