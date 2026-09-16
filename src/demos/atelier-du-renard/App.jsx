import React, { useState } from "react";
import "@fontsource/fira-sans-extra-condensed/latin-300.css";
import "@fontsource/open-sans/latin-400.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import { initial, fields, assess, worksheet } from "./model.js";
import "./styles.css";
const mm = (n) => n.toLocaleString("fr-FR") + " mm";
function Drawing({ result }) {
  if (!result.valid)
    return (
      <div className="atelier-du-renard-drawing-error">
        Complétez les six mesures pour voir le croquis.
      </div>
    );
  const v = result.values,
    c = 410,
    base = 290,
    scale = Math.min(1.5, 55 / Math.max(result.widthGap, 1)),
    widths = [v.bottom, v.middle, v.top].map(
      (w) => base + (w - result.minWidth) * scale,
    ),
    floor = 465,
    lTop = 65,
    rTop =
      65 + Math.min(40, result.heightGap * 2) * (v.left >= v.right ? 1 : -1),
    ys = [floor, 270, 95],
    left = widths.map((w) => c - w / 2),
    right = widths.map((w) => c + w / 2),
    outline = `M${left[0]} ${floor} L${left[1]} 270 L${left[2]} ${lTop} L${right[2]} ${rTop} L${right[1]} 270 L${right[0]} ${floor} Z`;
  return (
    <svg
      viewBox="0 0 820 530"
      role="img"
      aria-label={`Relevé d’alcôve. Largeurs bas ${v.bottom}, milieu ${v.middle}, haut ${v.top} millimètres. Écart ${result.widthGap} millimètres.`}
    >
      <defs>
        <pattern
          id="renard-grid"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <path d="M18 0H0V18" fill="none" stroke="#e8e8e8" strokeWidth=".7" />
        </pattern>
        <pattern
          id="renard-hatch"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 8L8 0" stroke="#aaa" strokeWidth=".8" />
        </pattern>
        <marker
          id="renard-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M0 0L10 5L0 10Z" fill="#222" />
        </marker>
      </defs>
      <rect width="820" height="530" fill="url(#renard-grid)" />
      <path
        d={`M${left[0] - 30} ${floor + 20}L${left[0] - 30} 42H${left[2]}V${lTop}L${left[1]} 270L${left[0]} ${floor}H${right[0]}L${right[1]} 270L${right[2]} ${rTop}V42H${right[0] + 30}V${floor + 20}Z`}
        fill="url(#renard-hatch)"
      />
      <path d={outline} fill="#ffffff70" stroke="#222" strokeWidth="2" />
      <line
        x1={left[0] - 48}
        y1={floor}
        x2={right[0] + 48}
        y2={floor}
        stroke="#222"
        strokeWidth="2"
      />
      {ys.map((y, i) => (
        <g key={i}>
          <line
            x1={left[i] + 8}
            y1={y - (i === 0 ? 30 : 0)}
            x2={right[i] - 8}
            y2={y - (i === 0 ? 30 : 0)}
            stroke="#222"
            markerStart="url(#renard-arrow)"
            markerEnd="url(#renard-arrow)"
          />
          <rect
            x={c - 53}
            y={y - (i === 0 ? 66 : 36)}
            width="106"
            height="26"
            fill="#fff"
          />
          <text x={c} y={y - (i === 0 ? 47 : 17)} textAnchor="middle">
            {mm([v.bottom, v.middle, v.top][i])}
          </text>
        </g>
      ))}
      {[
        [150, lTop, v.left],
        [670, rTop, v.right],
      ].map(([x, y, height], i) => (
        <g key={i}>
          <line
            x1={x}
            y1={y + 7}
            x2={x}
            y2={floor - 7}
            stroke="#222"
            markerStart="url(#renard-arrow)"
            markerEnd="url(#renard-arrow)"
          />
          <line x1={x - 17} y1={y} x2={x + 17} y2={y} stroke="#222" />
          <line x1={x - 17} y1={floor} x2={x + 17} y2={floor} stroke="#222" />
          <rect x={x - 55} y="257" width="110" height="28" fill="#fff" />
          <text x={x} y="277" textAnchor="middle">
            {mm(height)}
          </text>
        </g>
      ))}
      <text x="20" y="511" className="atelier-du-renard-diagram-note">
        Croquis de relevé · Écarts amplifiés · Sans valeur de plan
      </text>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Atelier du Renard · Relevé d’alcôve");
  const [f, setF] = useState({ ...initial }),
    [status, setStatus] = useState("");
  const r = assess(f),
    set = (key, value) => {
      setF((s) => ({ ...s, [key]: value }));
      setStatus("");
    };
  return (
    <div className="atelier-du-renard-app">
      <DemoNotice company="L’atelier du Renard" />
      <header>
        <strong>L’atelier du Renard</strong>
        <button
          onClick={() => {
            setF({ ...initial });
            setStatus("Le relevé fictif a été rétabli.");
          }}
        >
          Réinitialiser
        </button>
      </header>
      <main>
        <h1>Les murs ont leurs écarts.</h1>
        <p className="atelier-du-renard-intro">
          Une alcôve, six mesures et les questions pour la visite.
        </p>
        <div className="atelier-du-renard-workspace">
          <section className="atelier-du-renard-drawing">
            <Drawing result={r} />
            <div className="atelier-du-renard-results" aria-live="polite">
              {[
                [r.minWidth, "Plus petite largeur relevée"],
                [r.widthGap, "Écart entre largeurs"],
                [r.heightGap, "Écart entre hauteurs"],
              ].map(([n, l]) => (
                <div key={l}>
                  <strong>{r.valid ? mm(n) : "À compléter"}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="atelier-du-renard-form">
            <h2>Le relevé</h2>
            {fields.map(([key, label], i) => (
              <label
                key={key}
                className={i === 3 ? "atelier-du-renard-height" : ""}
              >
                <span>{label}</span>
                <input
                  inputMode="numeric"
                  aria-label={label}
                  value={f[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
                <small>mm</small>
              </label>
            ))}
          </section>
        </div>
        <section className="atelier-du-renard-points">
          <h2>Points à voir sur place</h2>
          <div>
            {[
              ["plinth", "Plinthe"],
              ["socket", "Prise"],
              ["uneven", "Mur irrégulier"],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={f[key]}
                  onChange={(e) => set(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
          <label className="atelier-du-renard-note">
            Autre remarque
            <textarea
              rows="2"
              value={f.note}
              maxLength="500"
              onChange={(e) => set("note", e.target.value)}
            />
          </label>
        </section>
        {!r.valid && (
          <div role="alert" className="atelier-du-renard-errors">
            {r.errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
        <details className="atelier-du-renard-questions">
          <summary>
            La fiche reprendra {r.questions.length} points à vérifier
          </summary>
          <ul>
            {r.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
          <p>
            Le minimum mesuré ne constitue jamais une cote de fabrication. Les
            passages, jeux et irrégularités entre les mesures restent à étudier.
          </p>
        </details>
        <div className="atelier-du-renard-actions">
          <button
            disabled={!r.valid}
            onClick={() => {
              downloadText("renard-releve-alcove.txt", worksheet(f, r));
              setStatus(
                "Fiche téléchargée avec les mesures et les points de visite.",
              );
            }}
          >
            Exporter la fiche
          </button>
          <button
            disabled={!r.valid}
            onClick={() => {
              downloadCsv(
                "renard-mesures-alcove.csv",
                ["Mesure", "Valeur", "Unité"],
                fields.map(([key, label]) => [label, r.values[key], "mm"]),
              );
              setStatus("Les six mesures ont été téléchargées.");
            }}
          >
            Exporter les mesures
          </button>
          <span role="status">{status}</span>
        </div>
      </main>
      <DemoFooter>
        Mesures fictives. La visite et la validation de l’atelier restent
        nécessaires.
      </DemoFooter>
    </div>
  );
}
