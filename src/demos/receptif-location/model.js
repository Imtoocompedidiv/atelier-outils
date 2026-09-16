export const events = [
  {
    id: "R-26041",
    name: "Déjeuner sous verrière",
    client: "Client exemple A",
    day: "2026-09-14",
    base: 58600,
    checked: false,
    rows: [
      {
        id: "verre",
        name: "Verres à eau",
        out: 96,
        back: 94,
        broken: 1,
        fee: 300,
        note: "",
      },
      {
        id: "chaise",
        name: "Chaises de réception",
        out: 48,
        back: 48,
        broken: 0,
        fee: 4800,
        note: "",
      },
      {
        id: "table",
        name: "Tables rondes",
        out: 6,
        back: 6,
        broken: 0,
        fee: 18000,
        note: "",
      },
    ],
  },
  {
    id: "R-26042",
    name: "Cocktail de rentrée",
    client: "Client exemple B",
    day: "2026-09-15",
    base: 32400,
    checked: false,
    rows: [
      {
        id: "flute",
        name: "Flûtes",
        out: 120,
        back: 120,
        broken: 0,
        fee: 360,
        note: "",
      },
      {
        id: "mange",
        name: "Mange-debout",
        out: 8,
        back: 8,
        broken: 0,
        fee: 14500,
        note: "",
      },
    ],
  },
  {
    id: "R-26043",
    name: "Dîner de l’atelier",
    client: "Client exemple C",
    day: "2026-09-16",
    base: 41800,
    checked: false,
    rows: [
      {
        id: "assiette",
        name: "Assiettes plates",
        out: 80,
        back: 78,
        broken: 2,
        fee: 620,
        note: "",
      },
      {
        id: "nappe",
        name: "Nappes",
        out: 10,
        back: 10,
        broken: 0,
        fee: 7200,
        note: "",
      },
    ],
  },
];
export function prepare(event) {
  const rows = event.rows.map((r) => {
    const valid =
      [r.out, r.back, r.broken].every((x) => Number.isInteger(x) && x >= 0) &&
      r.back + r.broken <= r.out;
    const missing = valid ? r.out - r.back - r.broken : 0;
    const incident = valid && missing + r.broken > 0;
    return {
      ...r,
      valid,
      missing,
      incident,
      addition: valid ? (missing + r.broken) * r.fee : 0,
      needsNote: incident && !r.note.trim(),
    };
  });
  const valid = rows.every((r) => r.valid),
    unexplained = rows.filter((r) => r.needsNote).length,
    extra = rows.reduce((sum, r) => sum + r.addition, 0);
  return {
    rows,
    valid,
    unexplained,
    extra,
    total: event.base + extra,
    ready: valid && !unexplained && event.checked,
  };
}
