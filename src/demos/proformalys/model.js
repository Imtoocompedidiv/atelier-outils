export const days = [
  "2026-10-05",
  "2026-10-06",
  "2026-10-07",
  "2026-10-08",
  "2026-10-12",
  "2026-10-13",
  "2026-10-14",
  "2026-10-15",
];
export const initialRoster = [
  {
    id: "p1",
    name: "Alice Bernard",
    kind: "participant",
    available: [true, true, true, false, true, true, false, true],
  },
  {
    id: "p2",
    name: "Benoît Martin",
    kind: "participant",
    available: [true, false, true, true, true, true, true, false],
  },
  {
    id: "p3",
    name: "Chloé Durand",
    kind: "participant",
    available: [true, true, true, false, true, false, true, true],
  },
  {
    id: "p4",
    name: "David Moreau",
    kind: "participant",
    available: [true, true, true, true, true, true, false, true],
  },
  {
    id: "f1",
    name: "Sophie Lambert",
    kind: "trainer",
    enabled: true,
    available: [true, false, true, true, false, true, false, true],
  },
  {
    id: "f2",
    name: "Thomas Girard",
    kind: "trainer",
    enabled: true,
    available: [true, true, false, true, true, true, true, false],
  },
  {
    id: "f3",
    name: "Élise Petit",
    kind: "trainer",
    enabled: true,
    available: [false, true, true, true, true, false, true, true],
  },
];
export function compatiblePairs(roster, consecutive = false) {
  const participants = roster.filter((p) => p.kind === "participant");
  if (!participants.length) return [];
  const options = [];
  for (const trainer of roster.filter(
    (p) => p.kind === "trainer" && p.enabled,
  )) {
    const common = days
      .map((date, index) => ({ date, index }))
      .filter(
        (day) =>
          trainer.available[day.index] &&
          participants.every((p) => p.available[day.index]),
      );
    for (let a = 0; a < common.length; a++)
      for (let b = a + 1; b < common.length; b++) {
        if (
          consecutive &&
          new Date(common[b].date + "T00:00Z") -
            new Date(common[a].date + "T00:00Z") !==
            86400000
        )
          continue;
        options.push({
          id: `${trainer.id}-${common[a].index}-${common[b].index}`,
          trainer: trainer.name,
          dates: [common[a].date, common[b].date],
        });
      }
  }
  return options.sort(
    (a, b) =>
      a.dates[0].localeCompare(b.dates[0]) ||
      a.dates[1].localeCompare(b.dates[1]) ||
      a.trainer.localeCompare(b.trainer),
  );
}
