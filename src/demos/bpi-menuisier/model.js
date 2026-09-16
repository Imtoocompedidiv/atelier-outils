export const days = [
  "2026-09-21",
  "2026-09-22",
  "2026-09-23",
  "2026-09-24",
  "2026-09-25",
];
export const initialJobs = [
  {
    id: "B-041",
    name: "Maison à Beynost",
    description: "4 fenêtres · rénovation",
    delivery: "2026-09-23",
    confirmed: true,
    measured: true,
    access: false,
    duration: 1,
    note: "Accès côté jardin à confirmer.",
  },
  {
    id: "B-042",
    name: "Appartement à Miribel",
    description: "2 fenêtres · remplacement",
    delivery: "2026-09-18",
    confirmed: true,
    measured: true,
    access: true,
    duration: 1,
    note: "Exemple de chantier déjà positionné.",
  },
  {
    id: "B-043",
    name: "Maison à Montluel",
    description: "6 menuiseries · rénovation",
    delivery: "2026-09-23",
    confirmed: true,
    measured: true,
    access: true,
    duration: 2,
    note: "Deux jours de pose dans cet exemple.",
  },
];
export const initialPlan = [
  { jobId: "B-042", day: 0, crew: 1 },
  { jobId: "B-043", day: 3, crew: 2 },
];
export function checkPlacement(job, day, crew, plan, jobs) {
  if (!job.confirmed) return "Attendez la confirmation de la date fournisseur.";
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(job.delivery) ||
    !Number.isFinite(Date.parse(job.delivery))
  )
    return "Renseignez une date de livraison valide.";
  if (!job.measured) return "Confirmez le métré avant de positionner la pose.";
  if (!job.access) return "Confirmez les conditions d’accès au chantier.";
  if (![1, 2].includes(job.duration))
    return "La durée doit être de 1 ou 2 jours dans cet exemple.";
  if (!Number.isInteger(day) || day < 0 || day + job.duration > days.length)
    return "La durée dépasse cette semaine. Choisissez un autre début.";
  if (![1, 2].includes(crew)) return "Équipe inconnue.";
  if (days[day] <= job.delivery)
    return "Gardez au moins une date après la livraison confirmée dans ce planning exemple.";
  for (const slot of plan.filter(
    (s) => s.jobId !== job.id && s.crew === crew,
  )) {
    const other = jobs.find((j) => j.id === slot.jobId);
    if (
      other &&
      day < slot.day + other.duration &&
      slot.day < day + job.duration
    )
      return "Cette équipe a déjà une pose sur au moins une de ces journées.";
  }
  return null;
}
