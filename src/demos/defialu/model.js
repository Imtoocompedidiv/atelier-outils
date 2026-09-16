export const initial = {
  width: 1400,
  height: 1250,
  opening: "Deux vantaux",
  material: "Aluminium",
  ral: "7016",
  pose: "Rénovation",
  route: "Atelier",
  supplier: "",
  glass: "À déterminer après étude",
  access: "Rez-de-chaussée, accès côté cour.",
  notes: "Relever l’état du dormant existant avant décision de pose.",
  measured: false,
  support: true,
  accessChecked: true,
};
export function validate(f) {
  const errors = [];
  if (!Number.isInteger(f.width) || f.width < 300 || f.width > 5000)
    errors.push("La largeur relevée doit être comprise entre 300 et 5 000 mm.");
  if (!Number.isInteger(f.height) || f.height < 300 || f.height > 3500)
    errors.push("La hauteur relevée doit être comprise entre 300 et 3 500 mm.");
  if (!/^\d{4}$/.test(f.ral))
    errors.push(
      "Le repère couleur doit comporter quatre chiffres. Son existence sera vérifiée au nuancier.",
    );
  if (f.route === "Fournisseur" && !f.supplier.trim())
    errors.push("Précisez le fournisseur pressenti pour ce routage.");
  return {
    errors,
    valid: !errors.length,
    missing: [
      ["measured", "Cotes relevées à revoir"],
      ["support", "Support à examiner"],
      ["accessChecked", "Accès à confirmer"],
    ]
      .filter(([k]) => !f[k])
      .map(([, l]) => l),
  };
}
