export const seed = [
  {
    id: "07.01",
    before: "Bloc-porte bois simple vantail",
    after: "Bloc-porte bois simple vantail",
    oldUnit: "u",
    unit: "u",
    qty: 12,
    price: 24500,
    approved: true,
    manual: "",
  },
  {
    id: "07.02",
    before: "Habillage bois des tableaux",
    after: "Habillage bois des tableaux",
    oldUnit: "m²",
    unit: "ml",
    qty: 8,
    price: 8900,
    approved: false,
    manual: "",
  },
  {
    id: "07.03",
    before: "Banque d’accueil sur mesure",
    after: "Banque d’accueil sur mesure",
    oldUnit: "u",
    unit: "u",
    qty: 1,
    price: 125000,
    approved: false,
    manual: "",
  },
  {
    id: "07.04",
    before: "Meuble de rangement avec portes",
    after: "Armoire de rangement avec portes",
    oldUnit: "u",
    unit: "u",
    qty: 4,
    price: 62000,
    approved: false,
    manual: "",
  },
  {
    id: "07.05",
    before: "",
    after: "Placard toute hauteur, étagères",
    oldUnit: "",
    unit: "u",
    qty: 2,
    price: null,
    approved: false,
    manual: "",
  },
];
export function cents(raw) {
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(String(raw))) return null;
  const [a, b = ""] = String(raw).replace(",", ".").split(".");
  const n = Number(a) * 100 + Number(b.padEnd(2, "0"));
  return Number.isSafeInteger(n) && n <= 100000000 ? n : null;
}
export function resolve(row) {
  const manual = cents(row.manual),
    requiresManual = !row.before || row.oldUnit !== row.unit;
  const price = row.manual !== "" ? manual : requiresManual ? null : row.price;
  const valid =
    price !== null &&
    Number.isInteger(row.qty) &&
    row.qty > 0 &&
    row.qty <= 10000;
  return {
    ...row,
    requiresManual,
    chosenPrice: price,
    valid,
    total: valid && row.approved ? price * row.qty : 0,
    ready: valid && row.approved,
  };
}
