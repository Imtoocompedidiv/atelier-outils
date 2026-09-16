export const headers = [
  "fichier",
  "reference",
  "revision",
  "date",
  "pages",
  "groupe",
];
export const initial = [
  {
    fichier: "BAT_A-100_Plan-masse.pdf",
    reference: "A-100",
    revision: "A",
    date: "2026-09-10",
    pages: 1,
    groupe: "Architecture",
  },
  {
    fichier: "BAT_A-101_RDC.pdf",
    reference: "A-101",
    revision: "A",
    date: "2026-09-10",
    pages: 1,
    groupe: "Architecture",
  },
  {
    fichier: "BAT_S-200_Fondations.pdf",
    reference: "S-200",
    revision: "B",
    date: "",
    pages: 2,
    groupe: "Structure",
  },
  {
    fichier: "CVC_C-300_Principe.pdf",
    reference: "C-300",
    revision: "A",
    date: "2026-09-11",
    pages: 1,
    groupe: "Fluides",
  },
  {
    fichier: "CVC_C-300_Copie.pdf",
    reference: "C-300",
    revision: "A",
    date: "2026-09-11",
    pages: 1,
    groupe: "Fluides",
  },
  {
    fichier: "VRD_V-500_Reseaux.pdf",
    reference: "V-500",
    revision: "C",
    date: "2026-09-12",
    pages: 1,
    groupe: "VRD",
  },
];
const key = (r) =>
  `${r.reference.trim().toUpperCase()}|${r.revision.trim().toUpperCase()}`;
export function inspect(rows) {
  const count = new Map();
  rows.forEach((r) => count.set(key(r), (count.get(key(r)) || 0) + 1));
  return rows.map((r, i) => {
    const errors = [];
    if (!r.fichier.trim()) errors.push("Nom de fichier manquant");
    if (!r.reference.trim()) errors.push("Référence manquante");
    if (!r.revision.trim()) errors.push("Révision manquante");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
      !Number.isFinite(Date.parse(r.date)) ||
      new Date(r.date).toISOString().slice(0, 10) !== r.date
    )
      errors.push("Date manquante ou invalide");
    if (
      !Number.isInteger(Number(r.pages)) ||
      Number(r.pages) < 1 ||
      Number(r.pages) > 100000
    )
      errors.push("Nombre de pages invalide");
    if (r.reference.trim() && count.get(key(r)) > 1)
      errors.push("Référence et révision en doublon");
    return { ...r, index: i, errors, valid: !errors.length };
  });
}
export function readCsv(text) {
  if (text.length > 2_000_000)
    throw Error("Fichier trop volumineux. Maximum 2 Mo.");
  const clean = text.replace(/^\uFEFF/, "");
  const first = clean.split(/\r?\n/)[0],
    sep = first.includes(";") ? ";" : ",";
  const data = [],
    row = [];
  let value = "",
    quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (c === '"') {
      if (quoted && clean[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === sep && !quoted) {
      row.push(value);
      value = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(value);
      if (row.some((x) => x.trim())) data.push([...row]);
      row.length = 0;
      value = "";
    } else value += c;
  }
  if (quoted) throw Error("Guillemets non fermés dans le CSV.");
  row.push(value);
  if (row.some((x) => x.trim())) data.push(row);
  if (data.length < 2)
    throw Error("Ajoutez au moins une ligne sous les en-têtes.");
  const names = data.shift().map((x) => x.trim().toLowerCase());
  if (headers.some((h) => !names.includes(h)))
    throw Error(`En-têtes attendus : ${headers.join(", ")}.`);
  if (data.length > 500)
    throw Error("Cette démonstration accepte 500 documents au maximum.");
  return data.map((cells) =>
    Object.fromEntries(
      headers.map((h) => [h, (cells[names.indexOf(h)] || "").trim()]),
    ),
  );
}
