import React, { useState } from "react";
import "@fontsource/archivo/latin-600.css";
import "@fontsource/instrument-sans/latin-400.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { themes, seedSessions, validScore, analyze } from "./model.js";
import "./styles.css";

export default function Alertis() {
  useDocumentTitle("Alertis · Bilan vérifiable");
  const [sessions, setSessions] = useState(() => structuredClone(seedSessions));
  const [sessionId, setSessionId] = useState("atelier");
  const [exclusions, setExclusions] = useState({});
  const [notice, setNotice] = useState("");
  const current = sessions.find((s) => s.id === sessionId);
  const excluded = new Set(exclusions[sessionId] || []);
  const stats = analyze(current.rows, excluded);
  const cold = current.cold.filter(Boolean).length;
  function updateScore(row, column, value) {
    setSessions(
      sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              rows: s.rows.map((r, i) =>
                i === row ? r.map((v, c) => (c === column ? value : v)) : r,
              ),
            }
          : s,
      ),
    );
    setExclusions({
      ...exclusions,
      [sessionId]: [...excluded].filter((k) => k !== `${row}-${column}`),
    });
  }
  function exportReport() {
    if (stats.pending.length) return;
    const rows = stats.columns.map((c) => [
      current.title,
      "À chaud",
      c.name,
      c.mean === null ? "" : c.mean.toFixed(4),
      c.count,
      c.sum,
      current.asked,
      stats.responses,
      stats.missing.filter((m) => themes[m.column] === c.name).length,
      stats.invalid
        .filter((i) => themes[i.column] === c.name)
        .map((i) => `R${i.row + 1}: ${i.value} exclu explicitement`)
        .join(" / "),
    ]);
    rows.push([
      current.title,
      "À froid",
      "Questionnaires reçus",
      "",
      cold,
      "",
      current.asked,
      cold,
      "",
      "Suivi distinct, non intégré aux moyennes",
    ]);
    downloadCsv(
      "alertis-bilan-exemple.csv",
      [
        "Session fictive",
        "Temps de mesure",
        "Thème",
        "Moyenne sur 5",
        "Valeurs valides ou retours",
        "Somme des notes",
        "Personnes sollicitées",
        "Retours",
        "Cases vides",
        "Exclusions et remarque",
      ],
      rows,
    );
    setNotice(
      "Bilan exporté avec dénominateurs et exclusions. Les mesures à chaud et à froid restent séparées.",
    );
  }
  return (
    <div className="alertis">
      <DemoNotice company="Alertis" />
      <header>
        <a href="https://www.alertis.fr/" target="_blank" rel="noreferrer">
          Alertis
        </a>
        <label>
          Session de démonstration
          <select
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
              setNotice("");
            }}
          >
            {sessions.map((s) => (
              <option value={s.id} key={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
      </header>
      <main>
        <h1>
          Un bilan dont les chiffres <br />
          se vérifient.
        </h1>
        <p className="alertis-intro">
          Une case vide reste une absence de réponse. Une note hors plage
          demande une décision explicite.
        </p>
        <div className="alertis-workspace">
          <section className="alertis-sheet">
            <h2>Les réponses à chaud</h2>
            <p>Notes de 1 à 5. Modifiez l’exemple pour suivre le calcul.</p>
            <div className="alertis-table">
              <table>
                <thead>
                  <tr>
                    <th>Réponse</th>
                    {themes.map((t) => (
                      <th key={t}>
                        {t}
                        <small>1 à 5</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.rows.map((row, index) => (
                    <tr key={index}>
                      <th scope="row">R{String(index + 1).padStart(2, "0")}</th>
                      {row.map((value, column) => {
                        const invalid = value !== "" && !validScore(value);
                        return (
                          <td key={column}>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="1"
                              value={value}
                              aria-label={`${themes[column]} réponse ${index + 1}`}
                              aria-invalid={invalid}
                              className={invalid ? "invalid" : ""}
                              onChange={(e) =>
                                updateScore(index, column, e.target.value)
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="alertis-issues">
              {stats.invalid.map((issue) => (
                <div key={issue.key}>
                  <span>
                    R{String(issue.row + 1).padStart(2, "0")},{" "}
                    {themes[issue.column].toLowerCase()}
                    <strong>{issue.value} sur 5</strong>
                  </span>
                  {issue.excluded ? (
                    <span className="excluded">Exclusion confirmée</span>
                  ) : (
                    <button
                      onClick={() => {
                        setExclusions({
                          ...exclusions,
                          [sessionId]: [...excluded, issue.key],
                        });
                        setNotice(
                          "Cette valeur est exclue du bilan et sera signalée dans l’export.",
                        );
                      }}
                    >
                      Exclure cette valeur du bilan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
          <section className="alertis-results">
            <div>
              <h2>La feuille de bilan</h2>
              <span
                className={
                  stats.pending.length ? "alertis-pending" : "alertis-valid"
                }
              >
                {stats.pending.length
                  ? `${stats.pending.length} valeur à vérifier`
                  : "Valeurs vérifiées"}
              </span>
            </div>
            <p>Les moyennes portent uniquement sur les notes valides.</p>
            {stats.columns.map((c) => (
              <div className="alertis-measure" key={c.name}>
                <div>
                  <strong>{c.name}</strong>
                  <span>
                    {c.mean === null
                      ? "Sans note"
                      : `${c.mean.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} / 5`}
                  </span>
                </div>
                <div className="alertis-bar">
                  <i
                    style={{
                      width: `${c.mean === null ? 0 : (c.mean / 5) * 100}%`,
                    }}
                  />
                </div>
                <small>
                  {c.count} réponse(s) valide(s), somme des notes {c.sum}
                </small>
              </div>
            ))}
            <div className="alertis-denominators">
              <div>
                <strong>
                  {stats.responses} / {current.asked}
                </strong>
                <span>retours à chaud</span>
              </div>
              <div>
                <strong>{stats.missing.length}</strong>
                <span>case(s) vide(s)</span>
              </div>
              <div>
                <strong>{stats.invalid.length}</strong>
                <span>valeur(s) hors plage</span>
              </div>
            </div>
            {stats.pending.length > 0 && (
              <p className="alertis-provisional">
                Bilan provisoire. Corrigez ou confirmez l’exclusion des valeurs
                hors plage avant export.
              </p>
            )}
          </section>
        </div>
        <section className="alertis-cold">
          <div>
            <h2>Retours à froid</h2>
            <p>
              Un suivi séparé. Ces réponses ne changent pas les moyennes à
              chaud.
            </p>
            <strong>
              {cold} retours sur {current.asked} personnes sollicitées
            </strong>
          </div>
          <div className="alertis-cold-list">
            {current.cold.map((received, index) => (
              <label key={index}>
                <span>R{String(index + 1).padStart(2, "0")}</span>
                <select
                  value={received ? "received" : "pending"}
                  aria-label={`Retour à froid ${index + 1}`}
                  onChange={(e) =>
                    setSessions(
                      sessions.map((s) =>
                        s.id === sessionId
                          ? {
                              ...s,
                              cold: s.cold.map((v, i) =>
                                i === index ? e.target.value === "received" : v,
                              ),
                            }
                          : s,
                      ),
                    )
                  }
                >
                  <option value="received">Reçu</option>
                  <option value="pending">Attendu</option>
                </select>
              </label>
            ))}
          </div>
        </section>
        <div className="alertis-actions">
          <button
            onClick={() => {
              setSessions(structuredClone(seedSessions));
              setExclusions({});
              setNotice("Les réponses fictives ont été rétablies.");
            }}
          >
            Reprendre l’exemple
          </button>
          <button
            className="primary"
            disabled={stats.pending.length > 0}
            onClick={exportReport}
          >
            Exporter le bilan
          </button>
        </div>
        <p className="alertis-notice" role="status">
          {notice}
        </p>
      </main>
      <DemoFooter />
    </div>
  );
}
