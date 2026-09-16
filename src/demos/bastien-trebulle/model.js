export const initial = {
  project: "Infiltration · cage d’escalier témoin",
  variant: "A",
  tax: "20",
  option: false,
  checked: { photos: false, measure: false, scope: false },
  note: "Deux périmètres de travaux à discuter après visite. Les quantités et prix ci-dessous sont fictifs.",
  common: [
    {
      id: "C1",
      label: "Installation et protections",
      quantity: "1",
      unit: "forfait",
      price: "280.00",
    },
    {
      id: "C2",
      label: "Dépose et évacuation",
      quantity: "1",
      unit: "forfait",
      price: "190.00",
    },
  ],
  variants: {
    A: [
      {
        id: "A1",
        label: "Reprises ponctuelles de couverture",
        quantity: "4",
        unit: "m²",
        price: "145.00",
      },
      {
        id: "A2",
        label: "Reprise locale des raccords",
        quantity: "3",
        unit: "ml",
        price: "85.00",
      },
    ],
    B: [
      {
        id: "B1",
        label: "Réfection du pan témoin",
        quantity: "12",
        unit: "m²",
        price: "165.00",
      },
      {
        id: "B2",
        label: "Traitement des raccords périphériques",
        quantity: "7",
        unit: "ml",
        price: "85.00",
      },
    ],
  },
  extra: {
    id: "O1",
    label: "Reprise des finitions intérieures",
    quantity: "8",
    unit: "m²",
    price: "42.00",
  },
};
export const titles = { A: "Reprise ponctuelle", B: "Réfection de la zone" };
export function amount(line) {
  const q = String(line.quantity).replace(",", ".");
  const p = String(line.price).replace(",", ".");
  if (
    !/^\d{1,4}(?:\.\d{1,2})?$/.test(q) ||
    !/^\d{1,6}(?:\.\d{1,2})?$/.test(p) ||
    Number(q) <= 0
  )
    return null;
  const [whole, fraction = ""] = p.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Math.round(Number(q) * cents);
}
export function estimate(s, variant = s.variant) {
  const lines = [
    ...s.common,
    ...(s.variants[variant] || []),
    ...(s.option ? [s.extra] : []),
  ];
  if (
    !titles[variant] ||
    ![0, 5.5, 10, 20].includes(Number(s.tax)) ||
    lines.some((l) => amount(l) === null || !l.label.trim())
  )
    return { valid: false };
  const ht = lines.reduce((sum, l) => sum + amount(l), 0);
  const vat = Math.round((ht * Number(s.tax)) / 100);
  return { valid: true, lines, ht, vat, total: ht + vat };
}
export function editLine(s, section, id, key, value) {
  const next = { ...s, checked: { ...s.checked, scope: false } };
  if (section === "extra") next.extra = { ...s.extra, [key]: value };
  else if (section === "common")
    next.common = s.common.map((l) =>
      l.id === id ? { ...l, [key]: value } : l,
    );
  else
    next.variants = {
      ...s.variants,
      [section]: s.variants[section].map((l) =>
        l.id === id ? { ...l, [key]: value } : l,
      ),
    };
  return next;
}
