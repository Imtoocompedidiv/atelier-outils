export const checks = [
  ["scale", "Échelle 1:1", "Le fichier est au format final déclaré."],
  [
    "type",
    "Textes vectorisés",
    "Les polices ne sont plus nécessaires à l’ouverture.",
  ],
  [
    "layers",
    "Couches en noir 100 %",
    "Un fichier séparé par couleur d’impression.",
  ],
  [
    "preview",
    "Aperçu couleur",
    "Une vue d’ensemble accompagne les séparations.",
  ],
  [
    "bleed",
    "Fond perdu à confirmer",
    "Coupe et débords ont été discutés avec l’atelier.",
  ],
  [
    "resolution",
    "300 dpi ou vectoriel",
    "La définition a été vérifiée au format final.",
  ],
];
export const initial = {
  title: "NOCTURNE 026",
  width: "30",
  height: "40",
  quantity: "150",
  paper: "Papier blanc naturel · 300 g",
  date: "2026-10-09",
  note: "Affiche fictive en deux passages. Teintes à confirmer sur échantillon.",
  colors: ["#f45e48", "#102f43"],
  refs: ["Corail · référence à confirmer", "Bleu nuit · référence à confirmer"],
  checked: {
    scale: true,
    type: true,
    layers: false,
    preview: true,
    bleed: false,
    resolution: true,
  },
};
export function valid(s) {
  return (
    [s.width, s.height].every(
      (v) =>
        /^\d{1,3}(?:[.,]\d{1,2})?$/.test(v) &&
        Number(v.replace(",", ".")) > 0 &&
        Number(v.replace(",", ".")) <= 200,
    ) &&
    /^\d{1,6}$/.test(s.quantity) &&
    Number(s.quantity) > 0 &&
    Number(s.quantity) <= 100000 &&
    s.title.trim() &&
    s.paper.trim() &&
    s.colors.every((c) => /^#[a-f\d]{6}$/i.test(c)) &&
    s.refs.every((r) => r.trim()) &&
    /^\d{4}-\d{2}-\d{2}$/.test(s.date) &&
    Number.isFinite(Date.parse(s.date)) &&
    new Date(s.date).toISOString().slice(0, 10) === s.date
  );
}
export function change(s, key, value) {
  const checked = { ...s.checked };
  if (["width", "height"].includes(key))
    for (const k of ["scale", "preview", "bleed", "resolution"])
      checked[k] = false;
  if (["title", "colors", "refs"].includes(key))
    for (const k of ["layers", "preview"]) checked[k] = false;
  return { ...s, [key]: value, checked };
}
export function ready(s) {
  return Boolean(valid(s)) && checks.every(([k]) => s.checked[k]);
}
