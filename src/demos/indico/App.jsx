import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { initial, compare } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("INDICO · Revue des offres");
  const [rows, setRows] = useState(structuredClone(initial)),
    [notes, setNotes] = useState({}),
    [message, setMessage] = useState("");
  const result = compare(rows);
  const update = (id, i, key, value) => {
    setRows((xs) =>
      xs.map((r) =>
        r.id === id
          ? {
              ...r,
              offers: r.offers.map((o, j) =>
                j === i ? { ...o, [key]: value } : o,
              ),
            }
          : r,
      ),
    );
    setMessage("");
  };
  return (
    <div className="indico">
      <DemoNotice company="INDICO" />
      <header className="in-header">
        <strong>
          INDIC<span>O</span>
        </strong>
        <p>Revue d’un lot menuiserie</p>
        <button
          onClick={() => {
            setRows(structuredClone(initial));
            setNotes({});
            setMessage("Exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="in-main">
        <h1>Les offres, à périmètre égal.</h1>
        <p className="in-lead">
          Trois propositions. Les mêmes postes. Des écarts à expliquer.
        </p>
        <div className="in-work">
          <section>
            <div className="in-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Poste</th>
                    <th>Base</th>
                    {["A", "B", "C"].map((x) => (
                      <th key={x}>
                        Entreprise {x}
                        <small>Prix unitaire d’exemple</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <th scope="row">
                        <small>{r.id}</small>
                        {r.name}
                      </th>
                      <td>
                        {r.qty} {r.unit}
                      </td>
                      {r.offers.map((o, i) => (
                        <td
                          key={i}
                          className={
                            o.unit !== r.unit || o.price === ""
                              ? "in-problem"
                              : ""
                          }
                        >
                          <input
                            aria-label={`${r.name} prix entreprise ${"ABC"[i]}`}
                            inputMode="decimal"
                            placeholder="Prix absent"
                            value={o.price}
                            onChange={(e) =>
                              update(r.id, i, "price", e.target.value)
                            }
                          />
                          <select
                            aria-label={`${r.name} unité entreprise ${"ABC"[i]}`}
                            value={o.unit}
                            onChange={(e) =>
                              update(r.id, i, "unit", e.target.value)
                            }
                          >
                            {["u", "m²", "ml", "ens"].map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                          {o.unit !== r.unit && (
                            <small className="in-warning">
                              Unité différente
                            </small>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="in-common-total">
                    <th>
                      Total à périmètre commun
                      <small>
                        {result.commonRows.length} / {rows.length} postes
                      </small>
                    </th>
                    <td></td>
                    {result.commonTotals.map((t, i) => (
                      <td key={i}>
                        <strong>
                          {result.commonRows.length
                            ? euro(t)
                            : "Aucun poste commun"}
                        </strong>
                        <small>Mêmes postes pour les trois offres</small>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th>Total des postes renseignés</th>
                    <td></td>
                    {result.totals.map((t, i) => (
                      <td key={i}>
                        <strong>{euro(t)}</strong>
                        <small>
                          {result.missing[i]
                            ? `${result.missing[i]} poste(s) exclu(s)`
                            : "Périmètre complet"}
                        </small>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="in-method">
              Le périmètre commun retient uniquement les postes chiffrés dans
              l’unité attendue chez les trois entreprises. Repères retenus :{" "}
              {result.commonRows.join(", ") || "aucun"}. Le second total décrit
              chaque offre avec ses exclusions propres et ne permet pas de les
              classer.
            </p>
          </section>
          <aside>
            <h2>
              Questions à clarifier <span>{result.questions.length}</span>
            </h2>
            {result.questions.length ? (
              result.questions.map((q) => (
                <article className="in-question" key={q.id}>
                  <h3>
                    {q.company}
                    <small>Repère {q.row}</small>
                  </h3>
                  <textarea
                    aria-label={`Question ${q.id}`}
                    value={notes[q.id] ?? q.message}
                    maxLength="800"
                    onChange={(e) =>
                      setNotes((x) => ({ ...x, [q.id]: e.target.value }))
                    }
                  />
                </article>
              ))
            ) : (
              <p className="in-empty">
                Chaque poste dispose maintenant d’un prix dans l’unité attendue.
                Le périmètre reste à valider par l’économiste.
              </p>
            )}
            <button
              className="in-export"
              disabled={!result.questions.length}
              onClick={() => {
                downloadCsv(
                  "indico-questions-offres.csv",
                  ["Entreprise", "Repère", "Question"],
                  result.questions.map((q) => [
                    q.company,
                    q.row,
                    notes[q.id] ?? q.message,
                  ]),
                );
                setMessage(
                  "Questions téléchargées. Aucun envoi aux entreprises.",
                );
              }}
            >
              Exporter les questions
            </button>
            <p role="status">{message}</p>
          </aside>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
