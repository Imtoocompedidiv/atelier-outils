export const seed = [
  {
    id: 1,
    client: "Bureaux Rive Gauche",
    area: "Lyon 7e",
    size: "200–250 cm",
    colors: "Vert et or",
    from: "08:30",
    to: "10:30",
    duration: 90,
    travel: 25,
  },
  {
    id: 2,
    client: "Maison des Lumières",
    area: "Lyon 3e",
    size: "140–175 cm",
    colors: "Rouge et or",
    from: "09:45",
    to: "11:15",
    duration: 90,
    travel: 20,
  },
  {
    id: 3,
    client: "Espace des Quais",
    area: "Lyon 2e",
    size: "300–400 cm",
    colors: "Blanc et argent",
    from: "13:30",
    to: "16:30",
    duration: 120,
    travel: 0,
  },
];
export const minutes = (t) => {
  if (!/^\d\d:\d\d$/.test(t)) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h < 24 && m < 60 ? h * 60 + m : NaN;
};
export const clock = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export function schedule(stops) {
  let cursor = 480;
  return stops.map((s) => {
    const from = minutes(s.from),
      to = minutes(s.to),
      valid =
        Number.isFinite(from) &&
        Number.isFinite(to) &&
        to > from &&
        Number.isInteger(s.duration) &&
        s.duration > 0 &&
        s.duration <= 480 &&
        Number.isInteger(s.travel) &&
        s.travel >= 0 &&
        s.travel <= 240;
    const start = valid ? Math.max(cursor, from) : cursor,
      end = start + (valid ? s.duration : 0),
      late = valid && end > to;
    cursor = end + (valid ? s.travel : 0);
    return { ...s, start, end, late, valid };
  });
}
