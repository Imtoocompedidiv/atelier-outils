export const original = [
  {
    id: "sf",
    destination: "San Francisco",
    hotel: "Maison Pacific",
    nights: "3",
    budget: "900.00",
    activity: "Promenade libre",
  },
  {
    id: "yo",
    destination: "Yosemite",
    hotel: "Lodge des Cèdres",
    nights: "3",
    budget: "750.00",
    activity: "Journée dans le parc",
  },
  {
    id: "mo",
    destination: "Monterey",
    hotel: "Maison du Phare",
    nights: "3",
    budget: "600.00",
    activity: "Baie de Monterey",
  },
];
export const makeRevision = () =>
  original.map((s) =>
    s.id === "sf"
      ? { ...s, hotel: "Maison des Quais", budget: "1020.00" }
      : s.id === "yo"
        ? { ...s, nights: "4", budget: "880.00" }
        : {
            ...s,
            nights: "2",
            budget: "530.00",
            activity: "Visite de l’aquarium",
          },
  );
export function cents(raw) {
  const text = String(raw).trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) return null;
  const [whole, decimal = ""] = text.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}
export function checkSteps(rows) {
  const errors = [];
  const ids = new Set();
  for (const r of rows) {
    if (ids.has(r.id)) errors.push("Identifiant répété.");
    ids.add(r.id);
    if (!r.destination.trim() || !r.hotel.trim())
      errors.push(
        "Renseignez la destination et l’hébergement de chaque étape.",
      );
    if (!/^\d+$/.test(String(r.nights)) || Number(r.nights) > 30)
      errors.push("Les nuits doivent être un entier de 0 à 30.");
    if (cents(r.budget) === null)
      errors.push(
        "Le budget doit être un montant positif avec deux décimales au maximum.",
      );
  }
  return [...new Set(errors)];
}
export function compare(before, after) {
  const errors = checkSteps(after);
  const fields = ["destination", "hotel", "nights", "budget", "activity"];
  const ids = [
    ...new Set([...before.map((r) => r.id), ...after.map((r) => r.id)]),
  ];
  const changes = ids
    .map((id) => {
      const a = before.find((r) => r.id === id),
        b = after.find((r) => r.id === id);
      return {
        id,
        before: a,
        after: b,
        type: !a ? "ajoutée" : !b ? "retirée" : "modifiée",
        fields:
          !a || !b
            ? fields
            : fields.filter((k) =>
                k === "budget"
                  ? cents(a[k]) !== cents(b[k])
                  : String(a[k]) !== String(b[k]),
              ),
      };
    })
    .filter((x) => x.fields.length);
  const total = (rows) => rows.reduce((n, r) => n + (cents(r.budget) || 0), 0);
  return {
    errors,
    changes,
    beforeTotal: total(before),
    afterTotal: total(after),
    delta: total(after) - total(before),
    beforeNights: before.reduce((n, r) => n + Number(r.nights), 0),
    afterNights: after.reduce((n, r) => n + Number(r.nights || 0), 0),
  };
}
export function changeRows(result) {
  return result.changes.flatMap((c) =>
    c.fields.map((f) => [
      c.after?.destination || c.before.destination,
      c.type,
      f,
      c.before?.[f] ?? "",
      c.after?.[f] ?? "",
    ]),
  );
}
