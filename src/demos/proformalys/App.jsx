import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import { calendarFile } from "../../shared/calendar.js";
import { days, initialRoster, compatiblePairs } from "./model.js";
import "./styles.css";

export default function Proformalys() {
  useDocumentTitle("ProFormalys · Deux journées communes");
  const [roster, setRoster] = useState(() => structuredClone(initialRoster));
  const [consecutive, setConsecutive] = useState(false);
  const [selection, setSelection] = useState("");
  const [notice, setNotice] = useState("");
  const pairs = compatiblePairs(roster, consecutive);
  const selected = pairs.find((p) => p.id === selection) || pairs[0];
  const dateLabel = (d) =>
    new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  function toggle(id, index) {
    setRoster(
      roster.map((p) =>
        p.id === id
          ? {
              ...p,
              available: p.available.map((v, i) => (i === index ? !v : v)),
            }
          : p,
      ),
    );
    setSelection("");
  }
  function exportProposal() {
    if (!selected) return;
    downloadText(
      "proformalys-proposition-exemple.ics",
      calendarFile(
        selected.dates.map((date, i) => ({
          id: `proformalys-${selected.id}-${i}`,
          date,
          title: `Lecture de plans · Journée ${i + 1}`,
          description: `Proposition fictive avec ${selected.trainer}. Disponibilités à confirmer avant toute réservation.`,
        })),
        "ProFormalys · Exemple",
      ),
      "text/calendar;charset=utf-8",
    );
    setNotice(
      "Les deux journées ont été exportées. Aucune réservation effectuée.",
    );
  }
  return (
    <div className="proformalys">
      <DemoNotice company="ProFormalys" />
      <header>
        <a href="https://www.proformalys.fr/" target="_blank" rel="noreferrer">
          ProFormalys
        </a>
        <span>Préparer les dates d’une formation</span>
      </header>
      <main>
        <h1>
          Deux journées où tout <br />
          le monde se retrouve.
        </h1>
        <p className="proformalys-intro">
          Lecture de plans, session fictive. Quatre participants et un même
          formateur disponible sur les deux dates.
        </p>
        <div className="proformalys-tools">
          <label>
            <input
              type="checkbox"
              checked={consecutive}
              onChange={(e) => {
                setConsecutive(e.target.checked);
                setSelection("");
              }}
            />
            Exiger deux journées consécutives
          </label>
          <button
            onClick={() => {
              setRoster(structuredClone(initialRoster));
              setConsecutive(false);
              setSelection("");
              setNotice("Les disponibilités fictives ont été rétablies.");
            }}
          >
            Reprendre l’exemple
          </button>
        </div>
        <div className="proformalys-workspace">
          <section aria-label="Disponibilités">
            <div className="proformalys-matrix">
              <table>
                <thead>
                  <tr>
                    <th>Personnes</th>
                    {days.map((d) => (
                      <th key={d}>
                        <small>
                          {new Date(d + "T12:00:00").toLocaleDateString(
                            "fr-FR",
                            { weekday: "short" },
                          )}
                        </small>
                        {dateLabel(d)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["participant", "trainer"].map((kind) => (
                    <React.Fragment key={kind}>
                      <tr className="proformalys-group">
                        <th colSpan={9}>
                          {kind === "participant"
                            ? "Participants de l’exemple"
                            : "Formateurs retenus manuellement pour le programme"}
                        </th>
                      </tr>
                      {roster
                        .filter((p) => p.kind === kind)
                        .map((person) => (
                          <tr
                            key={person.id}
                            className={
                              person.kind === "trainer" && !person.enabled
                                ? "disabled"
                                : ""
                            }
                          >
                            <th scope="row">
                              {person.kind === "trainer" && (
                                <input
                                  type="checkbox"
                                  aria-label={`Retenir ${person.name}`}
                                  checked={person.enabled}
                                  onChange={(e) => {
                                    setRoster(
                                      roster.map((p) =>
                                        p.id === person.id
                                          ? { ...p, enabled: e.target.checked }
                                          : p,
                                      ),
                                    );
                                    setSelection("");
                                  }}
                                />
                              )}
                              {person.name}
                            </th>
                            {person.available.map((available, index) => (
                              <td key={index}>
                                <input
                                  type="checkbox"
                                  checked={available}
                                  disabled={
                                    person.kind === "trainer" && !person.enabled
                                  }
                                  aria-label={`${person.name} disponible le ${dateLabel(days[index])}`}
                                  onChange={() => toggle(person.id, index)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="proformalys-help">
              Chaque case modifie réellement les propositions. Le choix des
              formateurs pour ce programme reste une décision de l’organisme.
            </p>
          </section>
          <aside>
            <h2>
              {pairs.length} proposition{pairs.length > 1 ? "s" : ""} compatible
              {pairs.length > 1 ? "s" : ""}
            </h2>
            <p>
              Les disponibilités doivent coïncider pour les quatre participants
              et le même formateur.
            </p>
            <div className="proformalys-options">
              {pairs.map((pair) => (
                <label
                  key={pair.id}
                  className={selected?.id === pair.id ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="pair"
                    checked={selected?.id === pair.id}
                    onChange={() => setSelection(pair.id)}
                  />
                  <span>
                    {pair.dates.map(dateLabel).join(" et ")}
                    <small>{pair.trainer}</small>
                  </span>
                </label>
              ))}
            </div>
            {selected ? (
              <>
                <h3>Proposition sélectionnée</h3>
                <div className="proformalys-chosen">
                  {selected.dates.map((d) => (
                    <div key={d}>
                      <small>
                        {new Date(d + "T12:00:00").toLocaleDateString("fr-FR", {
                          weekday: "long",
                        })}
                      </small>
                      <strong>{dateLabel(d)}</strong>
                    </div>
                  ))}
                </div>
                <p className="proformalys-trainer">Avec {selected.trainer}</p>
                <button className="primary" onClick={exportProposal}>
                  Exporter la proposition
                </button>
              </>
            ) : (
              <div className="proformalys-empty">
                <strong>Aucune paire de dates commune.</strong>
                <p>
                  Essayez de modifier une disponibilité, de retenir un autre
                  formateur ou d’autoriser des journées séparées.
                </p>
              </div>
            )}
          </aside>
        </div>
        <div className="proformalys-bottom">
          <button
            onClick={() => {
              downloadCsv(
                "proformalys-disponibilites-exemple.csv",
                ["Personne fictive", "Rôle", "Retenu", ...days],
                roster.map((p) => [
                  p.name,
                  p.kind,
                  p.kind === "participant" || p.enabled ? "Oui" : "Non",
                  ...p.available.map((v) =>
                    v ? "Disponible" : "Indisponible",
                  ),
                ]),
              );
              setNotice("La matrice des disponibilités a été exportée.");
            }}
          >
            Exporter les disponibilités
          </button>
          <p role="status">{notice}</p>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
