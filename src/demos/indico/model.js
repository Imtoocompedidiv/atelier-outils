export const initial = [
  {
    id: "01",
    name: "Blocs-portes bois",
    unit: "u",
    qty: 12,
    offers: [
      { price: "245", unit: "u" },
      { price: "239", unit: "u" },
      { price: "258", unit: "u" },
    ],
  },
  {
    id: "02",
    name: "Habillage des tableaux",
    unit: "m²",
    qty: 20,
    offers: [
      { price: "89", unit: "m²" },
      { price: "45", unit: "ml" },
      { price: "92", unit: "m²" },
    ],
  },
  {
    id: "03",
    name: "Banque d’accueil",
    unit: "ens",
    qty: 1,
    offers: [
      { price: "1250", unit: "ens" },
      { price: "", unit: "ens" },
      { price: "1380", unit: "ens" },
    ],
  },
  {
    id: "04",
    name: "Armoires avec portes",
    unit: "u",
    qty: 4,
    offers: [
      { price: "620", unit: "u" },
      { price: "605", unit: "u" },
      { price: "650", unit: "u" },
    ],
  },
  {
    id: "05",
    name: "Étagères complémentaires",
    unit: "ml",
    qty: 18,
    offers: [
      { price: "48", unit: "ml" },
      { price: "51", unit: "ml" },
      { price: "49", unit: "ml" },
    ],
  },
];
export function money(raw) {
  if (!/^\d+([.,]\d{1,2})?$/.test(raw)) return null;
  const [a, b = ""] = raw.replace(",", ".").split(".");
  const n = Number(a) * 100 + Number(b.padEnd(2, "0"));
  return Number.isSafeInteger(n) && n <= 100000000 ? n : null;
}
export function compare(rows) {
  const questions = [],
    totals = [0, 0, 0],
    missing = [0, 0, 0],
    commonTotals = [0, 0, 0],
    commonRows = [];
  rows.forEach((row) => {
    const prices = row.offers.map((offer) => money(offer.price));
    const sharedScope =
      row.offers.length === 3 &&
      row.offers.every(
        (offer, i) => prices[i] !== null && offer.unit === row.unit,
      );
    if (sharedScope) {
      commonRows.push(row.id);
      prices.forEach((price, i) => {
        commonTotals[i] += price * row.qty;
      });
    }
  });
  rows.forEach((row) =>
    row.offers.forEach((o, i) => {
      const p = money(o.price);
      if (p === null || o.unit !== row.unit) {
        missing[i]++;
        questions.push({
          id: `${row.id}-${i}`,
          row: row.id,
          company: `Entreprise ${"ABC"[i]}`,
          message:
            p === null
              ? `${row.name} : préciser le prix unitaire en ${row.unit}.`
              : `${row.name} : prix reçu en ${o.unit}, trame en ${row.unit}. Confirmer le périmètre et le prix dans l’unité attendue.`,
        });
      } else totals[i] += p * row.qty;
    }),
  );
  return { questions, totals, missing, commonTotals, commonRows };
}
