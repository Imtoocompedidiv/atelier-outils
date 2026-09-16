export const initialSessions = [
  { id: 1, status: "done", date: "2026-09-07", time: "09:00", duration: 120 },
  { id: 2, status: "done", date: "2026-09-09", time: "14:00", duration: 120 },
  {
    id: 3,
    status: "planned",
    date: "2026-09-21",
    time: "09:00",
    duration: 120,
  },
  {
    id: 4,
    status: "planned",
    date: "2026-09-23",
    time: "14:00",
    duration: 120,
  },
  {
    id: 5,
    status: "planned",
    date: "2026-09-28",
    time: "10:00",
    duration: 120,
  },
  { id: 6, status: "unplanned", date: "", time: "", duration: 120 },
];
export const blockedSlots = [
  {
    id: "blocked",
    date: "2026-09-22",
    time: "10:00",
    duration: 120,
    title: "Autre engagement",
  },
];
export const minutes = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function validateSlot(slot, sessions, targetId) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) return "Choisissez une date.";
  const date = new Date(slot.date + "T00:00:00Z");
  if (
    Number.isNaN(date.valueOf()) ||
    date.toISOString().slice(0, 10) !== slot.date
  )
    return "Cette date n’existe pas.";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time))
    return "Choisissez une heure valide.";
  if (slot.duration !== 120)
    return "Chaque séance de cet exemple dure deux heures.";
  const start = minutes(slot.time),
    end = start + slot.duration;
  if (start < 8 * 60 || end > 18 * 60)
    return "Choisissez un créneau compris entre 8 h et 18 h.";
  const collision = [
    ...sessions.filter((s) => s.id !== targetId && s.status !== "unplanned"),
    ...blockedSlots,
  ].find(
    (s) =>
      s.date === slot.date &&
      start < minutes(s.time) + s.duration &&
      end > minutes(s.time),
  );
  return collision
    ? `Chevauchement avec ${collision.title || "la séance " + collision.id}, de ${collision.time} à ${endTime(collision)}.`
    : "";
}
export function endTime(slot) {
  const end = minutes(slot.time) + slot.duration;
  return (
    String(Math.floor(end / 60)).padStart(2, "0") +
    ":" +
    String(end % 60).padStart(2, "0")
  );
}
export function hourSummary(sessions) {
  return sessions.reduce(
    (summary, s) => ({
      ...summary,
      [s.status]: summary[s.status] + s.duration / 60,
      total: summary.total + s.duration / 60,
    }),
    { done: 0, planned: 0, unplanned: 0, total: 0 },
  );
}
export function confirmSlot(sessions, targetId, slot) {
  const target = sessions.find((s) => s.id === targetId);
  if (!target || target.status === "done")
    return { error: "Cette séance ne peut pas être déplacée." };
  const error = validateSlot(slot, sessions, targetId);
  if (error) return { error };
  return {
    sessions: sessions.map((s) =>
      s.id === targetId ? { ...s, ...slot, status: "planned" } : s,
    ),
  };
}
export function weekDays(date) {
  const day = new Date(date + "T00:00:00Z");
  day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const next = new Date(day);
    next.setUTCDate(next.getUTCDate() + i);
    return next.toISOString().slice(0, 10);
  });
}
export const formatDate = (date) =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
