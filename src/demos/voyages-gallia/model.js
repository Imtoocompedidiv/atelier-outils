export const travellers = [
  "Claire",
  "Antoine",
  "Sophie",
  "Nicolas",
  "Hugo",
  "Pauline",
  "Thomas",
  "Manon",
  "Julien",
  "Élise",
  "Emma",
  "Lucas",
].map((name, i) => ({ id: "p" + i, name, nights: 3 }));
export const makeRooms = () => [
  {
    id: "201",
    type: "Double",
    capacity: 2,
    hotel: "Hôtel de la Ria",
    guests: ["p0", "p1"],
  },
  {
    id: "202",
    type: "Twin",
    capacity: 2,
    hotel: "Hôtel de la Ria",
    guests: ["p2", "p3"],
  },
  {
    id: "203",
    type: "Double",
    capacity: 2,
    hotel: "Hôtel de la Ria",
    guests: ["p4", "p5", "p6"],
  },
  {
    id: "204",
    type: "Twin",
    capacity: 2,
    hotel: "Hôtel de la Ria",
    guests: ["p7", "p8"],
  },
  {
    id: "205",
    type: "Individuelle",
    capacity: 1,
    hotel: "Hôtel de la Ria",
    guests: ["p9"],
  },
  {
    id: "206",
    type: "Triple",
    capacity: 3,
    hotel: "Hôtel de la Ria",
    guests: [],
  },
];
export function analyse(rooms, people) {
  const count = new Map(),
    errors = [],
    overflow = [];
  rooms.forEach((r) => {
    r.guests.forEach((id) => {
      count.set(id, (count.get(id) || 0) + 1);
      if (!people.some((p) => p.id === id))
        errors.push("Voyageur inconnu dans la chambre " + r.id);
    });
    if (r.guests.length > r.capacity) overflow.push(r.id);
  });
  const unassigned = people.filter((p) => !count.has(p.id));
  for (const p of people) {
    if (count.get(p.id) > 1)
      errors.push(p.name + " est affecté plusieurs fois.");
    if (!Number.isInteger(p.nights) || p.nights < 1 || p.nights > 3)
      errors.push(p.name + " : durée de 1 à 3 nuits requise.");
  }
  return {
    unassigned,
    overflow,
    errors,
    ready:
      unassigned.length === 0 && overflow.length === 0 && errors.length === 0,
    bedNights: people.reduce((s, p) => s + p.nights, 0),
  };
}
export function move(rooms, personId, target) {
  if (target && !rooms.some((r) => r.id === target))
    throw new Error("Chambre inconnue");
  return rooms.map((r) => ({
    ...r,
    guests: [
      ...r.guests.filter((id) => id !== personId),
      ...(r.id === target ? [personId] : []),
    ],
  }));
}
export function exportRows(rooms, people, hotel) {
  const state = analyse(rooms, people);
  if (!state.ready)
    throw new Error("La répartition doit être corrigée avant export.");
  return rooms
    .filter((r) => r.hotel === hotel)
    .flatMap((r) =>
      r.guests.map((id) => {
        const p = people.find((x) => x.id === id);
        return [
          hotel,
          r.id,
          r.type,
          p.id,
          p.name,
          "2026-10-18",
          new Date(Date.UTC(2026, 9, 18 + p.nights)).toISOString().slice(0, 10),
          p.nights,
        ];
      }),
    );
}
