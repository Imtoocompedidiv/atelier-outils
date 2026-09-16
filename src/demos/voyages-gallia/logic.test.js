import test from "node:test";
import assert from "node:assert/strict";
import { travellers, makeRooms, analyse, move, exportRows } from "./model.js";
test("initial rooming highlights two unassigned and one overload", () => {
  const s = analyse(makeRooms(), travellers);
  assert.equal(s.unassigned.length, 2);
  assert.deepEqual(s.overflow, ["203"]);
  assert.equal(s.bedNights, 36);
  assert.throws(() => exportRows(makeRooms(), travellers, "Hôtel de la Ria"));
});
test("moving three people resolves allocation without duplicate", () => {
  let r = makeRooms();
  for (const id of ["p6", "p10", "p11"]) r = move(r, id, "206");
  assert.equal(analyse(r, travellers).ready, true);
  assert.equal(exportRows(r, travellers, "Hôtel de la Ria").length, 12);
  r = move(r, "p6", "201");
  assert.equal(r.flatMap((x) => x.guests).filter((x) => x === "p6").length, 1);
  assert.equal(analyse(r, travellers).ready, false);
  assert.throws(() => move(r, "p0", "unknown"));
});
test("duration and hotel boundaries remain exact in export", () => {
  let r = makeRooms();
  for (const id of ["p6", "p10", "p11"]) r = move(r, id, "206");
  r = r.map((x) => (x.id === "206" ? { ...x, hotel: "Autre hôtel" } : x));
  const p = travellers.map((x) => (x.id === "p0" ? { ...x, nights: 1 } : x));
  const out = exportRows(r, p, "Hôtel de la Ria");
  assert.equal(out.length, 9);
  assert.equal(out.find((x) => x[3] === "p0")[6], "2026-10-19");
  assert.equal(
    out.some((x) => x[0] === "Autre hôtel"),
    false,
  );
});
