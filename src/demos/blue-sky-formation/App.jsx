import React, { useState } from "react";
import "@fontsource/hind-vadodara/latin-600.css";
import "@fontsource/hind-siliguri/latin-400.css";
import "@fontsource/hind-siliguri/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { calendarFile } from "../../shared/calendar.js";
import {
  initialSessions,
  blockedSlots,
  minutes,
  endTime,
  validateSlot,
  hourSummary,
  confirmSlot,
  weekDays,
  formatDate,
} from "./model.js";
import "./styles.css";

export default function BlueSky() {
  useDocumentTitle("Blue Sky Formation · Séances reportées");
  const [sessions, setSessions] = useState(() =>
    structuredClone(initialSessions),
  );
  const [selected, setSelected] = useState(6);
  const [slot, setSlot] = useState({
    date: "2026-09-22",
    time: "10:00",
    duration: 120,
  });
  const [notice, setNotice] = useState("");
  const error = validateSlot(slot, sessions, selected);
  const summary = hourSummary(sessions);
  const confirmedTarget = sessions.find((s) => s.id === selected);
  const alreadyConfirmed =
    confirmedTarget.status === "planned" &&
    confirmedTarget.date === slot.date &&
    confirmedTarget.time === slot.time;
  const days = weekDays(slot.date || "2026-09-21");
  const entries = [
    ...sessions.filter((s) => s.status !== "unplanned"),
    ...blockedSlots.map((s) => ({ ...s, status: "blocked" })),
  ];
  const message = `Bonjour,\n\nJe vous propose de reprogrammer la séance ${selected} de votre parcours le ${formatDate(slot.date)}, de ${slot.time} à ${endTime(slot)} (2 heures).\n\nCe créneau reste une proposition jusqu’à notre confirmation commune. Pouvez-vous me confirmer votre disponibilité ?\n\nÀ bientôt,\nL’équipe pédagogique\n\nExemple fictif, aucun message envoyé.`;
  function updateSlot(patch) {
    setSlot((current) => ({ ...current, ...patch }));
    setNotice("");
  }
  function confirm() {
    const result = confirmSlot(sessions, selected, slot);
    if (result.error) return setNotice(result.error);
    setSessions(result.sessions);
    setNotice(
      `Séance ${selected} confirmée dans l’exemple. Les douze heures du parcours sont conservées.`,
    );
  }
  function exportCalendar() {
    const events = sessions
      .filter((s) => s.status === "planned")
      .map((s) => ({
        ...s,
        id: `bluesky-session-${s.id}`,
        title: `Séance ${s.id} · parcours fictif`,
        description:
          "Exemple Blue Sky. Horaires locaux. Aucun rendez-vous réel réservé.",
      }));
    downloadText(
      "blue-sky-planning-exemple.ics",
      calendarFile(events, "Parcours de démonstration"),
      "text/calendar;charset=utf-8",
    );
    setNotice(
      `${events.length} séances planifiées exportées, hors proposition non confirmée. Horaires locaux du calendrier d’import.`,
    );
  }
  return (
    <div className="blue-sky">
      <DemoNotice company="Blue Sky Formation" />
      <header>
        <a href="https://www.bsforma.com/bsf/" target="_blank" rel="noreferrer">
          Blue Sky Formation
        </a>
        <span>Suivi pédagogique</span>
      </header>
      <main>
        <h1>
          Une séance reportée.
          <br className="blue-sky-mobile-break" /> Le parcours reste clair.
        </h1>
        <p className="blue-sky-intro">
          Six séances de deux heures. Une nouvelle date à trouver, sans perdre
          le fil des heures.
        </p>
        <section
          className="blue-sky-journey"
          aria-label="Les six séances du parcours"
        >
          {sessions.map((s) => (
            <button
              key={s.id}
              disabled={s.status === "done"}
              aria-pressed={selected === s.id}
              className={s.status}
              onClick={() => {
                setSelected(s.id);
                if (s.date)
                  setSlot({ date: s.date, time: s.time, duration: s.duration });
                setNotice("");
              }}
            >
              <span className="blue-sky-session-top">
                <b>{s.status === "done" ? "✓" : s.id}</b>
                <strong>
                  Séance {s.id}
                  <small>2 h</small>
                </strong>
              </span>
              <span>{s.date ? formatDate(s.date) : "À replanifier"}</span>
              <small>
                {s.date
                  ? `${s.time} – ${endTime(s)}`
                  : "Choisir une nouvelle date"}
              </small>
            </button>
          ))}
          <div className="blue-sky-course">
            <span>Parcours fictif</span>
            <strong>12 h</strong>
            <small>6 séances de 2 h</small>
          </div>
        </section>
        <div className="blue-sky-workspace">
          <section className="blue-sky-calendar">
            <div className="blue-sky-calendar-title">
              <h2>Semaine du {formatDate(days[0])}</h2>
              <span>08 h à 18 h</span>
            </div>
            <div className="blue-sky-scroll">
              <div className="blue-sky-week">
                <div className="blue-sky-corner">Heure</div>
                {days.map((date) => (
                  <div className="blue-sky-day" key={date}>
                    {formatDate(date)}
                  </div>
                ))}
                <div className="blue-sky-hours">
                  {[8, 10, 12, 14, 16, 18].map((hour) => (
                    <span key={hour} style={{ top: `${(hour - 8) * 10}%` }}>
                      {hour}:00
                    </span>
                  ))}
                </div>
                {days.map((date) => (
                  <div className="blue-sky-day-body" key={date}>
                    {entries
                      .filter((s) => s.date === date)
                      .map((s) => (
                        <div
                          key={s.id}
                          className={`blue-sky-event ${s.status}`}
                          style={{
                            top: `${(minutes(s.time) - 480) / 6}%`,
                            height: `${s.duration / 6}%`,
                          }}
                        >
                          <strong>{s.title || `Séance ${s.id}`}</strong>
                          <span>
                            {s.time}–{endTime(s)}
                          </span>
                          <small>
                            {s.status === "blocked"
                              ? "Indisponible"
                              : s.status === "done"
                                ? "Effectuée"
                                : "Planifiée"}
                          </small>
                        </div>
                      ))}
                    {slot.date === date && !error && !alreadyConfirmed && (
                      <div
                        className="blue-sky-event proposed"
                        style={{
                          top: `${(minutes(slot.time) - 480) / 6}%`,
                          height: `${slot.duration / 6}%`,
                        }}
                      >
                        <strong>Séance {selected}</strong>
                        <span>
                          {slot.time}–{endTime(slot)}
                        </span>
                        <small>Proposition</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <p className="blue-sky-legend">
              <span>● Planifiée</span>
              <span>● Indisponible</span>
              <span>● Proposition</span>
            </p>
            <p className="blue-sky-weekend">
              Le calendrier montre les jours ouvrés. Les dates de week-end
              restent possibles si les personnes les confirment.
            </p>
          </section>
          <section className="blue-sky-proposal">
            <h2>Une nouvelle date pour la séance {selected}</h2>
            <div className="blue-sky-fields">
              <label>
                Date
                <input
                  type="date"
                  value={slot.date}
                  onChange={(e) =>
                    e.target.value && updateSlot({ date: e.target.value })
                  }
                />
              </label>
              <label>
                Début
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) =>
                    e.target.value && updateSlot({ time: e.target.value })
                  }
                />
              </label>
            </div>
            <p className="blue-sky-duration">
              Durée fixe du parcours <strong>2 heures</strong>
            </p>
            <div className="blue-sky-examples">
              <button
                onClick={() =>
                  updateSlot({ date: "2026-09-22", time: "10:00" })
                }
              >
                Essayer un conflit
              </button>
              <button
                onClick={() =>
                  updateSlot({ date: "2026-09-25", time: "10:00" })
                }
              >
                Essayer un créneau libre
              </button>
            </div>
            <div
              className={`blue-sky-feedback ${error ? "error" : "available"}`}
              role="status"
            >
              <strong>
                {error
                  ? "Créneau à revoir"
                  : "Aucun chevauchement dans cet exemple"}
              </strong>
              <span>
                {error ||
                  "La disponibilité réelle du participant et du formateur reste à confirmer."}
              </span>
            </div>
            <h3>Message de proposition</h3>
            <pre>{message}</pre>
            <button
              className="primary"
              disabled={Boolean(error) || alreadyConfirmed}
              onClick={confirm}
            >
              {alreadyConfirmed
                ? "Créneau confirmé dans l’exemple"
                : "Confirmer ce créneau dans l’exemple"}
            </button>
            <div className="blue-sky-actions">
              <button onClick={exportCalendar}>Exporter le calendrier</button>
              <button
                disabled={Boolean(error)}
                onClick={() => {
                  downloadText("blue-sky-proposition.txt", message);
                  setNotice(
                    "Proposition téléchargée. Elle n’a pas été envoyée.",
                  );
                }}
              >
                Télécharger la proposition
              </button>
            </div>
          </section>
        </div>
        <section className="blue-sky-totals" aria-label="Bilan des heures">
          <h2>
            Bilan du parcours
            <small>La proposition n’ajoute aucune heure.</small>
          </h2>
          <div>
            <span>Effectuées</span>
            <strong>{summary.done} h</strong>
          </div>
          <b>+</b>
          <div>
            <span>Planifiées</span>
            <strong>{summary.planned} h</strong>
          </div>
          <b>+</b>
          <div>
            <span>À replanifier</span>
            <strong>{summary.unplanned} h</strong>
          </div>
          <b>=</b>
          <div>
            <span>Total</span>
            <strong>{summary.total} h</strong>
          </div>
        </section>
        <div className="blue-sky-bottom">
          <p role="status">{notice}</p>
          <button
            onClick={() => {
              setSessions(structuredClone(initialSessions));
              setSelected(6);
              setSlot({ date: "2026-09-22", time: "10:00", duration: 120 });
              setNotice("Le parcours fictif a été rétabli.");
            }}
          >
            Reprendre l’exemple
          </button>
        </div>
      </main>
      <DemoFooter>
        Aucune raison d’absence collectée. Dates et disponibilités fictives. Les
        confirmations ne modifient que cette démonstration.
      </DemoFooter>
    </div>
  );
}
