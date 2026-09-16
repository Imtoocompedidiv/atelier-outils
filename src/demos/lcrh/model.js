export const seedEvents = [
  {
    id: 1,
    date: "2026-09-14",
    stage: "Cadrage",
    note: "Périmètre de maintenance et horaires confirmés avec le client.",
    shared: true,
  },
  {
    id: 2,
    date: "2026-09-14",
    stage: "Organisation",
    note: "Réserver un créneau de relecture entre consultants.",
    shared: false,
    internal: true,
  },
  {
    id: 3,
    date: "2026-09-15",
    stage: "Recherche",
    note: "Recherche élargie aux environnements de production continue.",
    shared: true,
  },
  {
    id: 4,
    date: "2026-09-15",
    stage: "Échange",
    note: "Deux créneaux d’échange de découverte organisés.",
    shared: true,
  },
  {
    id: 5,
    date: "2026-09-16",
    stage: "Document",
    note: "Fiche de poste révisée reçue et classée dans la mission.",
    shared: true,
  },
  {
    id: 6,
    date: "2026-09-16",
    stage: "Organisation",
    note: "Préparer la passation du dossier pendant une absence.",
    shared: false,
    internal: true,
  },
  {
    id: 7,
    date: "2026-09-17",
    stage: "Décision attendue",
    note: "Confirmer les disponibilités du responsable de site pour la semaine prochaine.",
    shared: true,
  },
  {
    id: 8,
    date: "2026-09-17",
    stage: "Document",
    note: "Documents de présentation préparés pour relecture.",
    shared: true,
  },
  {
    id: 9,
    date: "2026-09-18",
    stage: "Prochain échange",
    note: "Point d’avancement proposé lundi à 11 h, sous réserve de confirmation.",
    shared: true,
  },
  {
    id: 10,
    date: "2026-09-18",
    stage: "Décision attendue",
    note: "Valider la version finale du descriptif des astreintes.",
    shared: true,
  },
];
export function sharedEvents(events, from, to) {
  if (!from || !to || from > to) return [];
  return events
    .filter((e) => !e.internal && e.shared && e.date >= from && e.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
}
export function buildReport(events, from, to) {
  const visible = sharedEvents(events, from, to);
  const group = (stage) =>
    visible
      .filter((e) =>
        stage === "summary"
          ? !["Décision attendue", "Prochain échange"].includes(e.stage)
          : e.stage === stage,
      )
      .map((e) => `• ${e.note}`)
      .join("\n");
  return {
    summary: group("summary"),
    decisions: group("Décision attendue"),
    next: group("Prochain échange"),
    count: visible.length,
  };
}
