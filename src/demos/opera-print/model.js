export const example =
  "Nom;Prénom;ID;Fonction\nDurand;Sophie;A001;Visiteur\nMartin;Jean;B003;Designer\nBernard;;C017;Exposant\nPetit;Lucas;B003;Designer\nMoreau;Élise;D045;Presse\nLefèvre;Antoine;E210;Visiteur";
export function parseCsv(text) {
  if (text.length > 200000)
    throw new Error("Limite de cet exemple : 200 Ko de texte.");
  const rows = [];
  let row = [],
    field = "",
    quoted = false,
    afterQuote = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        afterQuote = true;
      } else field += c;
      continue;
    }
    if (c === '"') {
      if (field || afterQuote)
        throw new Error("Guillemet inattendu dans le CSV.");
      quoted = true;
    } else if (c === ";" || c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      afterQuote = false;
      if (c !== ";") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        if (row.some((x) => x.trim())) rows.push(row);
        row = [];
      }
    } else {
      if (afterQuote && c.trim())
        throw new Error("Texte inattendu après un champ entre guillemets.");
      if (!afterQuote) field += c;
    }
  }
  if (quoted) throw new Error("Un champ entre guillemets n’est pas refermé.");
  row.push(field);
  if (row.some((x) => x.trim())) rows.push(row);
  if (rows.length < 2)
    throw new Error(
      "Ajoutez un en-tête et au moins une ligne. Séparateur attendu : point-virgule.",
    );
  if (rows.length > 1001)
    throw new Error("Limite de la démonstration : 1 000 cartes.");
  const header = rows.shift().map((x) =>
    x
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""),
  );
  const fields = ["nom", "prenom", "id", "fonction"];
  if (
    fields.some((k) => header.indexOf(k) < 0) ||
    new Set(header).size !== header.length
  )
    throw new Error(
      "En-têtes requis, une seule fois chacun : Nom;Prénom;ID;Fonction.",
    );
  return rows.map((r, i) => {
    if (r.length !== header.length)
      throw new Error(
        `Ligne ${i + 2} : ${r.length} colonnes, ${header.length} attendues.`,
      );
    return Object.fromEntries(
      fields.map((k) => [k, r[header.indexOf(k)].trim()]),
    );
  });
}
export function review(rows) {
  const ids = new Map();
  rows.forEach((r) => {
    const id = r.id.trim().toLocaleUpperCase("fr");
    if (id) ids.set(id, (ids.get(id) || 0) + 1);
  });
  return rows.map((r) => {
    const errors = [];
    if (!r.nom.trim()) errors.push("Nom manquant");
    if (!r.prenom.trim()) errors.push("Prénom manquant");
    if (!r.id.trim()) errors.push("ID manquant");
    else if (ids.get(r.id.trim().toLocaleUpperCase("fr")) > 1)
      errors.push("ID en double");
    if (Object.values(r).some((x) => x.length > 80))
      errors.push("Champ supérieur à 80 caractères");
    if (r.id && !/^[\p{L}\p{N}_ -]+$/u.test(r.id))
      errors.push("ID : lettres, chiffres, espace, tiret ou _ seulement");
    return errors;
  });
}
