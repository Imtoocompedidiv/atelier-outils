const escapeValue = (value) =>
  String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\r", "")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
function fold(line) {
  let result = "",
    bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) {
      result += "\r\n ";
      bytes = 1;
    }
    result += char;
    bytes += size;
  }
  return result;
}
export function calendarFile(events, label = "Atelier JD") {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JD//Atelier//FR",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeValue(label)}`,
  ];
  const stamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  for (const event of events) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date))
      throw new Error("Date non valide");
    const d = new Date(event.date + "T00:00:00Z");
    if (
      Number.isNaN(d.valueOf()) ||
      d.toISOString().slice(0, 10) !== event.date
    )
      throw new Error("Date non valide");
    const compact = event.date.replaceAll("-", "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeValue(event.id)}@atelier.example`,
      `DTSTAMP:${stamp}`,
    );
    if (event.time) {
      if (
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time) ||
        !Number.isInteger(event.duration) ||
        event.duration < 1 ||
        event.duration > 1440
      )
        throw new Error("Horaire non valide");
      const end = new Date(event.date + "T" + event.time + ":00Z");
      end.setUTCMinutes(end.getUTCMinutes() + event.duration);
      lines.push(
        `DTSTART:${compact}T${event.time.replace(":", "")}00`,
        `DTEND:${end.toISOString().replace(/[-:]/g, "").slice(0, 15)}`,
      );
    } else {
      d.setUTCDate(d.getUTCDate() + 1);
      lines.push(
        `DTSTART;VALUE=DATE:${compact}`,
        `DTEND;VALUE=DATE:${d.toISOString().slice(0, 10).replaceAll("-", "")}`,
      );
    }
    lines.push(
      `SUMMARY:${escapeValue(event.title)}`,
      `DESCRIPTION:${escapeValue(event.description || "Données de démonstration. Aucun rendez-vous réel réservé.")}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  return [...lines, "END:VCALENDAR"].map(fold).join("\r\n") + "\r\n";
}
