export const COST = 363000;
export const CAPACITY = 10;
export const initialCompanies = [
  { id: "a", name: "Atelier Alba", requested: 3, confirmed: 2 },
  { id: "b", name: "Maison Brune", requested: 3, confirmed: 1 },
  { id: "c", name: "Studio Cime", requested: 4, confirmed: 0 },
];
export function allocateCents(total, weights) {
  if (
    !Number.isSafeInteger(total) ||
    total < 0 ||
    weights.some((w) => !Number.isSafeInteger(w) || w < 0)
  )
    throw new Error("Répartition non valide");
  const denominator = weights.reduce((a, b) => a + b, 0);
  if (!denominator) return weights.map(() => null);
  const parts = weights.map((weight, index) => ({
    index,
    value: Math.floor((total * weight) / denominator),
    remainder: (total * weight) % denominator,
  }));
  let remaining = total - parts.reduce((a, p) => a + p.value, 0);
  const order = [...parts].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  );
  for (let i = 0; remaining > 0; i++, remaining--)
    parts[order[i % order.length].index].value++;
  return parts.map((p) => p.value);
}
export function updateSeats(companies, id, key, raw) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0 || value > CAPACITY)
    return { error: "Choisissez un nombre entier entre 0 et 10." };
  const next = companies.map((c) => (c.id === id ? { ...c, [key]: value } : c));
  if (next.some((c) => c.confirmed > c.requested))
    return {
      error:
        "Une entreprise ne peut pas confirmer plus de places qu’elle n’en demande.",
    };
  if (next.reduce((a, c) => a + c.requested, 0) > CAPACITY)
    return {
      error:
        "Les dix places sont déjà réparties. Réduisez une autre demande avant d’ajouter une place.",
    };
  return { companies: next };
}
export function daysUntil(date, reference) {
  return Math.round(
    (new Date(date + "T00:00:00Z") - new Date(reference + "T00:00:00Z")) /
      86400000,
  );
}
