import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { initial, workshops, colors, schedule, removeNode } from "./model.js";
import "./styles.css";
const hours = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n / 100);
const color = (n) => colors[workshops.indexOf(n.workshop)] || "#ddd";
export default function App() {
  useDocumentTitle("Imprimerie du Marais · Une gamme, ses passages");
  const [nodes, setNodes] = useState(structuredClone(initial));
  const [selected, setSelected] = useState("P2");
  const [serial, setSerial] = useState(5);
  const [message, setMessage] = useState("");
  const [version, setVersion] = useState(1);
  const r = schedule(nodes);
  const node = nodes.find((n) => n.id === selected) || nodes[0];
  function change(next) {
    setNodes(next);
    setVersion((v) => v + 1);
    setMessage("Gamme modifiée. La séquence reste à valider par l’atelier.");
  }
  function edit(key, value) {
    change(nodes.map((n) => (n.id === node.id ? { ...n, [key]: value } : n)));
  }
  function add() {
    if (nodes.length >= 8) return;
    const id = `P${serial}`;
    change([
      ...nodes,
      {
        id,
        workshop: "Prototypage",
        label: "Nouveau passage",
        hours: "1",
        deps: [],
      },
    ]);
    setSerial((n) => n + 1);
    setSelected(id);
  }
  function exportRoute() {
    downloadCsv(
      "imprimerie-marais-gamme-exemple.csv",
      [
        "Version",
        "Ordre compatible",
        "Repère",
        "Atelier",
        "Opération",
        "Prédécesseurs",
        "Durée fictive h",
        "Début théorique h",
        "Fin théorique h",
        "Chemin le plus long",
      ],
      r.order.map((id, i) => {
        const n = nodes.find((n) => n.id === id),
          t = r.times[id];
        return [
          version,
          i + 1,
          id,
          n.workshop,
          n.label,
          n.deps.join(" + "),
          n.hours,
          hours(t.start),
          hours(t.finish),
          t.critical ? "Oui" : "Non",
        ];
      }),
    );
    setMessage(
      "Gamme CSV téléchargée. Les durées restent celles de l’exemple.",
    );
  }
  return (
    <div className="imprimerie-du-marais-app">
      <DemoNotice company="Imprimerie du Marais" />
      <header className="imprimerie-du-marais-header">
        <b>
          Imprimerie <br />
          du Marais
        </b>
        <span>ÉTUDES DE FABRICATION</span>
        <button
          onClick={() => {
            setNodes(structuredClone(initial));
            setSelected("P2");
            setVersion(1);
            setSerial(5);
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="imprimerie-du-marais-heading">
          <div>
            <p>COFFRET TÉMOIN / GAMME {String(version).padStart(2, "0")}</p>
            <h1>
              Une gamme, <br />
              <em>ses passages.</em>
            </h1>
          </div>
          <p>
            Relier les ateliers. <br />
            Voir ce qui dépend de quoi. <br />
            Garder la décision technique humaine.
          </p>
        </div>
        <section
          className="imprimerie-du-marais-sequence"
          aria-label="Passages de la gamme"
        >
          {nodes.map((n, i) => (
            <button
              key={n.id}
              className={node.id === n.id ? "selected" : ""}
              aria-pressed={node.id === n.id}
              onClick={() => setSelected(n.id)}
            >
              <span style={{ background: color(n) }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <b>{n.workshop}</b>
              <small>
                {n.id} · {n.hours.replace(".", ",")} h d’exemple
              </small>
            </button>
          ))}
          <button
            className="imprimerie-du-marais-add"
            disabled={nodes.length >= 8}
            onClick={add}
          >
            <span>+</span>
            <b>Ajouter un passage</b>
            <small>8 passages maximum</small>
          </button>
        </section>
        <div className="imprimerie-du-marais-work">
          <section className="imprimerie-du-marais-timeline">
            <div className="imprimerie-du-marais-section-top">
              <h2>La lecture des dépendances</h2>
              <span>
                {r.valid
                  ? `${hours(r.total)} h théoriques`
                  : "Gamme à corriger"}
              </span>
            </div>
            {r.valid ? (
              <>
                <div className="imprimerie-du-marais-axis">
                  <span>0 h</span>
                  <span>{hours(r.total / 2)} h</span>
                  <span>{hours(r.total)} h</span>
                </div>
                <div className="imprimerie-du-marais-bars">
                  {r.order.map((id) => {
                    const n = nodes.find((n) => n.id === id),
                      t = r.times[id];
                    return (
                      <button
                        key={id}
                        onClick={() => setSelected(id)}
                        aria-label={`Sélectionner ${id}, ${n.workshop}, de ${hours(t.start)} à ${hours(t.finish)} heures`}
                      >
                        <span className="imprimerie-du-marais-bar-label">
                          <b>{id}</b>
                          {n.workshop}
                          <small>
                            {n.deps.length
                              ? `Après ${n.deps.join(" + ")}`
                              : "Sans prédécesseur"}
                          </small>
                        </span>
                        <span className="imprimerie-du-marais-track">
                          <i
                            style={{
                              left: `${(t.start / r.total) * 100}%`,
                              width: `${(t.duration / r.total) * 100}%`,
                              background: color(n),
                              borderBottom: t.critical ? "3px solid #000" : "0",
                            }}
                          />
                          <em>{hours(t.duration)} h</em>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="imprimerie-du-marais-legend">
                  <b />
                  Souligné noir : passage sur un chemin de durée maximale.
                </p>
                {r.isolated.length > 0 && nodes.length > 1 && (
                  <p className="imprimerie-du-marais-warning">
                    Passage sans lien avec les autres : {r.isolated.join(", ")}.
                    Vérifiez si cette indépendance est intentionnelle.
                  </p>
                )}
              </>
            ) : (
              <div className="imprimerie-du-marais-blocked" role="alert">
                <span>↔</span>
                <h3>Une dépendance bloque la lecture.</h3>
                {r.errors.map((e) => (
                  <p key={e}>{e}</p>
                ))}
                <p>Retirez le lien contradictoire dans le passage concerné.</p>
              </div>
            )}
            <div className="imprimerie-du-marais-explanation">
              <h3>Une durée théorique pour cette gamme.</h3>
              <p>
                Le calcul additionne les durées fictives selon les dépendances.
                Il suppose des ressources disponibles, sans temps d’attente,
                séchage ni capacité machine. Les liens et opérations sont à
                confirmer avec les artisans.
              </p>
            </div>
          </section>
          <aside className="imprimerie-du-marais-editor">
            <div className="imprimerie-du-marais-selected">
              <b style={{ background: color(node) }}>{node.id}</b>
              <h2>Éditer ce passage</h2>
            </div>
            <label>
              Atelier
              <select
                value={node.workshop}
                onChange={(e) => edit("workshop", e.target.value)}
              >
                {workshops.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </label>
            <label>
              Opération
              <input
                value={node.label}
                maxLength="85"
                onChange={(e) => edit("label", e.target.value)}
              />
            </label>
            <label>
              Durée fictive en heures
              <input
                inputMode="decimal"
                value={node.hours}
                onChange={(e) => edit("hours", e.target.value)}
              />
            </label>
            <fieldset>
              <legend>Ne peut commencer qu’après</legend>
              {nodes
                .filter((n) => n.id !== node.id)
                .map((n) => (
                  <label key={n.id}>
                    <input
                      type="checkbox"
                      checked={node.deps.includes(n.id)}
                      onChange={(e) =>
                        edit(
                          "deps",
                          e.target.checked
                            ? [...node.deps, n.id]
                            : node.deps.filter((d) => d !== n.id),
                        )
                      }
                    />
                    <span>
                      <b>{n.id}</b> {n.workshop}
                    </span>
                  </label>
                ))}
            </fieldset>
            <button
              className="imprimerie-du-marais-remove"
              disabled={nodes.length === 1}
              onClick={() => {
                const next = removeNode(nodes, node.id);
                change(next);
                setSelected(next[0].id);
                setMessage(
                  "Passage retiré et références associées supprimées. Vérifiez la nouvelle gamme.",
                );
              }}
            >
              Retirer ce passage
            </button>
          </aside>
        </div>
        <div className="imprimerie-du-marais-bottom">
          <div>
            <span>VERSION {String(version).padStart(2, "0")}</span>
            <h2>
              {r.valid
                ? "Les passages peuvent être ordonnés."
                : "Revoir les dépendances."}
            </h2>
          </div>
          <button disabled={!r.valid} onClick={exportRoute}>
            Exporter la gamme CSV ↗
          </button>
        </div>
        <p role="status" className="imprimerie-du-marais-status">
          {message ||
            "Essayez d’imposer le façonnage avant la photogravure pour voir une boucle apparaître."}
        </p>
      </main>
      <DemoFooter>
        Prototype indépendant, sans connexion à la production. Atelier, durée et
        dépendances sont des paramètres d’étude ; l’ordre proposé ne constitue
        pas une validation technique de fabrication.
      </DemoFooter>
    </div>
  );
}
