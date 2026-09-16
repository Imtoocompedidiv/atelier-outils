import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { initial, validate } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Défi Alu · Relevé menuiserie");
  const [f, setF] = useState(initial),
    [message, setMessage] = useState("");
  const p = validate(f),
    set = (k, v) => {
      setF((x) => ({ ...x, [k]: v }));
      setMessage("");
    },
    width = Math.min(5000, Math.max(300, f.width || 300)),
    height = Math.min(3500, Math.max(300, f.height || 300)),
    scale = Math.min(440 / width, 390 / height),
    w = width * scale,
    h = height * scale,
    x = (600 - w) / 2,
    y = (500 - h) / 2 + 15,
    frames = f.opening === "Deux vantaux" ? 2 : 1;
  return (
    <div className="defialu">
      <DemoNotice company="Défi Alu" />
      <header className="def-header">
        <strong>
          Défi<span>Alu</span>
        </strong>
        <p>LE RELEVÉ QUI PRÉPARE LA SUITE</p>
        <button
          onClick={() => {
            setF(initial);
            setMessage("Relevé exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="def-main">
        <div className="def-title">
          <h1>
            Du chantier <br />
            au dossier atelier.
          </h1>
          <p>
            Une menuiserie, ses cotes relevées et les points à confirmer. Sans
            perdre une information en route.
          </p>
        </div>
        <div className="def-work">
          <section className="def-drawing">
            <header>
              <div>
                <small>REPÈRE EXEMPLE</small>
                <h2>F 01 / Fenêtre séjour</h2>
              </div>
              <span>Vue intérieure</span>
            </header>
            <svg
              viewBox="0 0 600 535"
              role="img"
              aria-label={`Schéma de fenêtre ${f.opening}, relevé ${f.width} par ${f.height} millimètres`}
            >
              <defs>
                <pattern
                  id="def-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 0H0V20"
                    fill="none"
                    stroke="#eef1f5"
                    strokeWidth=".6"
                  />
                </pattern>
                <linearGradient id="def-glass" x1="0" y1="0" x2="1" y2="1">
                  <stop stopColor="#f8fbfd" />
                  <stop offset="1" stopColor="#edf3f6" />
                </linearGradient>
              </defs>
              <rect width="600" height="535" fill="url(#def-grid)" />
              <g stroke="#596270" fill="none">
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={f.ral === "9016" ? "#f3f3f2" : "#6b7177"}
                  strokeWidth="2"
                />
                {Array.from({ length: frames }, (_, i) => {
                  const left = x + 10 + (i * (w - 20)) / frames,
                    fw = (w - 20) / frames;
                  return (
                    <g key={i}>
                      <rect
                        x={left}
                        y={y + 10}
                        width={fw}
                        height={h - 20}
                        fill="#dde2e5"
                      />
                      <rect
                        x={left + 7}
                        y={y + 17}
                        width={fw - 14}
                        height={h - 34}
                        fill="url(#def-glass)"
                      />
                      {f.opening !== "Fixe" && (
                        <>
                          <path
                            d={
                              i === 1
                                ? `M${left + fw - 7} ${y + 17}L${left + 7} ${y + h / 2}L${left + fw - 7} ${y + h - 17}`
                                : `M${left + 7} ${y + 17}L${left + fw - 7} ${y + h / 2}L${left + 7} ${y + h - 17}`
                            }
                            strokeDasharray="5 4"
                            stroke="#7d93a4"
                          />
                          <rect
                            x={i === 1 ? left + 3 : left + fw - 7}
                            y={y + h / 2 - 7}
                            width="4"
                            height="22"
                            rx="1"
                            fill="#515c65"
                          />
                        </>
                      )}
                    </g>
                  );
                })}
                <path
                  d={`M${x} ${y - 26}h${w}M${x} ${y - 32}v12M${x + w} ${y - 32}v12M${x + w + 26} ${y}v${h}M${x + w + 20} ${y}h12M${x + w + 20} ${y + h}h12`}
                  stroke="#7c8690"
                />
              </g>
              <text
                x="300"
                y={y - 37}
                fontSize="16"
                textAnchor="middle"
                fill="#263341"
              >
                {f.width} mm
              </text>
              <text
                transform={`translate(${x + w + 40},${y + h / 2}) rotate(-90)`}
                fontSize="16"
                textAnchor="middle"
                fill="#263341"
              >
                {f.height} mm
              </text>
              <text
                x="300"
                y="517"
                fontSize="10"
                textAnchor="middle"
                fill="#83909b"
              >
                COTES RELEVÉES · SCHÉMA D’INTENTION · SANS DÉDUCTION DE POSE
              </text>
            </svg>
            <footer>
              <span>{f.material}</span>
              <span>{f.opening}</span>
              <span>Repère RAL {f.ral}</span>
            </footer>
            <p className="def-caption">
              Le dessin représente les proportions. Il ne calcule ni jeux, ni
              profils, ni performances et ne vaut pas plan de fabrication.
            </p>
          </section>
          <section className="def-form">
            <h2>Caractéristiques du relevé</h2>
            <div className="def-fields">
              {[
                ["width", "Largeur relevée (mm)", 5000],
                ["height", "Hauteur relevée (mm)", 3500],
              ].map(([k, l, max]) => (
                <label key={k}>
                  {l}
                  <input
                    type="number"
                    min="300"
                    max={max}
                    value={f[k]}
                    onChange={(e) => set(k, Number(e.target.value))}
                  />
                </label>
              ))}
              <label>
                Matériau
                <select
                  value={f.material}
                  onChange={(e) => set("material", e.target.value)}
                >
                  <option>Aluminium</option>
                  <option>PVC</option>
                </select>
              </label>
              <label>
                Repère couleur RAL
                <input
                  inputMode="numeric"
                  maxLength="4"
                  value={f.ral}
                  onChange={(e) => set("ral", e.target.value)}
                />
              </label>
              <label>
                Ouverture
                <select
                  value={f.opening}
                  onChange={(e) => set("opening", e.target.value)}
                >
                  <option>Deux vantaux</option>
                  <option>Un vantail</option>
                  <option>Fixe</option>
                </select>
              </label>
              <label>
                Principe de pose
                <select
                  value={f.pose}
                  onChange={(e) => set("pose", e.target.value)}
                >
                  <option>Rénovation</option>
                  <option>Dépose totale</option>
                  <option>Neuf</option>
                </select>
              </label>
            </div>
            <label>
              Vitrage envisagé
              <select
                value={f.glass}
                onChange={(e) => set("glass", e.target.value)}
              >
                <option>À déterminer après étude</option>
                <option>Double vitrage à étudier</option>
                <option>Vitrage de sécurité à étudier</option>
              </select>
            </label>
            <h3>Les trois points du relevé</h3>
            {[
              ["measured", "Cotes relevées revues"],
              ["support", "État du support examiné"],
              ["accessChecked", "Accès repéré"],
            ].map(([k, l]) => (
              <label className="def-check" key={k}>
                <input
                  type="checkbox"
                  checked={f[k]}
                  onChange={(e) => set(k, e.target.checked)}
                />
                {l}
              </label>
            ))}
            <p className="def-small">
              Une coche décrit l’avancement du relevé, pas l’autorisation de
              fabriquer.
            </p>
            <div className="def-route">
              <h3>À qui préparer le dossier ?</h3>
              <div>
                {["Atelier", "Fournisseur"].map((v) => (
                  <label key={v}>
                    <input
                      type="radio"
                      name="def-route"
                      checked={f.route === v}
                      onChange={() => set("route", v)}
                    />
                    {v}
                  </label>
                ))}
              </div>
              {f.route === "Fournisseur" && (
                <label>
                  Fournisseur pressenti
                  <input
                    value={f.supplier}
                    onChange={(e) => set("supplier", e.target.value)}
                    placeholder="Nom à préciser"
                  />
                </label>
              )}
            </div>
          </section>
        </div>
        <div className="def-bottom">
          <section className="def-notes">
            <label>
              Accès chantier
              <input
                value={f.access}
                onChange={(e) => set("access", e.target.value)}
              />
            </label>
            <label>
              Observations utiles
              <textarea
                rows="3"
                value={f.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </label>
          </section>
          <aside className="def-export">
            <div role="status">
              <h2>
                {p.errors.length
                  ? "Le relevé demande une correction"
                  : p.missing.length
                    ? `${p.missing.length} point à confirmer`
                    : "Les points du relevé sont renseignés"}
              </h2>
              {p.errors.map((e) => (
                <p key={e} className="def-error">
                  {e}
                </p>
              ))}
              {!p.errors.length && (
                <p>
                  {p.missing.length
                    ? p.missing.join(" · ")
                    : "Le dossier reste soumis à l’étude technique de l’équipe."}
                </p>
              )}
            </div>
            <button
              disabled={!p.valid}
              onClick={() => {
                downloadText(
                  "defialu-releve-F01.txt",
                  `RELEVÉ MENUISERIE F01 / EXEMPLE\nPrototype indépendant pour Défi Alu\n\nFenêtre séjour, vue intérieure\nCotes relevées ${f.width} × ${f.height} mm\n${f.material} / ${f.opening} / repère RAL ${f.ral} à vérifier au nuancier\nPose envisagée ${f.pose}\n${f.glass}\n\nDestination ${f.route}${f.route === "Fournisseur" ? ` : ${f.supplier}` : ""}\n\nAccès ${f.access}\nObservations ${f.notes}\n\nPoints à confirmer\n${p.missing.length ? p.missing.join("\n") : "Les sujets du relevé sont renseignés dans cet exemple."}\n\nDossier préparatoire. Aucun jeu, débit, profil ou performance calculé. Mesures et faisabilité à valider par l’équipe. Aucun ordre de fabrication émis.`,
                );
                setMessage(
                  "Relevé téléchargé avec les points restant à confirmer.",
                );
              }}
            >
              ↓ Exporter le relevé préparatoire
            </button>
            <span role="status">{message}</span>
          </aside>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
