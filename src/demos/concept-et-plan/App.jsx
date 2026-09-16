import React, { useRef, useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { initial, headers, inspect, readCsv } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Concept et Plan · Index de numérisation");
  const [rows, setRows] = useState(structuredClone(initial)),
    [selected, setSelected] = useState(2),
    [group, setGroup] = useState("Tous"),
    [query, setQuery] = useState(""),
    [issuesOnly, setIssuesOnly] = useState(false),
    [message, setMessage] = useState(""),
    [importError, setImportError] = useState("");
  const file = useRef(null),
    checked = inspect(rows),
    bad = checked.filter((r) => !r.valid),
    groups = ["Tous", ...new Set(rows.map((r) => r.groupe))],
    visible = checked.filter(
      (r) =>
        (group === "Tous" || r.groupe === group) &&
        (!issuesOnly || !r.valid) &&
        `${r.fichier} ${r.reference}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ),
    current = checked[selected],
    update = (k, v) => {
      setRows((x) => x.map((r, i) => (i === selected ? { ...r, [k]: v } : r)));
      setMessage("");
    };
  async function importFile(f) {
    if (!f) return;
    if (f.size > 2_000_000) {
      setImportError("Fichier trop volumineux. Maximum 2 Mo.");
      return;
    }
    try {
      const next = readCsv(await f.text());
      setRows(next);
      setSelected(0);
      setGroup("Tous");
      setQuery("");
      setIssuesOnly(false);
      setImportError("");
      setMessage(`${next.length} documents chargés localement.`);
    } catch (error) {
      setImportError(error.message);
    }
    if (file.current) file.current.value = "";
  }
  return (
    <div className="concept-et-plan">
      <DemoNotice company="Concept et Plan" />
      <header className="cep-header">
        <strong>
          Concept <em>et</em> Plan<span>PLANS AU SERVICE DE VOS PROJETS</span>
        </strong>
        <button
          onClick={() => {
            setRows(structuredClone(initial));
            setSelected(2);
            setGroup("Tous");
            setQuery("");
            setIssuesOnly(false);
            setImportError("");
            setMessage("Lot exemple rétabli.");
          }}
        >
          Restaurer le lot exemple
        </button>
      </header>
      <main className="cep-main">
        <nav className="cep-groups" aria-label="Groupes de plans">
          <h2>Groupes de documents</h2>
          {groups.map((g) => (
            <button
              key={g}
              aria-pressed={group === g}
              onClick={() => setGroup(g)}
            >
              <span>{g === "Tous" ? "Tous les documents" : g}</span>
              <b>
                {g === "Tous"
                  ? rows.length
                  : rows.filter((x) => x.groupe === g).length}
              </b>
            </button>
          ))}
          <div className="cep-count">
            <strong>
              {checked.length - bad.length}
              <span> / {rows.length}</span>
            </strong>
            <p>documents avec un index complet et sans doublon</p>
          </div>
          <p className="cep-help">
            L’index est contrôlé. Les PDF ne sont ni lus ni modifiés dans cette
            démonstration.
          </p>
        </nav>
        <section className="cep-work">
          <h1>Un lot prêt à archiver.</h1>
          <p>
            La bonne référence, la bonne révision. Avant de ranger les plans.
          </p>
          <div
            className="cep-import"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              importFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={file}
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={(e) => importFile(e.target.files[0])}
            />
            <button onClick={() => file.current?.click()}>
              <span aria-hidden="true">↥</span>
              <strong>Importer un manifeste CSV</strong>
              <small>
                ou déposer le fichier ici · 2 Mo · 500 documents maximum
              </small>
            </button>
            <button
              className="cep-sample"
              onClick={() =>
                downloadCsv(
                  "concept-plan-modele.csv",
                  headers,
                  initial.map((r) => headers.map((h) => r[h])),
                )
              }
            >
              Télécharger le modèle
            </button>
          </div>
          {importError && (
            <p className="cep-error" role="alert">
              {importError}
            </p>
          )}
          <div className="cep-filters">
            <input
              aria-label="Rechercher un document"
              placeholder="Rechercher un fichier ou une référence…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={issuesOnly}
                onChange={(e) => setIssuesOnly(e.target.checked)}
              />
              Écarts seulement
            </label>
          </div>
          <div className="cep-table">
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Référence</th>
                  <th>Rév.</th>
                  <th>Date du plan</th>
                  <th>Index</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => (
                  <tr
                    key={r.index}
                    className={selected === r.index ? "selected" : ""}
                  >
                    <th>
                      <button onClick={() => setSelected(r.index)}>
                        {r.fichier || "Fichier sans nom"}
                        <small>
                          {r.groupe} · {r.pages} page(s)
                        </small>
                      </button>
                    </th>
                    <td>{r.reference || "—"}</td>
                    <td>{r.revision || "—"}</td>
                    <td>{r.date || "—"}</td>
                    <td>
                      <span className={r.valid ? "cep-ok" : "cep-bad"}>
                        {r.valid
                          ? "✓ Complet"
                          : `${r.errors.length} écart${r.errors.length > 1 ? "s" : ""}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && <p>Aucun document ne correspond au filtre.</p>}
          </div>
          <div className="cep-legend">
            <span>{visible.length} document(s) affiché(s)</span>
            <span>Doublon = même référence + même révision</span>
          </div>
          <p className="cep-message" role="status">
            {message}
          </p>
        </section>
        <aside className="cep-inspector">
          <h2>Inspecteur d’index</h2>
          {current && (
            <>
              <p className="cep-current">{current.fichier}</p>
              {[
                ["fichier", "Nom de fichier", "text"],
                ["reference", "Référence du document", "text"],
                ["revision", "Révision", "text"],
                ["date", "Date du plan", "date"],
                ["pages", "Nombre de pages", "number"],
                ["groupe", "Groupe", "text"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    min={type === "number" ? 1 : undefined}
                    value={current[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              ))}
              <div
                className={
                  current.valid ? "cep-valid-panel" : "cep-errors-panel"
                }
                role="status"
              >
                {current.valid
                  ? "✓ L’index de ce document est complet."
                  : current.errors.map((e) => <p key={e}>{e}</p>)}
              </div>
              <button
                className="cep-remove"
                disabled={rows.length <= 1}
                onClick={() => {
                  setRows((x) => x.filter((_, i) => i !== selected));
                  setSelected(0);
                  setMessage(
                    "Ligne retirée du lot local. Aucun fichier supprimé.",
                  );
                }}
              >
                Retirer cette ligne du lot
              </button>
            </>
          )}
          <div className="cep-export">
            <strong>
              {bad.length
                ? `${bad.length} document(s) à reprendre`
                : "Le lot est prêt"}
            </strong>
            <p>
              L’export du lot complet est disponible lorsque tous les index sont
              valides.
            </p>
            <button
              disabled={!!bad.length || !rows.length}
              onClick={() => {
                downloadCsv(
                  "concept-plan-index-verifie.csv",
                  headers,
                  rows.map((r) => headers.map((h) => r[h])),
                );
                setMessage("Index du lot complet téléchargé.");
              }}
            >
              Exporter l’index vérifié
            </button>
          </div>
        </aside>
      </main>
      <DemoFooter />
    </div>
  );
}
