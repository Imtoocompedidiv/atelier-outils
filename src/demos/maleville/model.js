export const crates = [
  { id: "A", room: "Salon", capacity: 4 },
  { id: "B", room: "Salon", capacity: 4 },
  { id: "C", room: "Bureau", capacity: 6 },
];
export const initial = [
  ["S01", "Joue gauche", "Salon", "2 400 × 420", "A"],
  ["S02", "Joue droite", "Salon", "2 400 × 420", "A"],
  ["S03", "Traverse haute", "Salon", "1 760 × 420", "A"],
  ["S04", "Socle", "Salon", "1 760 × 420", "A"],
  ["S05", "Tablette haute", "Salon", "1 760 × 380", "B"],
  ["S06", "Tablette basse", "Salon", "1 760 × 380", ""],
  ["B01", "Joue gauche", "Bureau", "2 100 × 360", "C"],
  ["B02", "Joue droite", "Bureau", "2 100 × 360", "C"],
  ["B03", "Traverse haute", "Bureau", "1 200 × 360", "C"],
  ["B04", "Socle", "Bureau", "1 200 × 360", "C"],
  ["B05", "Tablette haute", "Bureau", "1 200 × 320", ""],
  ["B06", "Tablette basse", "Bureau", "1 200 × 320", ""],
].map(([id, name, room, dimensions, crate]) => ({
  id,
  name,
  room,
  dimensions,
  crate,
  checked: false,
}));
export function assign(pieces, id, crateId) {
  const piece = pieces.find((p) => p.id === id);
  const crate = crates.find((c) => c.id === crateId);
  if (!piece || (crateId && (!crate || crate.room !== piece.room)))
    return {
      pieces,
      error: "Cette caisse est destinée à une autre pièce du logement.",
    };
  if (
    crate &&
    piece.crate !== crateId &&
    pieces.filter((p) => p.crate === crateId).length >= crate.capacity
  )
    return {
      pieces,
      error: `La capacité d’exemple de la caisse ${crateId} est atteinte.`,
    };
  return {
    pieces: pieces.map((p) =>
      p.id === id
        ? {
            ...p,
            crate: crateId,
            checked: p.crate === crateId ? p.checked : false,
          }
        : p,
    ),
    error: "",
  };
}
export function review(pieces) {
  const ids = new Set();
  const errors = [];
  for (const p of pieces) {
    if (ids.has(p.id)) errors.push(`Repère dupliqué : ${p.id}`);
    ids.add(p.id);
    if (!p.crate) errors.push(`${p.id} sans caisse`);
    else if (!crates.some((c) => c.id === p.crate && c.room === p.room))
      errors.push(`${p.id} dans une caisse incompatible`);
    if (!p.checked) errors.push(`${p.id} à pointer`);
  }
  for (const c of crates)
    if (pieces.filter((p) => p.crate === c.id).length > c.capacity)
      errors.push(`Caisse ${c.id} au-delà de sa capacité d’exemple`);
  return {
    errors,
    ready: pieces.length > 0 && errors.length === 0,
    assigned: pieces.filter((p) => p.crate).length,
    checked: pieces.filter((p) => p.checked).length,
  };
}
