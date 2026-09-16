export const components = [
  {
    id: "SG-01",
    name: "Socle galerie",
    kind: "socle",
    width: 1200,
    height: 600,
    finish: "Noir mat",
    quantity: 4,
  },
  {
    id: "AR-02",
    name: "Arche d’accueil",
    kind: "arche",
    width: 2400,
    height: 3000,
    finish: "Ivoire satiné",
    quantity: 1,
  },
  {
    id: "LT-03",
    name: "Lettrage mural",
    kind: "lettre",
    width: 800,
    height: 900,
    finish: "Noir mat",
    quantity: 8,
  },
];
export function differences(before, after) {
  const labels = {
    width: "Largeur (mm)",
    height: "Hauteur (mm)",
    finish: "Finition",
    quantity: "Quantité",
  };
  const changes = Object.keys(labels)
    .filter((k) => String(before[k]) !== String(after[k]))
    .map((key) => ({
      key,
      label: labels[key],
      before: before[key],
      after: after[key],
    }));
  const dimensions = changes.some((c) => ["width", "height"].includes(c.key));
  const impacts = [];
  if (dimensions)
    impacts.push({
      name: before.kind === "arche" ? "Structure / menuiserie" : "Menuiserie",
      reason: "Les cotes de fabrication changent.",
    });
  if (changes.some((c) => c.key === "finish"))
    impacts.push({
      name: "Peinture",
      reason: "La référence de finition change.",
    });
  if (dimensions || changes.some((c) => c.key === "quantity"))
    impacts.push({
      name: "Logistique",
      reason: dimensions
        ? "Vérifier gabarit, protection et conditionnement."
        : "Le nombre de pièces à préparer change.",
    });
  if (changes.some((c) => c.key === "quantity"))
    impacts.push({
      name: "Chef de projet",
      reason: "Revoir le nombre de pièces et le lancement.",
    });
  return { changes, impacts };
}
export function validComponent(item) {
  return (
    ["width", "height", "quantity"].every(
      (k) => Number.isFinite(Number(item[k])) && Number(item[k]) > 0,
    ) &&
    Number(item.width) <= 10000 &&
    Number(item.height) <= 10000 &&
    Number.isInteger(Number(item.quantity)) &&
    Number(item.quantity) <= 1000
  );
}
