import React, { useState } from "react";
import "@fontsource/fraunces/latin-500.css";
import "@fontsource/jaldi/latin-400.css";
import "@fontsource/jaldi/latin-700.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText, downloadCsv } from "../../shared/files.js";
import { arrivals, addDays, schedule, toIcs } from "./model.js";
import "./styles.css";

export default function Voluntae() {
  useDocumentTitle("Voluntae · Les premières semaines");
  const [people, setPeople] = useState(() => structuredClone(arrivals));
  const [selected, setSelected] = useState("em");
  const [milestones, setMilestones] = useState([7, 21, 45]);
  const [done, setDone] = useState({ "em-0": true });
  const [view, setView] = useState("person");
  const [week, setWeek] = useState("2026-09-21");
  const [notice, setNotice] = useState("");
  const person = people.find((p) => p.id === selected);
  const events = schedule(people, milestones, done);
  const validMilestones =
    milestones[0] < milestones[1] && milestones[1] < milestones[2];
  const dateText = (value) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  const rows =
    view === "person"
      ? events.filter((e) => e.id.startsWith(person.id + "-"))
      : events.filter((e) => e.date >= week && e.date < addDays(week, 7));
  function reset() {
    setPeople(structuredClone(arrivals));
    setSelected("em");
    setMilestones([7, 21, 45]);
    setDone({ "em-0": true });
    setView("person");
    setWeek("2026-09-21");
    setNotice("L’exemple a été rétabli.");
  }
  function exportCalendar() {
    const pending = rows.filter((e) => !e.done);
    if (!pending.length) {
      setNotice(
        "Tous les échanges affichés sont déjà réalisés. Aucun rendez-vous à exporter.",
      );
      return;
    }
    downloadText(
      "voluntae-suivi-exemple.ics",
      toIcs(pending),
      "text/calendar;charset=utf-8",
    );
    setNotice(
      `${pending.length} dates de suivi exportées. Ouvrez le fichier dans votre calendrier pour les importer.`,
    );
  }
  return (
    <div className="voluntae">
      <DemoNotice company="Voluntae" />
      <header className="voluntae-header">
        <a href="https://voluntae.fr/" target="_blank" rel="noreferrer">
          Voluntae
        </a>
        <div>
          <button onClick={reset}>Reprendre l’exemple</button>
          <button
            onClick={() => {
              downloadCsv(
                "voluntae-suivi-exemple.csv",
                ["Date", "Personne fictive", "Mission", "Étape", "État"],
                rows.map((e) => [
                  e.date,
                  e.person,
                  e.role,
                  e.label,
                  e.done ? "Réalisé" : "À prévoir",
                ]),
              );
              setNotice("Le suivi affiché a été exporté en CSV.");
            }}
          >
            Exporter le suivi
          </button>
          <button
            className="primary"
            onClick={exportCalendar}
            disabled={!validMilestones}
          >
            Exporter le calendrier
          </button>
        </div>
      </header>
      <div className="voluntae-layout">
        <aside className="voluntae-people" aria-label="Intégrations fictives">
          <h2>Les arrivées</h2>
          <p>Quatre missions fictives en finance</p>
          {people.map((p) => (
            <button
              key={p.id}
              className={p.id === selected ? "selected" : ""}
              aria-pressed={p.id === selected}
              onClick={() => setSelected(p.id)}
            >
              <strong>{p.name}</strong>
              <span>{p.role}</span>
              <small>Arrivée le {dateText(p.date)}</small>
            </button>
          ))}
        </aside>
        <main>
          <h1>
            Les premières <br />
            semaines comptent.
          </h1>
          <p className="voluntae-intro">
            Les dates utiles au suivi d’intégration, préparées depuis une seule
            date d’arrivée.
          </p>
          <div className="voluntae-main-top">
            <section className="voluntae-timeline">
              <p>Parcours de {person.company}</p>
              <h2>{person.name}</h2>
              <p className="voluntae-role">{person.role}</p>
              <div className="voluntae-stops">
                <div>
                  <span>Arrivée</span>
                  <i />
                  <strong>{dateText(person.date)}</strong>
                  <small>Premier jour</small>
                </div>
                {milestones.map((days, i) => (
                  <div key={i}>
                    <span>J+{days}</span>
                    <i className={done[`${person.id}-${i}`] ? "done" : ""} />
                    <strong>{dateText(addDays(person.date, days))}</strong>
                    <small>
                      {["Premier point", "Point d’étape", "Bilan de suivi"][i]}
                    </small>
                  </div>
                ))}
              </div>
            </section>
            <section
              className="voluntae-settings"
              aria-label="Paramètres du suivi"
            >
              <h2>Votre rythme de suivi</h2>
              <label>
                Date d’arrivée
                <input
                  type="date"
                  value={person.date}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setPeople(
                      people.map((p) =>
                        p.id === selected ? { ...p, date: e.target.value } : p,
                      ),
                    );
                    setDone((current) =>
                      Object.fromEntries(
                        Object.entries(current).filter(
                          ([key]) => !key.startsWith(selected + "-"),
                        ),
                      ),
                    );
                    setNotice(
                      "Les dates ont été recalculées. Les validations de ce parcours ont été réinitialisées.",
                    );
                  }}
                />
              </label>
              {milestones.map((days, i) => (
                <label key={i}>
                  {["Premier point", "Point d’étape", "Bilan de suivi"][i]}
                  <div>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      step="1"
                      aria-label={`Jours avant ${["le premier point", "le point d’étape", "le bilan de suivi"][i]}`}
                      value={days}
                      onChange={(e) => {
                        const next = [...milestones];
                        next[i] = Math.max(
                          0,
                          Math.min(
                            365,
                            Math.trunc(Number(e.target.value) || 0),
                          ),
                        );
                        setMilestones(next);
                        setDone({});
                      }}
                    />
                    <span>jours après l’arrivée</span>
                  </div>
                </label>
              ))}
            </section>
          </div>
          {!validMilestones && (
            <p className="voluntae-warning" role="alert">
              Placez les trois jalons dans un ordre croissant avant d’exporter
              le calendrier.
            </p>
          )}
          <section className="voluntae-agenda">
            <div className="voluntae-agenda-head">
              <h2>Les prochains échanges</h2>
              <label>
                <span className="sr-only">Vue du suivi</span>
                <select value={view} onChange={(e) => setView(e.target.value)}>
                  <option value="person">Ce parcours</option>
                  <option value="week">Toutes les missions, sur 7 jours</option>
                </select>
              </label>
              {view === "week" && (
                <label>
                  À partir du
                  <input
                    type="date"
                    value={week}
                    onChange={(e) => e.target.value && setWeek(e.target.value)}
                  />
                </label>
              )}
            </div>
            <div className="voluntae-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Personne</th>
                    <th>Échange</th>
                    <th>Suivi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <time>{dateText(event.date)}</time>
                      </td>
                      <td>
                        {event.person}
                        <small>{event.role}</small>
                      </td>
                      <td>
                        {event.label}
                        <small>J+{event.days}</small>
                      </td>
                      <td>
                        <label>
                          <input
                            type="checkbox"
                            checked={event.done}
                            aria-label={`${event.label} de ${event.person} réalisé`}
                            onChange={(e) =>
                              setDone({ ...done, [event.id]: e.target.checked })
                            }
                          />
                          {event.done ? "Réalisé" : "À prévoir"}
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && (
                <p className="voluntae-empty">
                  Aucun échange dans cette période. Choisissez une autre
                  semaine.
                </p>
              )}
            </div>
          </section>
          <p className="voluntae-notice" role="status">
            {notice}
          </p>
          <p className="voluntae-help">
            Ces jalons sont des exemples configurables, sans calcul de période
            d’essai ni décision sur les personnes. Le calendrier exporte
            uniquement les échanges affichés restant à réaliser.
          </p>
        </main>
      </div>
      <DemoFooter />
    </div>
  );
}
