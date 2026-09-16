export const makeDocuments = () => [
  {
    id: "vols",
    name: "Plan de vols",
    description: "Références des trajets",
    version: 2,
    reviewedVersion: 2,
    dependencies: [],
    references: {},
    content: "Version fictive 2. Les références du trajet ont été modifiées.",
  },
  {
    id: "lettre",
    name: "Lettre d’arrivée",
    description: "Informations pour l’arrivée",
    version: 1,
    reviewedVersion: 1,
    dependencies: ["vols"],
    references: { vols: 1 },
    content:
      "À votre arrivée, retrouvez les indications d’accueil de votre dossier. Exemple de lettre à relire après un changement du plan de vols.",
  },
  {
    id: "logistique",
    name: "Fiche logistique",
    description: "Hébergements et contacts",
    version: 1,
    reviewedVersion: 1,
    dependencies: [],
    references: {},
    content:
      "Hébergements et interlocuteurs inventés pour cette démonstration.",
  },
];
export function documentStatus(doc, documents) {
  const outdated = doc.dependencies.filter((id) => {
    const ref = documents.find((x) => x.id === id);
    return (
      !ref ||
      doc.references[id] !== ref.version ||
      ref.reviewedVersion !== ref.version
    );
  });
  return {
    ready: doc.version === doc.reviewedVersion && outdated.length === 0,
    outdated,
    selfPending: doc.version !== doc.reviewedVersion,
  };
}
export function newVersion(documents, id, content) {
  if (!documents.some((x) => x.id === id)) throw new Error("Document inconnu");
  return documents.map((d) =>
    d.id !== id
      ? d
      : {
          ...d,
          version: d.version + 1,
          content,
          reviewedVersion: id === "vols" ? d.version + 1 : d.reviewedVersion,
        },
  );
}
export function review(documents, id) {
  const target = documents.find((x) => x.id === id);
  if (!target) throw new Error("Document inconnu");
  return documents.map((d) =>
    d.id !== id
      ? d
      : {
          ...d,
          reviewedVersion: d.version,
          references: Object.fromEntries(
            d.dependencies.map((ref) => [
              ref,
              documents.find((x) => x.id === ref)?.version,
            ]),
          ),
        },
  );
}
export function manifest(documents) {
  if (documents.some((d) => !documentStatus(d, documents).ready))
    throw new Error("Un document doit encore être revu.");
  return {
    departure: "2026-10-18",
    example: true,
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      version: d.version,
      validatedReferences: { ...d.references },
    })),
  };
}
