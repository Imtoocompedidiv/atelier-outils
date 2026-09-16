export const initial = {
  bottom: "1120",
  middle: "1110",
  top: "1102",
  left: "2400",
  right: "2388",
  depth: "360",
  plinth: true,
  socket: false,
  uneven: true,
  note: "Alcôve fictive, entre une cloison et un conduit existant.",
};
export const fields = [
  ["bottom", "Largeur en bas"],
  ["middle", "Largeur au milieu"],
  ["top", "Largeur en haut"],
  ["left", "Hauteur à gauche"],
  ["right", "Hauteur à droite"],
  ["depth", "Profondeur disponible"],
];
export function assess(form) {
  const errors = [];
  const values = {};
  for (const [key, label] of fields) {
    const raw = String(form[key]);
    if (!/^\d+$/.test(raw) || Number(raw) < 100 || Number(raw) > 10000)
      errors.push(label + " : saisissez un entier de 100 à 10 000 mm.");
    else values[key] = Number(raw);
  }
  if (errors.length) return { valid: false, errors, questions: [] };
  const widths = [values.bottom, values.middle, values.top],
    heights = [values.left, values.right];
  const widthGap = Math.max(...widths) - Math.min(...widths),
    heightGap = Math.abs(values.left - values.right);
  const questions = [];
  if (widthGap)
    questions.push(
      "Comparer les trois largeurs au relevé sur place avant de choisir une cote de travail.",
    );
  if (heightGap)
    questions.push("Vérifier les niveaux du sol et du plafond sur place.");
  if (form.plinth)
    questions.push("Relever la saillie et la hauteur de la plinthe.");
  if (form.socket)
    questions.push("Positionner la prise et prévoir son accès avec l’équipe.");
  if (form.uneven)
    questions.push("Repérer les irrégularités entre les points mesurés.");
  return {
    valid: true,
    errors,
    values,
    minWidth: Math.min(...widths),
    minHeight: Math.min(...heights),
    widthGap,
    heightGap,
    questions,
  };
}
export function worksheet(form, result = assess(form)) {
  if (!result.valid) throw new Error("Mesures invalides");
  return [
    "FICHE DE RELEVÉ D’ALCÔVE",
    "Prototype indépendant pour L’atelier du Renard. Données fictives.",
    "",
    ...fields.map(([key, label]) => label + " : " + result.values[key] + " mm"),
    "",
    "Écart entre largeurs : " + result.widthGap + " mm",
    "Écart entre hauteurs : " + result.heightGap + " mm",
    "Plus petite largeur relevée : " + result.minWidth + " mm",
    "Plus petite hauteur relevée : " + result.minHeight + " mm",
    "",
    "POINTS POUR LA VISITE",
    ...result.questions.map((q) => "• " + q),
    form.note ? "Note : " + form.note : "",
    "",
    "Les valeurs minimales sont des relevés, pas des dimensions de fabrication. Aucun jeu, faux aplomb, passage, structure ou pose n’est validé par cet exemple.",
  ].join("\n");
}
