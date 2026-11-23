export const arrivals = [
  {
    id: "em",
    name: "Emma Laurent",
    role: "Contrôleuse de gestion",
    company: "Maison Azur",
    date: "2026-09-07",
  },
  {
    id: "lm",
    name: "Lucas Moreau",
    role: "Analyste financier",
    company: "Atelier Atlas",
    date: "2026-09-14",
  },
  {
    id: "sm",
    name: "Sophie Martin",
    role: "Comptable fournisseurs",
    company: "Maison Azur",
    date: "2026-09-21",
  },
  {
    id: "nb",
    name: "Nathan Bernard",
    role: "Trésorier junior",
    company: "Studio Sillage",
    date: "2026-09-28",
  },
];
export function addDays(isoDate, days) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(isoDate) ||
    !Number.isInteger(days) ||
    days < 0 ||
    days > 366
  )
    throw new Error("Date ou délai non valide");
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== isoDate
  )
    throw new Error("Date non valide");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function schedule(people, milestones, done = {}) {
  return people
    .flatMap((person) =>
      milestones.map((days, index) => ({
        id: `${person.id}-${index}`,
        person: person.name,
        role: person.role,
        company: person.company,
        date: addDays(person.date, days),
        days,
        label: ["Premier point", "Point d’étape", "Bilan de suivi"][index],
        done: !!done[`${person.id}-${index}`],
      })),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
function escapeIcs(text) {
  return String(text)
    .replaceAll("\\", "\\\\")
    .replaceAll("\r", "")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}
function foldLine(line) {
  const encoder = new TextEncoder();
  let result = "",
    count = 0;
  for (const char of line) {
    const length = encoder.encode(char).length;
    if (count + length > 75) {
      result += "\r\n ";
      count = 1;
    }
    result += char;
    count += length;
  }
  return result;
}
export function toIcs(events, stamp = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Imtoocompedidiv//Suivi integration//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const event of events.filter((e) => !e.done))
    lines.push(
      "BEGIN:VEVENT",
      `UID:voluntae-demo-${event.id}@atelier.example`,
      `DTSTAMP:${stamp.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${addDays(event.date, 1).replaceAll("-", "")}`,
      `SUMMARY:${escapeIcs(`${event.label} · ${event.person}`)}`,
      `DESCRIPTION:${escapeIcs(`Exemple fictif. ${event.role} chez ${event.company}. Jalon à J+${event.days}. Date de suivi à confirmer, sans calcul juridique.`)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
