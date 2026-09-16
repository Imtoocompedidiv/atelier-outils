import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { example, parseCsv, review } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Opéra Print · Séries nominatives");
  const [text, setText] = useState(example),
    [rows, setRows] = useState(parseCsv(example)),
    [selected, setSelected] = useState(1),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [showText, setShowText] = useState(false);
  const checks = review(rows),
    current = rows[selected],
    ready = checks.filter((x) => !x.length).length;
  function analyze(input = text) {
    try {
      setRows(parseCsv(input));
      setSelected(0);
      setError("");
      setMessage("Table importée. Les anomalies sont recalculées.");
      setShowText(false);
    } catch (e) {
      setError(e.message);
    }
  }
  function edit(k, v) {
    setRows((a) => a.map((r, i) => (i === selected ? { ...r, [k]: v } : r)));
    setMessage("Modification appliquée à la table.");
  }
  function exportRows() {
    downloadCsv(
      "opera-serie-validee.csv",
      ["Nom", "Prénom", "ID", "Fonction"],
      rows
        .filter((r, i) => !checks[i].length)
        .map((r) => [r.nom, r.prenom, r.id, r.fonction]),
    );
    setMessage(
      `${ready} lignes sans anomalie déclarée exportées. Les ${rows.length - ready} autres restent à corriger.`,
    );
  }
  async function readFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200000) {
      setError("Fichier trop volumineux, 200 Ko maximum.");
      return;
    }
    const content = await file.text();
    setText(content);
    analyze(content);
    e.target.value = "";
  }
  return (
    <div className="opera-print-app">
      <DemoNotice company="Opéra Print" />
      <div className="opera-print-layout">
        <aside>
          <b>
            Opéra <em>Print</em>
          </b>
          <p>
            STUDIO D’IMPRESSION <br />
            PARIS · 2<sup>E</sup>
          </p>
          <div className="opera-print-rail">
            01 <br />
            <strong>
              Séries <br />
              nominatives
            </strong>
            <span>
              La table avant <br />
              le prépresse.
            </span>
          </div>
          <small>
            86 × 54 mm <br />
            Une carte, un enregistrement.
          </small>
        </aside>
        <main>
          <div className="opera-print-heading">
            <span>CONTRÔLE DES DONNÉES VARIABLES</span>
            <h1>
              Séries nominatives, <br />
              prêtes à relire.
            </h1>
            <p>
              Repérer les données manquantes et les doublons, avant de composer
              la série.
            </p>
          </div>
          <div className="opera-print-tools">
            <label className="opera-print-upload">
              Importer un CSV
              <input type="file" accept=".csv,text/csv" onChange={readFile} />
            </label>
            <button onClick={() => setShowText((x) => !x)}>
              {showText ? "Fermer le texte" : "Coller un tableau"}
            </button>
            <button
              onClick={() => {
                setText(example);
                setRows(parseCsv(example));
                setSelected(1);
                setError("");
                setMessage("Exemple réinitialisé.");
              }}
            >
              Reprendre l’exemple ↺
            </button>
            <span>
              {rows.length} lignes · {ready} sans anomalie
            </span>
          </div>
          {showText && (
            <section className="opera-print-import">
              <label>
                CSV UTF-8, séparateur point-virgule
                <textarea
                  rows="7"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </label>
              <button onClick={() => analyze()}>Analyser la table</button>
              <small>
                Colonnes attendues : Nom;Prénom;ID;Fonction · 1 000 lignes
                maximum.
              </small>
            </section>
          )}
          {error && (
            <p className="opera-print-error" role="alert">
              {error}
            </p>
          )}
          <div className="opera-print-work">
            <section className="opera-print-data">
              <div className="opera-print-tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>ID</th>
                      <th>Contrôle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={selected === i ? "selected" : ""}>
                        <td>
                          <button
                            aria-label={`Modifier la ligne ${i + 1}`}
                            onClick={() => setSelected(i)}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </button>
                        </td>
                        <td>{r.nom || "—"}</td>
                        <td>{r.prenom || "—"}</td>
                        <td>{r.id || "—"}</td>
                        <td>
                          <span
                            className={checks[i].length ? "issue" : "valid"}
                          >
                            {checks[i].join(" · ") || "✓ Données présentes"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <section className="opera-print-editor">
                <h2>Ligne {selected + 1} · édition directe</h2>
                <div>
                  {[
                    ["nom", "Nom"],
                    ["prenom", "Prénom"],
                    ["id", "ID"],
                    ["fonction", "Fonction"],
                  ].map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={current[key]}
                        maxLength={120}
                        onChange={(e) => edit(key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <small>
                  Les changements sont pris en compte immédiatement. Aucun
                  fichier n’est envoyé.
                </small>
              </section>
            </section>
            <section className="opera-print-preview">
              <h2>Aperçu de la carte</h2>
              <div className="opera-print-card">
                <div>
                  <b>
                    RENCONTRES <br />
                    GRAPHIQUES
                  </b>
                  <small>
                    EXEMPLE <br />
                    PARIS 2026
                  </small>
                </div>
                <section>
                  <p>
                    {current.prenom || "Prénom"}
                    <br />
                    <strong>
                      {(current.nom || "Nom").toLocaleUpperCase("fr")}
                    </strong>
                  </p>
                  <span>{current.fonction || "Fonction à préciser"}</span>
                  <b>{current.id || "ID absent"}</b>
                  <i aria-hidden="true" />
                </section>
              </div>
              <p className="opera-print-caption">
                Aperçu à proportions 86 × 54. Modèle fictif, sans valeur de BAT.
              </p>
              <div className="opera-print-review">
                <h3>Contrôle de cette ligne</h3>
                {checks[selected].length ? (
                  checks[selected].map((x) => <p key={x}>× {x}</p>)
                ) : (
                  <p>
                    ✓ Les champs requis sont présents et l’identifiant est
                    unique.
                  </p>
                )}
                <small>
                  Une relecture graphique reste nécessaire pour chaque mise en
                  page.
                </small>
              </div>
              <button
                className="opera-print-export"
                disabled={!ready}
                onClick={exportRows}
              >
                Exporter {ready} lignes prêtes en CSV ↓
              </button>
            </section>
          </div>
          <p className="opera-print-status" role="status">
            {message ||
              "Dans cet exemple, corrigez le prénom absent et attribuez un ID distinct à la ligne 4."}
          </p>
        </main>
      </div>
      <DemoFooter>
        Contrôle local de la table uniquement. Aucune génération de fichier
        d’impression ni validation colorimétrique.
      </DemoFooter>
    </div>
  );
}
