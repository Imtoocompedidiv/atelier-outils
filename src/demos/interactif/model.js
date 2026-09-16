export const requirements = [
  {
    key: "interview",
    label: "Entretien",
    request: "convenir ensemble du rendez-vous de positionnement",
  },
  {
    key: "agreement",
    label: "Convention",
    request: "nous retourner la convention signée",
  },
  {
    key: "expectations",
    label: "Attentes",
    request: "compléter le questionnaire de préparation",
  },
];
export const initialPeople = [
  {
    id: "A01",
    name: "Camille Morel",
    mode: "Présentiel",
    funding: "Entreprise",
    interview: true,
    agreement: true,
    expectations: false,
  },
  {
    id: "A02",
    name: "Alex Martin",
    mode: "Visio",
    funding: "Personnel",
    interview: true,
    agreement: true,
    expectations: true,
  },
  {
    id: "A03",
    name: "Lou Perrin",
    mode: "Présentiel",
    funding: "Entreprise",
    interview: true,
    agreement: false,
    expectations: false,
  },
  {
    id: "A04",
    name: "Sacha Roux",
    mode: "Visio",
    funding: "À préciser",
    interview: false,
    agreement: true,
    expectations: true,
  },
  {
    id: "A05",
    name: "Noa Laurent",
    mode: "Présentiel",
    funding: "Entreprise",
    interview: true,
    agreement: true,
    expectations: true,
  },
  {
    id: "A06",
    name: "Charlie Blanc",
    mode: "Présentiel",
    funding: "Personnel",
    interview: true,
    agreement: true,
    expectations: true,
  },
];
export const missingRequirements = (person) =>
  requirements.filter((item) => !person[item.key]);
export const isReady = (person) =>
  missingRequirements(person).length === 0 && person.funding !== "À préciser";
export function reminder(person, date) {
  const tasks = missingRequirements(person).map((item) => item.request);
  if (person.funding === "À préciser")
    tasks.push("nous préciser le mode de financement retenu");
  if (!tasks.length) return "";
  return `Bonjour ${person.name.split(" ")[0]},\n\nLa session « Manager une équipe » débute le ${date}. Pour préparer votre participation, pourriez-vous ${tasks.join(", puis ")} ?\n\nMerci et à bientôt,\nL’équipe Interactif`;
}
export function readiness(people) {
  return {
    ready: people.filter(isReady).length,
    total: people.length,
    onsite: people.filter((p) => p.mode === "Présentiel").length,
  };
}
