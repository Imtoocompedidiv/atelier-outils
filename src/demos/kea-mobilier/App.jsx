import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { base, validate } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("KEA · Brief de dressing");
  const [f, setF] = useState(structuredClone(base)),
    [message, setMessage] = useState("");
  const errors = validate(f),
    count = f.modules.length,
    drawingWidth = Math.min(5000, Math.max(600, f.width || 600)),
    drawingHeight = Math.min(3500, Math.max(600, f.height || 600)),
    scale = Math.min(450 / drawingWidth, 390 / drawingHeight),
    w = drawingWidth * scale,
    h = drawingHeight * scale,
    left = (600 - w) / 2,
    top = 470 - h,
    checks = [
      ["plinth", "Plinthe prise en compte"],
      ["socket", "Prises repérées"],
      ["slope", "Pente du plafond vérifiée"],
      ["measured", "Mesures à confirmer avec l’équipe"],
    ],
    missing = checks.filter(([k]) => !f[k]);
  const set = (key, v) => {
    setF((x) => ({ ...x, [key]: v }));
    setMessage("");
  };
  return (
    <div className="kea-mobilier">
      <DemoNotice company="KEA Mobilier" />
      <header className="kea-header">
        <strong>
          KEA<span>MOBILIER</span>
        </strong>
        <button
          onClick={() => {
            setF(structuredClone(base));
            setMessage("Projet exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="kea-main">
        <section className="kea-canvas">
          <h1>
            Le dressing, avant <br />
            le premier plan.
          </h1>
          <p>
            Composez l’aménagement. Gardez les questions pour le rendez-vous.
          </p>
          <div className="kea-drawing">
            <svg
              viewBox="0 0 600 520"
              role="img"
              aria-label={`Dressing de ${f.width} millimètres de large, ${f.height} millimètres de haut, ${count} travées`}
            >
              <defs>
                <pattern
                  id="kea-wood"
                  width="12"
                  height="22"
                  patternUnits="userSpaceOnUse"
                >
                  <rect width="12" height="22" fill="#d8c9ac" />
                  <path d="M1 0v22M7 0v22" stroke="#c9b58e" strokeWidth=".4" />
                </pattern>
              </defs>
              <line x1="35" y1="472" x2="565" y2="472" stroke="#343434" />
              <rect
                x={left}
                y={top}
                width={w}
                height={h}
                fill={
                  f.finish === "Chêne naturel" ? "url(#kea-wood)" : "#eeeae5"
                }
                stroke="#4b4944"
                strokeWidth="3"
              />
              {f.modules.map((type, i) => {
                const x = left + (i * w) / count,
                  inner = w / count;
                return (
                  <g key={i}>
                    <rect
                      x={x + 6}
                      y={top + 6}
                      width={inner - 12}
                      height={h - 12}
                      fill="#e5e1d8"
                      stroke="#aca69a"
                    />
                    <path
                      d={`M${x + 6} ${top + h * 0.2}h${inner - 12}`}
                      stroke="#77736b"
                      strokeWidth="3"
                    />
                    {type === "Étagères" ? (
                      [0.38, 0.56, 0.74].map((y) => (
                        <line
                          key={y}
                          x1={x + 6}
                          y1={top + h * y}
                          x2={x + inner - 6}
                          y2={top + h * y}
                          stroke="#77736b"
                          strokeWidth="3"
                        />
                      ))
                    ) : type === "Penderie" ? (
                      <>
                        <line
                          x1={x + 12}
                          y1={top + h * 0.28}
                          x2={x + inner - 12}
                          y2={top + h * 0.28}
                          stroke="#5a5750"
                          strokeWidth="4"
                        />
                        {[0.3, 0.5, 0.7].map((a) => (
                          <path
                            key={a}
                            d={`M${x + inner * a} ${top + h * 0.28}v14l-14 14h28l-14-14`}
                            fill="none"
                            stroke="#817d71"
                          />
                        ))}
                      </>
                    ) : (
                      <>
                        {[0.4, 0.58, 0.76, 0.94].map((y) => (
                          <g key={y}>
                            <rect
                              x={x + 8}
                              y={top + h * y - 45}
                              width={inner - 16}
                              height="42"
                              fill="#d2c19e"
                              stroke="#9d8b67"
                            />
                            <line
                              x1={x + inner * 0.4}
                              y1={top + h * y - 37}
                              x2={x + inner * 0.6}
                              y2={top + h * y - 37}
                              stroke="#60543c"
                              strokeWidth="2"
                            />
                          </g>
                        ))}
                      </>
                    )}
                    <text
                      x={x + inner / 2}
                      y="498"
                      textAnchor="middle"
                      fill="#60605d"
                      fontSize="13"
                    >
                      Travée {i + 1}
                    </text>
                  </g>
                );
              })}
              <g stroke="#676762" fill="none">
                <path
                  d={`M${left} ${top - 25}h${w}M${left} ${top - 31}v12M${left + w} ${top - 31}v12`}
                />
                <path
                  d={`M${left - 25} ${top}v${h}M${left - 31} ${top}h12M${left - 31} ${top + h}h12`}
                />
              </g>
              <text
                x="300"
                y={top - 35}
                textAnchor="middle"
                fontSize="16"
                fill="#333"
              >
                {f.width} mm
              </text>
              <text
                transform={`translate(${left - 35},${top + h / 2}) rotate(-90)`}
                textAnchor="middle"
                fontSize="15"
                fill="#333"
              >
                {f.height} mm
              </text>
            </svg>
          </div>
          <p className="kea-disclaimer">
            Élévation d’intention. Aucun débit, assemblage ni plan de
            fabrication n’est calculé.
          </p>
        </section>
        <aside className="kea-config">
          <h2>Votre dressing</h2>
          <div className="kea-fields">
            {[
              ["width", "Largeur (mm)"],
              ["height", "Hauteur (mm)"],
              ["depth", "Profondeur (mm)"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type="number"
                  value={f[key]}
                  min="0"
                  max="5000"
                  onChange={(e) => set(key, Number(e.target.value))}
                />
              </label>
            ))}
            <label>
              Travées
              <select
                value={count}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  set(
                    "modules",
                    Array.from(
                      { length: n },
                      (_, i) => f.modules[i] || "Étagères",
                    ),
                  );
                }}
              >
                {[2, 3, 4, 5].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Décor principal
            <select
              value={f.finish}
              onChange={(e) => set("finish", e.target.value)}
            >
              <option>Chêne naturel</option>
              <option>Blanc mat</option>
            </select>
          </label>
          <h3>Aménagement de chaque travée</h3>
          {f.modules.map((m, i) => (
            <label className="kea-module" key={i}>
              <span>Travée {i + 1}</span>
              <select
                value={m}
                onChange={(e) =>
                  set(
                    "modules",
                    f.modules.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
              >
                {["Penderie", "Étagères", "Tiroirs"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ))}
          {errors.length > 0 && (
            <div className="kea-errors" role="alert">
              {errors.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          )}
          <h3>Avant le rendez-vous</h3>
          {checks.map(([key, label]) => (
            <label className="kea-check" key={key}>
              <input
                type="checkbox"
                checked={f[key]}
                onChange={(e) => set(key, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
          <p className="kea-help">
            Les cases indiquent les sujets déjà préparés, pas une validation
            technique.
          </p>
          <button
            className="kea-export"
            disabled={errors.length > 0}
            onClick={() => {
              downloadText(
                "kea-brief-dressing.txt",
                `BRIEF DRESSING\nPrototype indépendant pour KEA Mobilier. Données fictives.\n\nDimensions ${f.width} × ${f.height} × ${f.depth} mm\nDécor ${f.finish}\n${f.modules.map((x, i) => `Travée ${i + 1} : ${x}, largeur théorique ${(f.width / count).toFixed(0)} mm`).join("\n")}\n\nPoints à confirmer\n${missing.length ? missing.map(([, x]) => x).join("\n") : "Tous les sujets ont été préparés dans cet exemple."}\n\nSchéma d’intention, mesures et fabrication à valider par l’équipe.`,
              );
              setMessage(
                "Brief téléchargé avec les points restant à confirmer.",
              );
            }}
          >
            Exporter le brief atelier
          </button>
          <p role="status">{message}</p>
        </aside>
      </main>
      <DemoFooter />
    </div>
  );
}
