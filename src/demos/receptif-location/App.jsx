import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { events, prepare } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Réceptif · Retours & préparation");
  const [data, setData] = useState(structuredClone(events)),
    [active, setActive] = useState(events[0].id),
    [message, setMessage] = useState("");
  const event = data.find((x) => x.id === active),
    p = prepare(event),
    update = (id, k, v) => {
      setData((all) =>
        all.map((e) =>
          e.id === active
            ? {
                ...e,
                checked: false,
                rows: e.rows.map((r) => (r.id === id ? { ...r, [k]: v } : r)),
              }
            : e,
        ),
      );
      setMessage("");
    };
  return (
    <div className="receptif-location">
      <DemoNotice company="Réceptif Location" />
      <header className="rec-head">
        <strong>
          réceptif<span>LOCATION</span>
        </strong>
        <span>Le retour mérite autant de soin que le départ.</span>
        <button
          onClick={() => {
            setData(structuredClone(events));
            setActive(events[0].id);
            setMessage("Exemple rétabli.");
          }}
        >
          Réinitialiser
        </button>
      </header>
      <main className="rec-main">
        <div className="rec-intro">
          <small>APRÈS L’ÉVÉNEMENT</small>
          <h1>
            Tout est revenu. <br />
            <em>On fait le point ?</em>
          </h1>
          <p>
            Une préparation lisible entre le comptage du retour et l’édition de
            la facture.
          </p>
        </div>
        <div className="rec-work">
          <nav className="rec-events" aria-label="Événements exemples">
            <h2>
              Retours du moment <span>03</span>
            </h2>
            {data.map((e) => {
              const ready = prepare(e).ready;
              return (
                <button
                  key={e.id}
                  aria-pressed={e.id === active}
                  onClick={() => {
                    setActive(e.id);
                    setMessage("");
                  }}
                >
                  <small>
                    {e.id} · {e.day.split("-").reverse().join(".")}
                  </small>
                  <strong>{e.name}</strong>
                  <span>
                    {ready ? "✓ Préparation complète" : "À rapprocher"}
                  </span>
                </button>
              );
            })}
            <p>
              Trois événements fictifs. <br />
              Les modifications restent dans cette page.
            </p>
          </nav>
          <section className="rec-detail">
            <header>
              <div>
                <small>
                  {event.id} / {event.client}
                </small>
                <h2>{event.name}</h2>
              </div>
              <span className="rec-pill">
                Retour du {event.day.split("-").reverse().join("/")}
              </span>
            </header>
            <div className="rec-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Départ</th>
                    <th>Intacts</th>
                    <th>Cassés</th>
                    <th>Absents</th>
                    <th>Écart estimé</th>
                  </tr>
                </thead>
                <tbody>
                  {p.rows.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr>
                        <th>{r.name}</th>
                        <td>{r.out}</td>
                        <td>
                          <input
                            aria-label={`Intacts ${r.name}`}
                            type="number"
                            min="0"
                            max={r.out}
                            value={r.back}
                            onChange={(e) =>
                              update(r.id, "back", Number(e.target.value))
                            }
                          />
                        </td>
                        <td>
                          <input
                            aria-label={`Cassés ${r.name}`}
                            type="number"
                            min="0"
                            max={r.out}
                            value={r.broken}
                            onChange={(e) =>
                              update(r.id, "broken", Number(e.target.value))
                            }
                          />
                        </td>
                        <td className={r.missing ? "rec-alert" : ""}>
                          {r.valid ? r.missing : "—"}
                        </td>
                        <td>{r.valid ? euro(r.addition) : "—"}</td>
                      </tr>
                      {!r.valid ? (
                        <tr className="rec-note">
                          <td colSpan="6" role="alert">
                            Le retour intact et la casse ne peuvent dépasser le
                            départ. Quantités entières requises.
                          </td>
                        </tr>
                      ) : (
                        r.incident && (
                          <tr className="rec-note">
                            <td colSpan="6">
                              <label>
                                Constat pour {r.name.toLowerCase()}
                                <input
                                  value={r.note}
                                  placeholder="Ex. Un verre cassé au déchargement, un verre non retrouvé."
                                  onChange={(e) =>
                                    update(r.id, "note", e.target.value)
                                  }
                                />
                              </label>
                              {r.needsNote && (
                                <span>
                                  Ajoutez le constat avant de préparer la
                                  facture.
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rec-bottom">
              <section className="rec-check">
                <h3>Le dossier passe à la suite</h3>
                <label>
                  <input
                    type="checkbox"
                    checked={event.checked}
                    onChange={(e) => {
                      setData((all) =>
                        all.map((x) =>
                          x.id === active
                            ? { ...x, checked: e.target.checked }
                            : x,
                        ),
                      );
                      setMessage("");
                    }}
                  />
                  Comptage du retour revu
                </label>
                <p>
                  Une modification de quantité remet cette confirmation à zéro.
                </p>
                <div
                  className={p.ready ? "rec-status ready" : "rec-status"}
                  role="status"
                >
                  {!p.valid
                    ? "Quantités à corriger"
                    : p.unexplained
                      ? `${p.unexplained} constat${p.unexplained > 1 ? "s" : ""} à compléter`
                      : !event.checked
                        ? "Dernière étape : confirmer le comptage."
                        : "La préparation est complète."}
                </div>
                <p className="rec-limit">
                  Montants d’exemple, hors taxes. Aucune facture n’est créée.
                  Les conditions commerciales réelles restent à appliquer.
                </p>
              </section>
              <aside className="rec-totals">
                <div>
                  <span>Location prévue</span>
                  <strong>{euro(event.base)}</strong>
                </div>
                <div>
                  <span>Écarts documentés*</span>
                  <strong>{p.valid ? euro(p.extra) : "—"}</strong>
                </div>
                <div className="rec-total">
                  <span>Total indicatif</span>
                  <strong>{p.valid ? euro(p.total) : "—"}</strong>
                </div>
                <small>* Base d’exemple, à confirmer avec le client.</small>
                <button
                  disabled={!p.ready}
                  onClick={() => {
                    downloadCsv(
                      `receptif-${event.id}-preparation.csv`,
                      [
                        "Dossier",
                        "Article",
                        "Départ",
                        "Intacts",
                        "Cassés",
                        "Absents",
                        "Écart HT indicatif EUR",
                        "Constat",
                      ],
                      [
                        ...p.rows.map((r) => [
                          event.id,
                          r.name,
                          r.out,
                          r.back,
                          r.broken,
                          r.missing,
                          (r.addition / 100).toFixed(2),
                          r.note,
                        ]),
                        [
                          event.id,
                          "Location prévue",
                          "",
                          "",
                          "",
                          "",
                          (event.base / 100).toFixed(2),
                          "Montant fictif",
                        ],
                        [
                          event.id,
                          "TOTAL INDICATIF",
                          "",
                          "",
                          "",
                          "",
                          (p.total / 100).toFixed(2),
                          "Préparation, aucune facture émise",
                        ],
                      ],
                    );
                    setMessage(
                      "Préparation téléchargée. Aucun envoi ni facture émise.",
                    );
                  }}
                >
                  Exporter la préparation ↗
                </button>
              </aside>
            </div>
            <p className="rec-feedback" role="status">
              {message}
            </p>
          </section>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
