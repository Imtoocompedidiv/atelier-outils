export const formats = {
  A5: [148, 210],
  A4: [210, 297],
  "Carré 210": [210, 210],
};
export const initial = {
  format: "A5",
  quantity: 500,
  pages: 26,
  paper: 135,
  binding: "Piqûre à cheval",
  finish: "Sans pelliculage",
  artwork: "2026-09-23",
  delivery: "2026-10-02",
  note: "Brochure de présentation. Couverture comprise dans le nombre de pages.",
};
export function assess(f) {
  const errors = [];
  if (!formats[f.format]) errors.push("Choisissez un format proposé.");
  if (!Number.isInteger(f.quantity) || f.quantity < 1 || f.quantity > 1000000)
    errors.push("Quantité attendue entre 1 et 1 000 000 exemplaires.");
  if (!Number.isInteger(f.pages) || f.pages < 4 || f.pages > 1000)
    errors.push("Nombre de pages attendu entre 4 et 1 000.");
  else if (f.binding === "Piqûre à cheval" && f.pages % 4 !== 0)
    errors.push(
      "La piqûre nécessite un nombre de pages multiple de 4, couverture comprise.",
    );
  else if (f.pages % 2 !== 0)
    errors.push(
      "Indiquez un nombre pair de pages pour cet imprimé recto verso.",
    );
  const dates = [f.artwork, f.delivery].every(
    (d) =>
      /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      Number.isFinite(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d,
  );
  if (!dates) errors.push("Renseignez les deux dates.");
  else if (f.delivery <= f.artwork)
    errors.push(
      "La livraison souhaitée doit être postérieure à la remise des fichiers.",
    );
  if (![135, 170, 250].includes(f.paper))
    errors.push("Choisissez un papier proposé.");
  const dim = formats[f.format] || [0, 0],
    mass = errors.length
      ? null
      : (((((dim[0] * dim[1]) / 1e6) * f.pages) / 2) * f.paper * f.quantity) /
        1000;
  return { errors, valid: !errors.length, dim, mass };
}
