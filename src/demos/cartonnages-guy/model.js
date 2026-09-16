export const machines = [
  { name: "Bobst 106 Novacut", min: [32.5, 45], max: [74, 106] },
  { name: "Bobst 102 SP", min: [32.5, 45], max: [72, 102] },
];
export const initial = {
  width: "74",
  height: "106",
  gsm: "300",
  quantity: "2500",
  glue: true,
  shape: "Fournie",
  packing: "Paquets de 50 sous film",
  reference: "Étui série Épure",
};
export function inspect(spec) {
  const vals = ["width", "height", "gsm", "quantity"].map((k) =>
    Number(String(spec[k]).replace(",", ".")),
  );
  const [w, h, gsm, quantity] = vals;
  const errors = [];
  if (!vals.every(Number.isFinite) || vals.some((n) => n <= 0))
    errors.push(
      "Renseignez des dimensions, un grammage et une quantité strictement positifs.",
    );
  if (!Number.isInteger(quantity) || quantity > 1000000)
    errors.push("La quantité doit être un entier de 1 à 1 000 000.");
  if (w > 300 || h > 300 || gsm > 3000)
    errors.push("Vérifiez les unités : centimètres et g/m².");
  const valid = errors.length === 0;
  const results = machines.map((machine) => ({
    ...machine,
    fits:
      valid &&
      [
        [w, h],
        [h, w],
      ].some(
        ([a, b]) =>
          a >= machine.min[0] &&
          b >= machine.min[1] &&
          a <= machine.max[0] &&
          b <= machine.max[1],
      ),
  }));
  const warnings = [];
  if (valid && !results.some((m) => m.fits))
    warnings.push(
      "Aucun des deux formats machine publiés ne correspond à cette feuille.",
    );
  if (valid && gsm < 90)
    warnings.push(
      "Le grammage est inférieur au seuil papier de 90 g/m² publié.",
    );
  if (valid && spec.glue && gsm < 200)
    warnings.push("Le pliage-collage publié démarre à 200 g/m².");
  if (spec.shape !== "Fournie")
    warnings.push(
      "La disponibilité ou la création de la forme reste à confirmer.",
    );
  if (!spec.packing.trim())
    warnings.push("Le conditionnement reste à préciser.");
  return {
    errors,
    warnings,
    results,
    valid,
    width: w,
    height: h,
    gsm,
    quantity,
    area: valid ? (w * h) / 10000 : 0,
  };
}
export function worksheet(spec, result) {
  return `FICHE D’ÉTUDE • CARTONNAGES GUY\nPrototype indépendant, exemple fictif.\n\n${spec.reference}\nFeuille : ${spec.width} × ${spec.height} cm\nGrammage déclaré : ${spec.gsm} g/m²\nQuantité : ${spec.quantity}\nPliage-collage : ${spec.glue ? "Demandé" : "Non demandé"}\nForme : ${spec.shape}\nConditionnement : ${spec.packing || "À préciser"}\n\nCONTRÔLE DE FORMAT\n${result.results.map((m) => `${m.name} : ${m.fits ? "Dans les limites de feuille publiées" : "Hors limites de feuille publiées"}`).join("\n")}\n\nPOINTS À ÉTUDIER\n${[...result.errors, ...result.warnings, "Faisabilité à confirmer par l’atelier : support, sens fibre, prise de pince, forme et outillage."].join("\n")}\n\nSources consultées le 16 septembre 2026\nhttps://cartonnagesguy.fr/decoupe-et-rainage-carton-saint-ouen-laumone/\nhttps://cartonnagesguy.fr/pliage-et-collage-carton-saint-ouen-laumone/`;
}
