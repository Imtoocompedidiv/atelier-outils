import React, { useState } from "react";
import "@fontsource/sora/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import { seedEvents, sharedEvents, buildReport } from "./model.js";
import "./styles.css";

export default function Lcrh() {
  useDocumentTitle("LCRH · Le point mission");
  const [events, setEvents] = useState(() => structuredClone(seedEvents));
  const [from, setFrom] = useState("2026-09-14");
  const [to, setTo] = useState("2026-09-20");
  const [edits, setEdits] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newStage, setNewStage] = useState("Échange");
  const [newPrivate, setNewPrivate] = useState(false);
  const [notice, setNotice] = useState("");
  const report = buildReport(events, from, to);
  const content = { ...report, ...edits };
  const dateText = (value) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const invalidDates = !from || !to || from > to;
  function modifyEvents(next) {
    setEvents(next);
    setEdits({});
    setNotice("Le document a été recalculé depuis les actions partageables.");
  }
  function exportReport() {
    const text = `Point mission · Exemple fictif\nResponsable maintenance\nDu ${dateText(from)} au ${dateText(to)}\n\nCette semaine\n${content.summary || "Aucune action à partager."}\n\nDécisions attendues\n${content.decisions || "Aucune décision consignée."}\n\nProchain échange\n${content.next || "À convenir."}`;
    downloadText("lcrh-point-mission-exemple.txt", text);
    setNotice(
      "Le récapitulatif a été téléchargé. Les notes internes en sont exclues.",
    );
  }
  function exportCsv() {
    const rows = sharedEvents(events, from, to);
    downloadCsv(
      "lcrh-actions-partageables.csv",
      ["Date", "Étape", "Action"],
      rows.map((e) => [e.date, e.stage, e.note]),
    );
    setNotice(
      `${rows.length} actions partageables exportées. Les notes internes restent exclues.`,
    );
  }
  function addEvent(e) {
    e.preventDefault();
    if (!newNote.trim() || invalidDates) return;
    modifyEvents([
      ...events,
      {
        id: Math.max(...events.map((v) => v.id)) + 1,
        date: to,
        stage: newStage,
        note: newNote.trim(),
        internal: newPrivate,
        shared: !newPrivate,
      },
    ]);
    setNewNote("");
    setShowForm(false);
  }
  return (
    <div className="lcrh">
      <DemoNotice company="Le Cabinet RH" />
      <header className="lcrh-header">
        <a href="https://www.lcrh.fr/" target="_blank" rel="noreferrer">
          LCRH
        </a>
        <span>Le point mission</span>
        <button
          onClick={() => {
            setEvents(structuredClone(seedEvents));
            setFrom("2026-09-14");
            setTo("2026-09-20");
            setEdits({});
            setNotice("Le journal fictif a été rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main>
        <h1>
          Le rendez-vous client <br />
          commence ici.
        </h1>
        <p className="lcrh-intro">
          Un journal de mission, un compte rendu à relire. Vous choisissez les
          informations qui quittent le cabinet.
        </p>
        <div className="lcrh-toolbar">
          <div>
            <label>
              Du
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setEdits({});
                }}
              />
            </label>
            <label>
              Au
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setEdits({});
                }}
              />
            </label>
          </div>
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              aria-expanded={showForm}
            >
              Ajouter une action
            </button>
            <button onClick={exportCsv} disabled={invalidDates}>
              Exporter les actions
            </button>
            <button
              className="primary"
              onClick={exportReport}
              disabled={invalidDates}
            >
              Télécharger le récapitulatif
            </button>
          </div>
        </div>
        {invalidDates && (
          <p className="lcrh-alert" role="alert">
            Choisissez une période valide. La date de début doit précéder la
            date de fin.
          </p>
        )}
        {showForm && (
          <form className="lcrh-add" onSubmit={addEvent}>
            <label>
              Étape
              <select
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
              >
                {[
                  "Échange",
                  "Recherche",
                  "Document",
                  "Décision attendue",
                  "Prochain échange",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Action du {to || "jour choisi"}
              <input
                value={newNote}
                required
                maxLength={400}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Exemple fictif à ajouter au journal"
              />
            </label>
            <label className="lcrh-check">
              <input
                type="checkbox"
                checked={newPrivate}
                onChange={(e) => setNewPrivate(e.target.checked)}
              />
              Note interne
            </label>
            <button type="submit" className="primary" disabled={invalidDates}>
              Ajouter au journal
            </button>
          </form>
        )}
        <div className="lcrh-desk">
          <section className="lcrh-journal">
            <div className="lcrh-section-head">
              <h2>Le journal</h2>
              <span>{events.length} actions dans l’exemple</span>
            </div>
            <ol>
              {events
                .filter((e) => !invalidDates && e.date >= from && e.date <= to)
                .map((event) => (
                  <li
                    key={event.id}
                    className={event.internal ? "internal" : ""}
                  >
                    <div className="lcrh-event-date">
                      <time>{dateText(event.date)}</time>
                      <span>{event.stage}</span>
                    </div>
                    <div>
                      <p>{event.note}</p>
                      {event.internal && (
                        <small>Note interne, exclue du document client</small>
                      )}
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        checked={event.shared && !event.internal}
                        disabled={event.internal}
                        aria-label={`Partager l’action ${event.id}`}
                        onChange={(e) =>
                          modifyEvents(
                            events.map((v) =>
                              v.id === event.id
                                ? { ...v, shared: e.target.checked }
                                : v,
                            ),
                          )
                        }
                      />
                      <span className="sr-only">Partager</span>
                    </label>
                  </li>
                ))}
            </ol>
          </section>
          <section className="lcrh-document" aria-label="Document client">
            <div className="lcrh-doc-meta">
              <span>Document client</span>
              <span>{report.count} actions retenues</span>
            </div>
            <h2>
              Responsable <br />
              maintenance
            </h2>
            <p className="lcrh-period">
              {invalidDates
                ? "Période à corriger"
                : `Du ${dateText(from)} au ${dateText(to)}`}
            </p>
            {[
              [
                "summary",
                "Cette semaine",
                "Aucune action à partager sur cette période.",
              ],
              [
                "decisions",
                "Décisions attendues",
                "Aucune décision consignée.",
              ],
              ["next", "Prochain échange", "À convenir avec le client."],
            ].map(([key, label, placeholder]) => (
              <label className="lcrh-doc-section" key={key}>
                {label}
                <textarea
                  value={content[key]}
                  placeholder={placeholder}
                  onChange={(e) =>
                    setEdits({ ...edits, [key]: e.target.value })
                  }
                  rows={key === "summary" ? 7 : 3}
                />
              </label>
            ))}
            <p className="lcrh-doc-note">
              Le texte est modifiable. Une modification du journal ou de la
              période recalcule le document.
            </p>
          </section>
        </div>
        <p role="status" className="lcrh-notice">
          {notice}
        </p>
      </main>
      <DemoFooter>
        Personnes, mission et actions fictives. Aucun CV ni message réel. Les
        exports contiennent uniquement la sélection partageable.
      </DemoFooter>
    </div>
  );
}
