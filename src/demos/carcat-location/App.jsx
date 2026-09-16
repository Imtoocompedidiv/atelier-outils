import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { seed, reconcile } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Carcat · Retour de réception");
  const [rows, setRows] = useState(seed.map((x) => ({ ...x }))),
    [note, setNote] = useState(
      "Un carton d’assiettes reste à vérifier avec le lieu de réception.",
    ),
    [message, setMessage] = useState("");
  const result = reconcile(rows),
    invalid = result.some((x) => !x.valid),
    sum = (key) => result.reduce((a, x) => a + (x[key] || 0), 0);
  const change = (id, key, value) => {
    setRows((xs) => xs.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
    setMessage("");
  };
  return (
    <div className="carcat-location">
      <DemoNotice company="Carcat Location" />
      <header className="cc-header">
        <strong>
          Carcat <span>Location</span>
        </strong>
        <button
          onClick={() => {
            setRows(seed.map((x) => ({ ...x })));
            setNote(
              "Un carton d’assiettes reste à vérifier avec le lieu de réception.",
            );
            setMessage("Exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="cc-main">
        <section>
          <h1>Retour de réception</h1>
          <p className="cc-lead">
            Ce qui revient, ce qui manque et ce qui repart au lavage.
          </p>
          <div className="cc-overflow">
            <table className="cc-grid">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Sorti</th>
                  <th>Revenu intact</th>
                  <th>Cassé</th>
                  <th>Manquant</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.id} className={!r.valid ? "cc-invalid" : ""}>
                    <th scope="row">{r.name}</th>
                    {["out", "back", "broken"].map((key) => (
                      <td key={key}>
                        <input
                          aria-label={`${r.name} ${key === "out" ? "sorti" : key === "back" ? "revenu intact" : "cassé"}`}
                          type="number"
                          min="0"
                          max="10000"
                          step="1"
                          value={Number.isNaN(r[key]) ? "" : r[key]}
                          onChange={(e) =>
                            change(
                              r.id,
                              key,
                              e.target.value === ""
                                ? NaN
                                : Number(e.target.value),
                            )
                          }
                        />
                      </td>
                    ))}
                    <td>
                      {r.valid ? (
                        <strong className={r.missing ? "cc-missing" : ""}>
                          {r.missing}
                        </strong>
                      ) : (
                        "Incohérent"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalid && (
            <p className="cc-error" role="alert">
              Les quantités doivent être entières. Le retour intact et la casse
              ne peuvent pas dépasser la sortie.
            </p>
          )}
          <div className="cc-return-strip">
            <div>
              <h2>Un article retrouvé ?</h2>
              <p>
                Ajoutez-le au retour intact. Le constat et le montant indicatif
                suivent.
              </p>
            </div>
            <button
              disabled={invalid || !result[0].missing}
              onClick={() => {
                change(1, "back", rows[0].back + 1);
                setMessage(
                  "Une assiette réintégrée. L’ajustement indicatif est recalculé.",
                );
              }}
            >
              Retrouver une assiette
            </button>
          </div>
          <section className="cc-wash">
            <h2>Le passage au lavage</h2>
            <p>
              Tous les articles revenus passent par le contrôle de l’équipe
              avant d’être disponibles.
            </p>
            <div className="cc-wash-list">
              {result.map((r) => (
                <label key={r.id}>
                  <input
                    type="checkbox"
                    checked={r.washed}
                    disabled={!r.valid}
                    onChange={(e) => change(r.id, "washed", e.target.checked)}
                  />
                  <span>
                    {r.name}
                    <small>{r.valid ? r.back : "—"} à contrôler</small>
                  </span>
                  <strong>{r.washed ? "Prêt" : "À laver"}</strong>
                </label>
              ))}
            </div>
          </section>
          <label className="cc-note">
            Observation du retour
            <textarea
              maxLength="1000"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </section>
        <aside className="cc-ticket">
          <p>Location fictive</p>
          <h2>CC-2609</h2>
          <dl>
            <div>
              <dt>Événement</dt>
              <dd>Dîner des Tilleuls</dd>
            </div>
            <div>
              <dt>Retour</dt>
              <dd>28 septembre 2026</dd>
            </div>
            <div>
              <dt>Pièces sorties</dt>
              <dd>{sum("out")}</dd>
            </div>
            <div>
              <dt>Intactes au retour</dt>
              <dd>{sum("back")}</dd>
            </div>
            <div>
              <dt>Manquantes</dt>
              <dd>{invalid ? "À vérifier" : sum("missing")}</dd>
            </div>
          </dl>
          <h3>Ajustement indicatif</h3>
          <p className="cc-small">
            Barème entièrement fictif. Le constat ne constitue ni une facture ni
            un avoir.
          </p>
          {result
            .filter((r) => r.adjustment)
            .map((r) => (
              <div className="cc-fee" key={r.id}>
                <span>
                  {r.name}
                  <small>
                    {r.missing} manquant(s), {r.broken} cassé(s)
                  </small>
                </span>
                <b>{euro(r.adjustment)}</b>
              </div>
            ))}
          <div className="cc-total">
            <span>Total exemple</span>
            <strong>{invalid ? "—" : euro(sum("adjustment"))}</strong>
          </div>
          <button
            className="cc-export"
            disabled={invalid}
            onClick={() => {
              downloadCsv(
                "carcat-constat-retour.csv",
                [
                  "Article",
                  "Sorti",
                  "Intact",
                  "Cassé",
                  "Manquant",
                  "Statut nettoyage",
                  "Ajustement exemple EUR",
                  "Note",
                ],
                result.map((r) => [
                  r.name,
                  r.out,
                  r.back,
                  r.broken,
                  r.missing,
                  r.washed ? "Contrôlé" : "À laver",
                  (r.adjustment / 100).toFixed(2),
                  note,
                ]),
              );
              setMessage(
                "Constat téléchargé avec les quantités et la note de retour.",
              );
            }}
          >
            Exporter le constat
          </button>
          <p role="status">{message}</p>
        </aside>
      </main>
      <DemoFooter />
    </div>
  );
}
