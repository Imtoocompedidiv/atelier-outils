export const themes = ["Accueil", "Contenu", "Animation", "Organisation"];
export const seedSessions = [
  {
    id: "atelier",
    title: "Prévention en atelier",
    asked: 8,
    rows: [
      [4, 5, 4, 4],
      [5, 4, 4, 5],
      [3, 4, 5, 4],
      [4, 3, "", 4],
      [5, 7, 4, 5],
      [4, 4, 3, 4],
    ],
    cold: [true, true, false, true, false, false],
  },
  {
    id: "incendie",
    title: "Évacuation, exercice de démonstration",
    asked: 7,
    rows: [
      [5, 4, 4, 5],
      [4, 5, 5, 4],
      [4, 4, 4, 4],
      [3, 4, 4, 5],
      [5, 5, 4, 5],
    ],
    cold: [true, false, false, false, true],
  },
  {
    id: "accueil",
    title: "Accueil des nouveaux arrivants",
    asked: 6,
    rows: [
      [4, 4, 5, 4],
      [5, 4, 4, 5],
      [4, "", 4, 4],
      [3, 4, 4, 4],
    ],
    cold: [false, false, true, false],
  },
];
export const validScore = (value) =>
  value !== "" &&
  value !== null &&
  Number.isInteger(Number(value)) &&
  Number(value) >= 1 &&
  Number(value) <= 5;
export function analyze(rows, excluded = new Set()) {
  const invalid = [],
    missing = [];
  const columns = themes.map((name, column) => {
    const values = [];
    rows.forEach((row, index) => {
      const value = row[column],
        key = `${index}-${column}`;
      if (value === "" || value === null) {
        missing.push({ key, row: index, column });
        return;
      }
      if (!validScore(value)) {
        invalid.push({
          key,
          row: index,
          column,
          value,
          excluded: excluded.has(key),
        });
        return;
      }
      values.push(Number(value));
    });
    return {
      name,
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      mean: values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null,
    };
  });
  return {
    columns,
    invalid,
    missing,
    pending: invalid.filter((v) => !v.excluded),
    responses: rows.filter((r) => r.some((v) => v !== "" && v !== null)).length,
  };
}
