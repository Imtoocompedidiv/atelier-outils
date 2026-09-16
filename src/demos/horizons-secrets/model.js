export const makeExample = () => ({
  preparation:
    "Prévoyez une petite valise et gardez votre première enveloppe à portée de main. Les indications ci-dessous sont fictives.",
  cards: [
    {
      id: "depart",
      number: 1,
      title: "Le départ",
      date: "2026-10-16",
      time: "18:00",
      instruction:
        "Demain, votre voyage commence. Retrouvez votre première escale dans cette enveloppe.",
    },
    {
      id: "eau",
      number: 2,
      title: "Au bord de l’eau",
      date: "2026-10-17",
      time: "10:00",
      instruction: "Votre prochaine escale vous attend au bord de l’eau.",
    },
    {
      id: "route",
      number: 3,
      title: "Sur la route",
      date: "2026-10-18",
      time: "09:00",
      instruction:
        "La route vous mène au jardin des Hautes Herbes. Ce lieu fictif sera votre pause du matin.",
    },
    {
      id: "arrivee",
      number: 4,
      title: "La dernière escale",
      date: "2026-10-19",
      time: "17:00",
      instruction:
        "Une table vous attend à la Villa des Aulnes. Dernière adresse imaginaire de ce carnet.",
    },
  ],
});
export function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function validateCards(cards) {
  const errors = [];
  const numbers = new Set();
  cards.forEach((card) => {
    if (!Number.isInteger(card.number) || card.number < 1)
      errors.push("Le numéro de chaque enveloppe doit être un entier positif.");
    if (numbers.has(card.number))
      errors.push("Le numéro " + card.number + " est utilisé plusieurs fois.");
    numbers.add(card.number);
    if (!isCalendarDate(card.date))
      errors.push(card.title + " : choisissez une date valide.");
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(card.time))
      errors.push(card.title + " : indiquez une heure valide.");
    if (!card.instruction.trim())
      errors.push(card.title + " : ajoutez une instruction.");
  });
  return [...new Set(errors)];
}
export function documentFor(state, selectedId) {
  if (selectedId === "preparation")
    return {
      document: "Carnet avant départ",
      preparation: state.preparation,
      ouvertureDesEnveloppes: state.cards.map(({ number, date, time }) => ({
        number,
        date,
        time,
      })),
    };
  const c = state.cards.find((card) => card.id === selectedId);
  if (!c) throw new Error("Carte inconnue");
  return {
    document: "Enveloppe " + c.number,
    date: c.date,
    time: c.time,
    instruction: c.instruction,
  };
}
export function readableDocument(document) {
  if (document.preparation !== undefined)
    return [
      document.document,
      "",
      document.preparation,
      "",
      ...document.ouvertureDesEnveloppes.map(
        (c) => "Enveloppe " + c.number + " : " + c.date + " à " + c.time,
      ),
    ].join("\n");
  return [
    document.document,
    "Ouvrir le " + document.date + " à " + document.time,
    "",
    document.instruction,
  ].join("\n");
}
