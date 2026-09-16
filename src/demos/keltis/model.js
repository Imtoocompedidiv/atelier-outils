export const seed = {
  title: "Ingénieur Cloud",
  location: "",
  contract: "CDI",
  body: "Notre client recherche un [intitulé du poste] pour accompagner ses équipes techniques.\n\nLe poste est basé à [localisation du poste], dans le cadre d’un [type de contrat].\n\nVous préparez les déploiements, documentez les changements et échangez avec les équipes produit.\n\nVous préparez les déploiements, documentez les changements et échangez avec les équipes produit.\n\nLe déroulement des échanges sera précisé lors du premier contact.",
};
export function auditAnnouncement(value) {
  const issues = [];
  for (const [key, label] of [
    ["title", "Intitulé"],
    ["location", "Localisation"],
    ["contract", "Type de contrat"],
  ])
    if (!value[key]?.trim())
      issues.push({
        id: key,
        field: key,
        label: `${label} à renseigner`,
        detail: "Information attendue pour cet exemple éditorial.",
      });
  for (const match of value.body.matchAll(
    /\[[^\]\n]{2,80}\]|\{\{[^}\n]{2,80}\}\}/g,
  ))
    issues.push({
      id: `marker-${match.index}`,
      field: "body",
      label: "Champ de modèle encore présent",
      detail: match[0],
      start: match.index,
      end: match.index + match[0].length,
      line: value.body.slice(0, match.index).split("\n").length,
    });
  const seen = new Map();
  for (const match of value.body.matchAll(/[^\n]+(?:\n(?!\n)[^\n]+)*/g)) {
    const normalized = match[0]
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("fr");
    if (normalized.length < 35) continue;
    if (seen.has(normalized))
      issues.push({
        id: `duplicate-${match.index}`,
        field: "body",
        label: "Paragraphe répété",
        detail: match[0],
        start: match.index,
        end: match.index + match[0].length,
        line: value.body.slice(0, match.index).split("\n").length,
      });
    else seen.set(normalized, match.index);
  }
  if (!value.body.trim())
    issues.push({
      id: "empty-body",
      field: "body",
      label: "Texte de l’annonce vide",
      detail: "Ajoutez le contenu avant export.",
    });
  return issues;
}
export function applyFields(value) {
  let body = value.body;
  for (const [marker, key] of [
    ["[intitulé du poste]", "title"],
    ["[localisation du poste]", "location"],
    ["[type de contrat]", "contract"],
  ])
    if (value[key].trim()) body = body.replaceAll(marker, value[key].trim());
  return { ...value, body };
}
