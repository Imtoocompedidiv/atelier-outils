export const workshops = [
  "Photogravure",
  "Offset",
  "Dorure",
  "Gaufrage",
  "Sérigraphie",
  "Prototypage",
  "Façonnage",
];
export const colors = [
  "#f056ab",
  "#22b6ea",
  "#ff7f00",
  "#43bf26",
  "#e3aff6",
  "#f8d54b",
  "#b8cdf3",
];
export const initial = [
  {
    id: "P1",
    workshop: "Photogravure",
    label: "Préparer les séparations",
    hours: "2",
    deps: [],
  },
  {
    id: "P2",
    workshop: "Offset",
    label: "Imprimer les feuilles",
    hours: "4",
    deps: ["P1"],
  },
  {
    id: "P3",
    workshop: "Dorure",
    label: "Passage de la couverture",
    hours: "2",
    deps: ["P2"],
  },
  {
    id: "P4",
    workshop: "Façonnage",
    label: "Assembler le coffret",
    hours: "3",
    deps: ["P3"],
  },
];
export function schedule(nodes) {
  const errors = [];
  const ids = new Set(nodes.map((n) => n.id));
  if (!nodes.length || ids.size !== nodes.length)
    errors.push("La gamme doit contenir des repères uniques.");
  for (const n of nodes) {
    if (!n.label.trim() || !workshops.includes(n.workshop))
      errors.push(`${n.id} : nom ou atelier manquant.`);
    if (
      !/^\d{1,3}(?:[.,]\d{1,2})?$/.test(String(n.hours)) ||
      Number(String(n.hours).replace(",", ".")) <= 0 ||
      Number(String(n.hours).replace(",", ".")) > 240
    )
      errors.push(`${n.id} : durée attendue entre 0,01 et 240 h.`);
    if (n.deps.some((d) => !ids.has(d)))
      errors.push(`${n.id} : dépendance absente.`);
  }
  if (errors.length) return { valid: false, errors };
  const order = [];
  const pending = new Set(ids);
  while (pending.size) {
    const ready = nodes.filter(
      (n) => pending.has(n.id) && n.deps.every((d) => order.includes(d)),
    );
    if (!ready.length)
      return {
        valid: false,
        errors: [
          `Boucle de dépendances : ${[...pending].join(", ")} ne peuvent pas démarrer.`,
        ],
        blocked: [...pending],
      };
    for (const n of ready) {
      order.push(n.id);
      pending.delete(n.id);
    }
  }
  const times = {};
  for (const id of order) {
    const n = nodes.find((n) => n.id === id);
    const start = Math.max(0, ...n.deps.map((d) => times[d].finish));
    const duration = Math.round(
      Number(String(n.hours).replace(",", ".")) * 100,
    );
    times[id] = { start, finish: start + duration, duration };
  }
  const total = Math.max(...Object.values(times).map((t) => t.finish));
  for (const id of [...order].reverse()) {
    const successors = nodes.filter((n) => n.deps.includes(id));
    const latestFinish = successors.length
      ? Math.min(...successors.map((n) => times[n.id].latestStart))
      : total;
    times[id].latestStart = latestFinish - times[id].duration;
    times[id].critical = times[id].latestStart === times[id].start;
  }
  return {
    valid: true,
    order,
    times,
    total,
    errors: [],
    isolated: nodes
      .filter(
        (n) => !n.deps.length && !nodes.some((x) => x.deps.includes(n.id)),
      )
      .map((n) => n.id),
  };
}
export function removeNode(nodes, id) {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, deps: n.deps.filter((d) => d !== id) }));
}
