export function duration(start, end) {
  const minutes = (t) => {
    if (!/^\d{2}:\d{2}$/.test(t)) return NaN;
    const [h, m] = t.split(":").map(Number);
    return h < 24 && m < 60 ? h * 60 + m : NaN;
  };
  const d = minutes(end) - minutes(start);
  return Number.isFinite(d) && d > 0 ? d : null;
}
export function reportText(form, parts) {
  const d = duration(form.start, form.end);
  return `COMPTE RENDU D’INTERVENTION\nExemple indépendant préparé pour Qualitec\nDonnées fictives\n\nRéférence ${form.ref}\nDate ${form.date}\nLieu ${form.place}\nTechnicien ${form.tech}\nDurée ${d === null ? "À corriger" : `${Math.floor(d / 60)} h ${d % 60} min`}\n\nTRAVAUX RÉALISÉS\n${form.work}\n\nPIÈCES UTILISÉES\n${parts.map((p) => `${p.qty} × ${p.name}`).join("\n")}\n\nCONTRÔLES\nÉtanchéité vérifiée : ${form.checked ? "oui" : "à compléter"}\nRemise en service : ${form.service ? "oui" : "à compléter"}\n\nSUITE À PRÉVOIR\n${form.next || "Aucune suite renseignée."}\n\nDocument préparatoire, à relire et valider par le professionnel.`;
}
