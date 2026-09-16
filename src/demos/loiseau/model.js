export const initial = {
  reference: "DEP-026",
  location: "Appartement témoin · Charenton",
  trade: "Plomberie",
  duration: "95",
  hourly: "80.00",
  travel: "55.00",
  supplies: "18.40",
  tax: "20",
  technician: "",
  note: "Recherche de fuite sur raccord accessible. Remplacement du joint et contrôle visuel après remise en eau.",
  clientSeen: false,
};
export function cents(value) {
  if (!/^\d{1,6}(?:[.,]\d{1,2})?$/.test(String(value))) return null;
  const [a, b = ""] = String(value).replace(",", ".").split(".");
  return Number(a) * 100 + Number(b.padEnd(2, "0"));
}
export function billableMinutes(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 1440
    ? 60 + Math.ceil(Math.max(0, n - 60) / 30) * 30
    : null;
}
export function calculate(s) {
  const minutes = billableMinutes(s.duration),
    hourly = cents(s.hourly),
    travel = cents(s.travel),
    supplies = cents(s.supplies);
  const tax = Number(s.tax);
  const valid =
    minutes !== null &&
    hourly !== null &&
    travel !== null &&
    supplies !== null &&
    [0, 5.5, 10, 20].includes(tax);
  if (!valid) return { valid: false };
  const labor = Math.round((hourly * minutes) / 60);
  const ht = labor + travel + supplies;
  const vat = Math.round((ht * tax) / 100);
  return {
    valid: true,
    minutes,
    labor,
    travel,
    supplies,
    ht,
    vat,
    total: ht + vat,
  };
}
