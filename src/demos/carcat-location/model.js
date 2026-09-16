export const seed = [
  {
    id: 1,
    name: "Assiettes",
    out: 120,
    back: 117,
    broken: 2,
    fee: 250,
    washed: false,
  },
  {
    id: 2,
    name: "Verres",
    out: 180,
    back: 179,
    broken: 1,
    fee: 320,
    washed: false,
  },
  {
    id: 3,
    name: "Nappes",
    out: 12,
    back: 12,
    broken: 0,
    fee: 2400,
    washed: false,
  },
  {
    id: 4,
    name: "Chaises",
    out: 60,
    back: 60,
    broken: 0,
    fee: 4500,
    washed: false,
  },
];
export function reconcile(rows) {
  return rows.map((r) => {
    const valid =
      [r.out, r.back, r.broken].every(
        (x) => Number.isInteger(x) && x >= 0 && x <= 10000,
      ) && r.back + r.broken <= r.out;
    const missing = valid ? r.out - r.back - r.broken : null;
    return {
      ...r,
      valid,
      missing,
      adjustment: valid ? (missing + r.broken) * r.fee : 0,
    };
  });
}
