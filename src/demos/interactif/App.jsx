import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import {
  initialPeople,
  requirements,
  missingRequirements,
  isReady,
  reminder,
  readiness,
} from "./model.js";
import "./styles.css";

export default function Interactif() {
  useDocumentTitle("Interactif · Préparation de session");
  const [people, setPeople] = useState(() => structuredClone(initialPeople));
  const [selectedId, setSelectedId] = useState("A01");
  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState("2026-09-28");
  const [capacity, setCapacity] = useState(6);
  const [notice, setNotice] = useState("");
  const selected = people.find((person) => person.id === selectedId);
  const dateLabel = new Date(
    `${date || "2026-09-28"}T12:00:00`,
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const stats = readiness(people);
  const visible = people.filter(
    (p) => filter === "all" || (filter === "ready" ? isReady(p) : !isReady(p)),
  );
  const text = reminder(selected, dateLabel);
  function update(id, key, value) {
    setPeople((current) =>
      current.map((p) => (p.id === id ? { ...p, [key]: value } : p)),
    );
    setNotice("Dossier mis à jour dans la démonstration.");
  }
  function exportAll() {
    downloadCsv(
      "interactif-preparation-exemple.csv",
      [
        "Référence",
        "Participant fictif",
        "Modalité",
        "Financement",
        "Entretien validé",
        "Convention reçue",
        "Attentes reçues",
        "État",
        "Relance à relire",
      ],
      people.map((p) => [
        p.id,
        p.name,
        p.mode,
        p.funding,
        p.interview ? "Oui" : "Non",
        p.agreement ? "Oui" : "Non",
        p.expectations ? "Oui" : "Non",
        isReady(p) ? "Prêt" : "À compléter",
        reminder(p, dateLabel),
      ]),
    );
    setNotice(
      "Le fichier CSV de la session a été préparé. Aucun mail n’a été envoyé.",
    );
  }
  return (
    <div className="interactif">
      <DemoNotice company="Interactif" />
      <header className="interactif-header">
        <a
          className="interactif-brand"
          href="https://www.interactif.eu/"
          target="_blank"
          rel="noreferrer"
        >
          INTERACTIF
          <span />
        </a>
        <span>Préparation de session</span>
        <button
          className="interactif-reset no-print"
          onClick={() => {
            setPeople(structuredClone(initialPeople));
            setSelectedId("A01");
            setFilter("all");
            setDate("2026-09-28");
            setCapacity(6);
            setNotice("Les six dossiers fictifs ont été rétablis.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main>
        <h1>
          Les bonnes pièces,
          <br className="interactif-break" /> avant le premier jour.
        </h1>
        <p className="interactif-intro">
          Manager une équipe. Six dossiers de démonstration à préparer, une vue
          pour décider de la prochaine action.
        </p>
        <div className="interactif-session">
          <label>
            Début de session
            <input
              type="date"
              value={date}
              required
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </label>
          <label>
            Places en salle
            <input
              type="number"
              min="1"
              max="50"
              value={capacity}
              onChange={(e) =>
                setCapacity(
                  Math.min(50, Math.max(1, Number(e.target.value) || 1)),
                )
              }
            />
          </label>
          <div className="interactif-progress">
            <strong>
              {stats.ready} dossiers prêts sur {stats.total}
            </strong>
            <progress value={stats.ready} max={stats.total} />
            <span>
              {stats.onsite} en présentiel, {stats.total - stats.onsite} en
              visio
              {stats.onsite > capacity
                ? ` · ${stats.onsite - capacity} place(s) à trouver`
                : ""}
            </span>
          </div>
        </div>
        {stats.onsite > capacity && (
          <p className="interactif-warning" role="alert">
            La capacité de salle choisie est dépassée. Ajustez la salle ou la
            modalité avec les participants.
          </p>
        )}
        <div className="interactif-workspace">
          <section aria-label="Dossiers des participants">
            <div className="interactif-filter">
              <h2>Les dossiers</h2>
              <label>
                <span className="sr-only">Afficher les dossiers</span>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">Tous les dossiers</option>
                  <option value="missing">À compléter</option>
                  <option value="ready">Prêts</option>
                </select>
              </label>
            </div>
            <div className="interactif-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    {requirements.map((r) => (
                      <th key={r.key}>{r.label}</th>
                    ))}
                    <th>État</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((person) => (
                    <tr
                      key={person.id}
                      className={selectedId === person.id ? "selected" : ""}
                    >
                      <th scope="row">
                        <button
                          className="interactif-person"
                          onClick={() => setSelectedId(person.id)}
                          aria-pressed={selectedId === person.id}
                        >
                          <span className="interactif-initials">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <span>
                            {person.name}
                            <small>
                              {person.mode} · {person.funding}
                            </small>
                          </span>
                        </button>
                      </th>
                      {requirements.map((r) => (
                        <td key={r.key}>
                          <label
                            className={
                              person[r.key]
                                ? "interactif-check complete"
                                : "interactif-check"
                            }
                          >
                            <input
                              type="checkbox"
                              checked={person[r.key]}
                              aria-label={`${r.label} de ${person.name}`}
                              onChange={(e) =>
                                update(person.id, r.key, e.target.checked)
                              }
                            />
                            <span>
                              {person[r.key]
                                ? r.key === "interview"
                                  ? "Validé"
                                  : "Reçu"
                                : "À faire"}
                            </span>
                          </label>
                        </td>
                      ))}
                      <td>
                        <span
                          className={
                            isReady(person)
                              ? "interactif-state ready"
                              : "interactif-state"
                          }
                        >
                          {isReady(person) ? "Prêt" : "À compléter"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visible.length && (
                <p className="interactif-empty">
                  Aucun dossier ne correspond à ce filtre.
                </p>
              )}
            </div>
            <p className="interactif-rule">
              Les cases sont modifiables. L’entretien reste une validation
              humaine. Les règles de cet exemple sont à définir avec votre
              équipe.
            </p>
          </section>
          <aside
            aria-label="Détail du dossier sélectionné"
            className="interactif-paper"
          >
            <h2>{text ? "Relance à préparer" : "Dossier prêt"}</h2>
            <h3>{selected.name}</h3>
            <div className="interactif-details">
              <label>
                Modalité
                <select
                  value={selected.mode}
                  onChange={(e) => update(selected.id, "mode", e.target.value)}
                >
                  <option>Présentiel</option>
                  <option>Visio</option>
                </select>
              </label>
              <label>
                Financement
                <select
                  value={selected.funding}
                  onChange={(e) =>
                    update(selected.id, "funding", e.target.value)
                  }
                >
                  <option>Entreprise</option>
                  <option>Personnel</option>
                  <option>À préciser</option>
                </select>
              </label>
            </div>
            {text ? (
              <>
                <p className="interactif-document-title">
                  Brouillon à relire avant utilisation
                </p>
                <pre>{text}</pre>
                <button
                  className="interactif-primary"
                  onClick={() => {
                    downloadText(`interactif-relance-${selected.id}.txt`, text);
                    setNotice(
                      `Brouillon de ${selected.name} téléchargé. Aucun envoi effectué.`,
                    );
                  }}
                >
                  Télécharger ce brouillon
                </button>
              </>
            ) : (
              <div className="interactif-ready">
                <span aria-hidden="true">✓</span>
                <p>
                  Les éléments de cet exemple sont réunis. Aucune relance à
                  préparer pour {selected.name.split(" ")[0]}.
                </p>
              </div>
            )}
            <p className="interactif-count">
              {missingRequirements(selected).length} étape(s) à compléter
              {selected.funding === "À préciser"
                ? ", financement à préciser"
                : ""}
              .
            </p>
          </aside>
        </div>
        <div className="interactif-bottom">
          <p>Un fichier pour reprendre le suivi dans votre outil habituel.</p>
          <button className="interactif-primary" onClick={exportAll}>
            Exporter la préparation de session
          </button>
        </div>
        <p className="interactif-live" role="status" aria-live="polite">
          {notice}
        </p>
      </main>
      <DemoFooter />
    </div>
  );
}
