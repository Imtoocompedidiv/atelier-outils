import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { components, differences, validComponent } from "./model.js";
import "./styles.css";
function Drawing({ item, alternate }) {
  const fill =
    item.finish === "Noir mat"
      ? "#292929"
      : item.finish === "Ivoire satiné"
        ? "#ddd9cf"
        : "#a0a0a0";
  const w = Math.max(60, Math.min(250, Number(item.width) / 10)),
    h = Math.max(40, Math.min(160, Number(item.height) / 10));
  return (
    <svg
      viewBox="0 0 340 220"
      role="img"
      aria-label={`Schéma ${item.name}, ${item.width} par ${item.height} millimètres`}
    >
      <defs>
        <linearGradient id={`ae${alternate}`}>
          <stop stopColor={fill} />
          <stop
            offset="1"
            stopColor={item.finish === "Noir mat" ? "#070707" : "#b0aca3"}
          />
        </linearGradient>
      </defs>
      <ellipse cx="170" cy="185" rx="125" ry="10" fill="#000" opacity=".06" />
      {item.kind === "socle" ? (
        <g>
          <path
            d={`M ${170 - w / 2} ${165 - h} a ${w / 2} 18 0 0 1 ${w} 0 v ${h} a ${w / 2} 18 0 0 1 -${w} 0 Z`}
            fill={`url(#ae${alternate})`}
          />
          <ellipse cx="170" cy={165 - h} rx={w / 2} ry="18" fill={fill} />
          <path
            d={`M ${170 - w / 2 + 6} ${166 - h} v ${h - 4}`}
            stroke="#fff"
            opacity=".2"
          />
        </g>
      ) : item.kind === "arche" ? (
        <path
          d="M90 185 V90 A80 80 0 0 1 250 90 V185 H226 V90 A56 56 0 0 0 114 90 V185 Z"
          fill={fill}
        />
      ) : (
        <text
          x="170"
          y="170"
          textAnchor="middle"
          fontFamily="Georgia"
          fontSize="180"
          fill={fill}
        >
          A
        </text>
      )}
      <line x1="45" y1="205" x2="295" y2="205" stroke="#999" strokeWidth=".5" />
      <text x="170" y="218" textAnchor="middle" fill="#777" fontSize="9">
        SCHÉMA D’INTENTION · SANS ÉCHELLE D’EXÉCUTION
      </text>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Atelier Expérience · Note de modification");
  const [selected, setSelected] = useState(0);
  const [proposals, setProposals] = useState(
    components.map((c, i) =>
      i === 0
        ? { ...c, width: 1400, height: 650, finish: "Ivoire satiné" }
        : { ...c },
    ),
  );
  const [checks, setChecks] = useState({ plan: false, owner: false });
  const [owner, setOwner] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const before = components[selected],
    after = proposals[selected],
    diff = differences(before, after),
    valid = validComponent(after);
  function edit(k, v) {
    setProposals((p) =>
      p.map((x, i) => (i === selected ? { ...x, [k]: v } : x)),
    );
    setChecks({ plan: false, owner: false });
    setMessage("Révision modifiée. Les validations sont à reprendre.");
  }
  function reset() {
    setProposals(
      components.map((c, i) =>
        i === 0
          ? { ...c, width: 1400, height: 650, finish: "Ivoire satiné" }
          : { ...c },
      ),
    );
    setChecks({ plan: false, owner: false });
    setOwner("");
    setNote("");
    setMessage("Exemple repris.");
  }
  const ready =
    valid &&
    diff.changes.length > 0 &&
    checks.plan &&
    checks.owner &&
    owner.trim();
  const exportNote = () => {
    downloadText(
      `modification-${before.id}.txt`,
      `NOTE DE MODIFICATION · ${before.id}\nPrototype indépendant pour Atelier Expérience. Données fictives.\n\n${before.name}\n${diff.changes.map((c) => `${c.label} : ${c.before} → ${c.after}`).join("\n")}\n\nMÉTIERS À CONSULTER\n${diff.impacts.map((x) => `${x.name} : ${x.reason}`).join("\n")}\n\nResponsable déclaré : ${owner}\nPlan mis à jour : contrôle déclaré, aucun fichier joint dans cette démo.\nNotes : ${note || "Aucune"}\n\nCette note prépare la revue. Elle ne constitue pas une autorisation de fabrication.`,
    );
    setMessage("Note de modification téléchargée.");
  };
  return (
    <div className="atelier-experience-app">
      <DemoNotice company="Atelier Expérience" />
      <header className="atelier-experience-header">
        <b>
          ATELIER <br />
          EXPÉRIENCE
        </b>
        <span>
          DÉCORS SUR MESURE <br />
          BRY-SUR-MARNE
        </span>
        <button onClick={reset}>Reprendre l’exemple ↺</button>
      </header>
      <div className="atelier-experience-layout">
        <aside>
          <span>COMPOSANTS DU DÉCOR</span>
          {components.map((c, i) => (
            <button
              key={c.id}
              className={i === selected ? "active" : ""}
              onClick={() => {
                setSelected(i);
                setChecks({ plan: false, owner: false });
                setMessage("Composant sélectionné.");
              }}
            >
              <i>{c.kind === "socle" ? "◯" : c.kind === "arche" ? "∩" : "A"}</i>
              {c.name}
              <small>{c.id}</small>
            </button>
          ))}
          <p>
            Un même décor. <br />
            Plusieurs métiers. <br />
            Une version partagée.
          </p>
        </aside>
        <main>
          <span className="atelier-experience-eyebrow">
            UNE RÉVISION À RELIRE
          </span>
          <h1>
            Ce qui change <br />
            en atelier.
          </h1>
          <div className="atelier-experience-work">
            <div className="atelier-experience-comparison">
              {[
                [before, "Version approuvée", "0"],
                [after, "Nouvelle proposition", "1"],
              ].map(([item, title, id]) => (
                <section key={id}>
                  <h2>{title}</h2>
                  <span className="atelier-experience-eyebrow">
                    {before.id} ·{" "}
                    {id === "0" ? "RÉFÉRENCE" : "ÉTUDE DE RÉVISION"}
                  </span>
                  <Drawing item={item} alternate={id} />
                  <dl>
                    {[
                      ["width", "Largeur", "mm"],
                      ["height", "Hauteur", "mm"],
                      ["finish", "Finition", ""],
                      ["quantity", "Quantité", ""],
                    ].map(([key, label, unit]) => (
                      <div
                        key={key}
                        className={
                          id === "1" &&
                          String(before[key]) !== String(after[key])
                            ? "changed"
                            : ""
                        }
                      >
                        <dt>{label}</dt>
                        <dd>
                          {item[key]} {unit}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            <section className="atelier-experience-editor">
              <h3>MODIFIER LA PROPOSITION</h3>
              {[
                ["width", "Largeur (mm)"],
                ["height", "Hauteur (mm)"],
                ["quantity", "Quantité"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    type="number"
                    min="1"
                    max={k === "quantity" ? 1000 : 10000}
                    value={after[k]}
                    onChange={(e) => edit(k, e.target.value)}
                  />
                </label>
              ))}
              <label>
                Finition
                <select
                  value={after.finish}
                  onChange={(e) => edit("finish", e.target.value)}
                >
                  <option>Noir mat</option>
                  <option>Ivoire satiné</option>
                  <option>Gris métallisé</option>
                </select>
              </label>
              <label>
                Notes complémentaires
                <textarea
                  value={note}
                  maxLength={500}
                  rows="4"
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <small>
                Chaque modification invalide les contrôles précédents.
              </small>
            </section>
          </div>
          <section className="atelier-experience-bottom">
            <div>
              <h3>MÉTIERS À CONSULTER</h3>
              {valid ? (
                <div className="atelier-experience-impacts">
                  {diff.impacts.map((x, i) => (
                    <div key={x.name}>
                      <b>{String(i + 1).padStart(2, "0")}</b>
                      <strong>{x.name}</strong>
                      <small>{x.reason}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p role="alert">
                  Renseignez des cotes positives ≤ 10 000 mm et une quantité
                  entière ≤ 1 000.
                </p>
              )}
              {valid && !diff.changes.length && (
                <p>Aucune différence avec la version approuvée.</p>
              )}
            </div>
            <div className="atelier-experience-approval">
              <h3>AVANT TRANSMISSION</h3>
              <label>
                Responsable de la revue
                <input
                  value={owner}
                  onChange={(e) => {
                    setOwner(e.target.value);
                    setChecks((c) => ({ ...c, owner: false }));
                  }}
                  placeholder="Prénom ou fonction"
                  maxLength={60}
                />
              </label>
              <label className="atelier-experience-check">
                <input
                  type="checkbox"
                  checked={checks.owner}
                  onChange={(e) =>
                    setChecks((c) => ({ ...c, owner: e.target.checked }))
                  }
                />
                Responsable désigné
              </label>
              <label className="atelier-experience-check">
                <input
                  type="checkbox"
                  checked={checks.plan}
                  onChange={(e) =>
                    setChecks((c) => ({ ...c, plan: e.target.checked }))
                  }
                />
                Plan mis à jour vérifié (déclaration)
              </label>
              <button disabled={!ready} onClick={exportNote}>
                Exporter la note de modification ↗
              </button>
            </div>
          </section>
          <p className="atelier-experience-status" role="status">
            {message ||
              "Choisissez un composant, modifiez une cote puis préparez la revue."}
          </p>
        </main>
      </div>
      <DemoFooter>
        Règles d’impact illustratives, à adapter avec le chef de projet. La note
        ne vaut pas autorisation de fabrication.
      </DemoFooter>
    </div>
  );
}
