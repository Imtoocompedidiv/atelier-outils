export const documents = [
  {
    id: "cv",
    title: "CV de démonstration",
    type: "Document",
    filename: "parcours-cp.txt",
    content:
      "EXEMPLE FICTIF\nC. P. · Ingénierie commerciale\nParcours illustratif dans la vente de solutions techniques. Ce texte sert exclusivement à tester la composition du dossier.",
  },
  {
    id: "parcours",
    title: "Synthèse du parcours",
    type: "Document",
    filename: "synthese-cp.txt",
    content:
      "EXEMPLE FICTIF\nMission étudiée : ingénierie commerciale.\nPérimètre à discuter : zone de déplacement et calendrier de prise de poste.\nCe document ne contient aucune évaluation réelle.",
  },
  {
    id: "references",
    title: "Références",
    type: "Document",
    filename: "references-cp.txt",
    content:
      "EXEMPLE FICTIF\nLes références seront ajoutées après les vérifications et autorisations nécessaires. Aucun nom ni numéro réel ne figure dans cet exemple.",
  },
  {
    id: "pitch",
    title: "Pitch vidéo fictif",
    type: "Vidéo",
    restricted: true,
    filename: "pitch-exemple.txt",
    content:
      "EXEMPLE FICTIF\nCette pièce représente un pitch vidéo. Aucune vidéo réelle n’est hébergée. La démonstration vérifie uniquement l’accord de partage pour le destinataire choisi.",
  },
  {
    id: "internal",
    title: "Notes internes",
    type: "Interne",
    internal: true,
    filename: "notes-internes.txt",
    content:
      "EXEMPLE FICTIF · INTERNE\nPrévoir une relecture du dossier avec un autre consultant. Cette note doit rester hors de tout export client.",
  },
];
export function allowedDocuments(selectedIds, recipient, approval) {
  return documents.filter(
    (doc) =>
      selectedIds.includes(doc.id) &&
      !doc.internal &&
      (!doc.restricted ||
        (approval?.recipient === recipient && approval.confirmed)),
  );
}
export async function buildManifest(selectedIds, recipient, approval) {
  const selected = allowedDocuments(selectedIds, recipient, approval);
  const files = await Promise.all(
    selected.map(async (doc) => {
      const bytes = new TextEncoder().encode(doc.content);
      const hash = await crypto.subtle.digest("SHA-256", bytes);
      return {
        filename: doc.filename,
        title: doc.title,
        bytes: bytes.length,
        sha256: Array.from(new Uint8Array(hash), (byte) =>
          byte.toString(16).padStart(2, "0"),
        ).join(""),
        content: doc.content,
      };
    }),
  );
  return {
    prototype: true,
    data: "fictitious",
    recipient,
    candidate: "C. P. · Exemple",
    pitchApproval:
      approval?.recipient === recipient && approval.confirmed
        ? "confirmed-for-example"
        : "not-confirmed",
    files,
  };
}
