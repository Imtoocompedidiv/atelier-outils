export const initialItems = [
  {
    id: "barnum",
    name: "Barnum sable 3 × 3 m",
    detail: "Structure de réception",
    quantity: 2,
    price: 16000,
  },
  {
    id: "lest",
    name: "Lests",
    detail: "Accessoires associés au barnum",
    quantity: 6,
    price: 800,
  },
  {
    id: "chaise",
    name: "Chaises bistrot",
    detail: "Pour le dîner",
    quantity: 60,
    price: 750,
  },
  {
    id: "table",
    name: "Tables banquet",
    detail: "Pour les grandes tablées",
    quantity: 8,
    price: 1200,
  },
];
export function assess(items, ratio = 4) {
  const invalid = items.some(
    (x) =>
      !Number.isInteger(x.quantity) || x.quantity < 0 || x.quantity > 10000,
  );
  const tents = items.find((x) => x.id === "barnum")?.quantity || 0;
  const ballast = items.find((x) => x.id === "lest")?.quantity || 0;
  const missing = Math.max(0, tents * ratio - ballast);
  return {
    invalid,
    missing,
    pieces: items.reduce((a, x) => a + x.quantity, 0),
    subtotal: items.reduce((a, x) => a + x.price * x.quantity, 0),
  };
}
