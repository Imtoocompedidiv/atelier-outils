import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { initial, layout } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Loc’dunum · Première implantation");
  const [f, setF] = useState(initial),
    [message, setMessage] = useState("");
  const p = layout(f),
    set = (k, v) => {
      setF((x) => ({ ...x, [k]: v }));
      setMessage("");
    },
    scale = p.valid ? Math.min(560 / f.width, 680 / f.length) : 20,
    W = p.valid ? f.width * scale : 300,
    H = p.valid ? f.length * scale : 400;
  return (
    <div className="locdunum">
      <DemoNotice company="Loc’dunum" />
      <header className="loc-header">
        <strong>
          Loc’dunum<span>LOCATION · RÉCEPTION</span>
        </strong>
        <span>Le carnet d’implantation / 01</span>
      </header>
      <main className="loc-work">
        <aside className="loc-controls">
          <small>PRÉPARER LA RENCONTRE</small>
          <h1>
            Et si l’on posait <br />
            les tables ?
          </h1>
          <p>
            Un premier dessin pour discuter du lieu, des invités et du mobilier.
          </p>
          <fieldset>
            <legend>01 / Le lieu</legend>
            {[
              ["width", "Largeur disponible", "m"],
              ["length", "Longueur disponible", "m"],
            ].map(([k, l, u]) => (
              <label key={k}>
                {l}
                <div>
                  <input
                    type="number"
                    step=".5"
                    min="5"
                    max={k === "width" ? 40 : 60}
                    value={f[k]}
                    onChange={(e) => set(k, Number(e.target.value))}
                  />
                  <span>{u}</span>
                </div>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>02 / L’accueil</legend>
            <label>
              Invités assis
              <div>
                <input
                  type="number"
                  min="1"
                  max="600"
                  value={f.guests}
                  onChange={(e) => set("guests", Number(e.target.value))}
                />
                <span>pers.</span>
              </div>
            </label>
            <label>
              Allée centrale
              <div>
                <input
                  type="number"
                  min=".8"
                  max="3"
                  step=".1"
                  value={f.aisle}
                  onChange={(e) => set("aisle", Number(e.target.value))}
                />
                <span>m</span>
              </div>
            </label>
            <label>
              Retrait sur le pourtour
              <div>
                <input
                  type="number"
                  min=".5"
                  max="3"
                  step=".1"
                  value={f.clearance}
                  onChange={(e) => set("clearance", Number(e.target.value))}
                />
                <span>m</span>
              </div>
            </label>
          </fieldset>
          <p className="loc-assumption">
            Hypothèse de dessin : table de 180 × 80 cm, 6 places, emprise avec
            chaises de 240 × 280 cm. Mobilier et espacements à revoir avec
            l’équipe.
          </p>
          <button
            className="loc-reset"
            onClick={() => {
              setF(initial);
              setMessage("Implantation exemple rétablie.");
            }}
          >
            Revenir à l’exemple
          </button>
        </aside>
        <section className="loc-plan">
          <div className="loc-plan-title">
            <h2>Vue de dessus</h2>
            <span>Schéma d’intention</span>
          </div>
          <div className="loc-paper">
            <svg
              viewBox={`0 0 ${W + 90} ${H + 90}`}
              role="img"
              aria-label={
                p.valid
                  ? `${p.tables.length} tables placées pour ${f.guests} invités`
                  : "Dimensions à corriger"
              }
            >
              <defs>
                <pattern
                  id="loc-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M20 0H0V20"
                    fill="none"
                    stroke="#dce8e9"
                    strokeWidth=".7"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#loc-grid)" />
              <g transform="translate(45,45)">
                <rect
                  width={W}
                  height={H}
                  fill="#fff"
                  stroke="#137185"
                  strokeWidth="2"
                />
                {p.valid && (
                  <>
                    <rect
                      x={((f.width - f.aisle) / 2) * scale}
                      width={f.aisle * scale}
                      height={H}
                      fill="#eaf3f3"
                    />
                    <text
                      transform={`translate(${W / 2},${H / 2}) rotate(-90)`}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#59777b"
                    >
                      ALLÉE · {f.aisle.toFixed(1)} M
                    </text>
                    {p.tables.map((t) => (
                      <g
                        key={t.id}
                        transform={`translate(${t.x * scale},${t.y * scale})`}
                      >
                        <rect
                          width={t.w * scale}
                          height={t.h * scale}
                          rx="2"
                          fill="#c0dee4"
                          stroke="#137185"
                        />
                        <text
                          x={(t.w * scale) / 2}
                          y={(t.h * scale) / 2 + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#194e5c"
                        >
                          {t.id}
                        </text>
                        {[0.15, 0.5, 0.85].flatMap((v, i) =>
                          [-0.32, t.w + 0.1].map((x, j) => (
                            <rect
                              key={`${i}-${j}`}
                              x={x * scale}
                              y={(t.h * v - 0.12) * scale}
                              width={0.22 * scale}
                              height={0.24 * scale}
                              rx="1"
                              fill="#a6c4ca"
                            />
                          )),
                        )}
                      </g>
                    ))}
                    <text
                      x={W / 2}
                      y="-18"
                      textAnchor="middle"
                      fontSize="13"
                      fill="#335b61"
                    >
                      {f.width} m
                    </text>
                    <text
                      transform={`translate(-18,${H / 2}) rotate(-90)`}
                      textAnchor="middle"
                      fontSize="13"
                      fill="#335b61"
                    >
                      {f.length} m
                    </text>
                  </>
                )}
              </g>
            </svg>
          </div>
          <div className="loc-results" aria-live="polite">
            <div>
              <strong>{p.valid ? p.tables.length : "—"}</strong>
              <span>tables dessinées</span>
            </div>
            <div>
              <strong>{p.valid ? p.seats : "—"}</strong>
              <span>places théoriques</span>
            </div>
            <div>
              <strong>
                {p.valid ? p.area : "—"}
                <small> m²</small>
              </strong>
              <span>surface renseignée</span>
            </div>
          </div>
          <div
            className={
              p.valid && !p.missing ? "loc-message" : "loc-message warning"
            }
            role="status"
          >
            {!p.valid
              ? p.error
              : p.missing
                ? `Il manque ${p.missing} table${p.missing > 1 ? "s" : ""} pour cet accueil. Ajustez le lieu ou le nombre d’invités.`
                : "Le nombre de tables demandé tient dans les emprises choisies."}
          </div>
          <div className="loc-bottom">
            <p>
              Ni plan d’évacuation, ni vérification de stabilité ou
              d’accessibilité. Les contraintes du site restent à relever.
            </p>
            <button
              disabled={!p.valid || !!p.missing}
              onClick={() => {
                downloadCsv(
                  "locdunum-implantation.csv",
                  [
                    "Table",
                    "X (m)",
                    "Y (m)",
                    "Largeur (m)",
                    "Longueur (m)",
                    "Places théoriques",
                    "Statut",
                  ],
                  p.tables.map((t) => [
                    t.id,
                    t.x.toFixed(2),
                    t.y.toFixed(2),
                    t.w,
                    t.h,
                    6,
                    "Hypothèse à valider",
                  ]),
                );
                setMessage("Coordonnées et quantités téléchargées.");
              }}
            >
              Exporter l’implantation ↗
            </button>
          </div>
          <p role="status">{message}</p>
        </section>
      </main>
      <DemoFooter />
    </div>
  );
}
