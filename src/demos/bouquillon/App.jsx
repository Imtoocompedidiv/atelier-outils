import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import {
  initial,
  stages,
  isValid,
  changeSpec,
  toggleStage,
  canComplete,
} from "./model.js";
import "./styles.css";
function Bracket({ width, height }) {
  return (
    <svg
      viewBox="0 0 500 420"
      role="img"
      aria-label={`Étude d’équerre décorative de ${width} par ${height} millimètres, schéma non exécutable`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M80 70V355H95V85H365V70Z" />
        <path d="M102 320 C108 240 158 188 245 143 Q300 117 330 93 M113 303 C60 251 144 207 156 251 C167 292 113 283 129 254 M130 264 C144 262 143 245 132 246 M207 170 C169 137 177 115 192 135 Q201 150 207 170 M209 168 C224 135 216 116 210 140 M270 135 C345 172 371 91 317 100 C274 109 302 154 322 131 C338 113 304 111 310 127" />
        <path
          d="M75 50H365M80 44V57M365 44V57M50 70V355M44 70H58M44 355H58"
          strokeWidth=".7"
        />
        <path d="M420 78 Q408 70 406 85 V350 Q416 366 427 350 V85 Q428 78 420 78Z" />
        {[110, 205, 324].map((y) => (
          <circle key={y} cx="416" cy={y} r="3" />
        ))}
        <path d="M460 80V352M454 80H466M454 352H466" strokeWidth=".7" />
      </g>
      <g fill="currentColor" fontFamily="Arial" fontSize="12">
        <text x="222" y="39" textAnchor="middle">
          {width} mm
        </text>
        <text x="40" y="218" transform="rotate(-90 40 218)" textAnchor="middle">
          {height} mm
        </text>
        <text
          x="472"
          y="215"
          transform="rotate(90 472 215)"
          textAnchor="middle"
        >
          {height} mm
        </text>
        <text x="414" y="50" textAnchor="middle" fontSize="8">
          PLATINE
        </text>
        <text x="80" y="392" fontSize="8" letterSpacing="2">
          DESSIN D’INTENTION · HORS ÉCHELLE
        </text>
      </g>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Bouquillon · Fiche suiveuse");
  const [s, setS] = useState(structuredClone(initial));
  const [message, setMessage] = useState("");
  const edit = (k, v) => {
    setS((x) => changeSpec(x, k, v));
    setMessage(
      ["width", "height", "quantity", "revision", "material"].includes(k)
        ? "La définition a changé. Les validations et contrôles de pièces sont à reprendre."
        : k === "finish"
          ? "Peinture et remise sont à revalider."
          : "",
    );
  };
  const completed = s.steps.filter(Boolean).length;
  function exportSheet() {
    downloadText(
      "bouquillon-fiche-suiveuse.txt",
      `FICHE SUIVEUSE · EXEMPLE INDÉPENDANT\nBouquillon / ${s.name}\nRévision ${s.revision}\n${s.quantity} pièces · ${s.material}\n${s.width} × ${s.height} mm\nFinition ${s.finish}\n\n${stages.map((x, i) => `${i + 1}. ${x} : ${s.steps[i] ? "Validation déclarée" : "À valider"}`).join("\n")}\n\nContrôle de gabarit déclaré : ${s.pieces.filter(Boolean).length}/${s.pieces.length} pièces\n${s.note}\n\nDonnées fictives. Schéma d’intention non dimensionné pour l’exécution. Aucune validation de résistance ni autorisation de fabrication.`,
    );
    setMessage("Fiche suiveuse téléchargée avec son état actuel.");
  }
  return (
    <div className="bouquillon-app">
      <DemoNotice company="Établissements Bouquillon" />
      <header className="bouquillon-header">
        <b>
          BOUQUILLON<small>FERRONNERIE D’ART · SUR MESURE</small>
        </b>
        <span>LE FIL DE L’OUVRAGE</span>
        <button
          onClick={() => {
            setS(structuredClone(initial));
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="bouquillon-title">
          <div>
            <span>FICHE SUIVEUSE · ÉTUDE 026</span>
            <h1>
              Un ouvrage, <br />
              sa bonne version.
            </h1>
            <p>Du dessin à la remise, garder la même référence.</p>
          </div>
          <div className="bouquillon-revision">
            <span>RÉVISION</span>
            <strong>{s.revision || "?"}</strong>
            <small>{completed} / 6 étapes déclarées</small>
          </div>
        </div>
        <div className="bouquillon-work">
          <section className="bouquillon-form">
            <h2>PROJET</h2>
            <label>
              Désignation
              <input
                value={s.name}
                maxLength={70}
                onChange={(e) => edit("name", e.target.value)}
              />
            </label>
            <label>
              Matière
              <select
                value={s.material}
                onChange={(e) => edit("material", e.target.value)}
              >
                <option>Acier</option>
                <option>Laiton</option>
                <option>Fer</option>
              </select>
            </label>
            <div className="bouquillon-pair">
              {[
                ["width", "Largeur (mm)"],
                ["height", "Hauteur (mm)"],
                ["quantity", "Quantité"],
                ["revision", "Révision"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <input
                    type={k === "revision" ? "text" : "number"}
                    min="1"
                    max={k === "quantity" ? 24 : 2000}
                    maxLength={k === "revision" ? 12 : undefined}
                    value={s[k]}
                    onChange={(e) => edit(k, e.target.value)}
                  />
                </label>
              ))}
            </div>
            <label>
              Finition
              <select
                value={s.finish}
                onChange={(e) => edit("finish", e.target.value)}
              >
                <option>Noir mat</option>
                <option>Brut patiné</option>
                <option>Blanc satiné</option>
              </select>
            </label>
            <label>
              Note d’atelier
              <textarea
                rows="3"
                value={s.note}
                maxLength={500}
                onChange={(e) => edit("note", e.target.value)}
              />
            </label>
          </section>
          <section className="bouquillon-drawing">
            <div>
              <span>VUE DE CÔTÉ</span>
              <small>RÉF. EQ-026 / RÉV. {s.revision}</small>
            </div>
            <Bracket width={s.width} height={s.height} />
            <p>
              Motif illustratif. Les cotes sont des données de dossier, le
              dessin n’est pas un plan d’exécution.
            </p>
          </section>
          <section className="bouquillon-stages">
            <h2>ÉTAPES DE FABRICATION</h2>
            {stages.map((x, i) => (
              <button
                key={x}
                className={s.steps[i] ? "done" : ""}
                disabled={!s.steps[i] && !canComplete(s, i)}
                onClick={() => {
                  setS((a) => toggleStage(a, i));
                  setMessage(
                    s.steps[i]
                      ? `${x} et étapes suivantes sont à revalider.`
                      : `${x} marqué comme validé dans cet exemple.`,
                  );
                }}
              >
                <b>{s.steps[i] ? "✓" : i + 1}</b>
                <span>
                  <strong>{x}</strong>
                  <small>
                    {s.steps[i]
                      ? "Validation déclarée"
                      : i === 2 && s.steps[1]
                        ? "Contrôler chaque pièce ci-dessous"
                        : i > 0 && !s.steps[i - 1]
                          ? "Étape précédente à valider"
                          : "Prêt pour votre contrôle"}
                  </small>
                </span>
              </button>
            ))}
          </section>
        </div>
        <section className="bouquillon-pieces">
          <div>
            <h2>CONTRÔLE AU GABARIT</h2>
            <p>
              {s.pieces.filter(Boolean).length} / {s.pieces.length} pièces
              déclarées contrôlées
            </p>
          </div>
          <div className="bouquillon-piece-list">
            {s.pieces.map((checked, i) => (
              <label key={i} className={checked ? "checked" : ""}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!s.steps[1]}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setS((x) => ({
                      ...x,
                      pieces: x.pieces.map((p, j) => (j === i ? checked : p)),
                      steps: checked
                        ? x.steps
                        : x.steps.map((p, j) => (j < 2 ? p : false)),
                    }));
                    setMessage("Contrôle de pièce actualisé.");
                  }}
                />
                <b>{String(i + 1).padStart(2, "0")}</b>
                <span>{checked ? "Contrôlée" : "À contrôler"}</span>
              </label>
            ))}
          </div>
          <button disabled={!isValid(s)} onClick={exportSheet}>
            Exporter la fiche suiveuse ↓
          </button>
        </section>
        {!isValid(s) && (
          <p role="alert">
            Renseignez un nom, une révision, des cotes de 1 à 2 000 mm et une
            quantité entière de 1 à 24.
          </p>
        )}
        <p className="bouquillon-status" role="status">
          {message ||
            "Commencez par déclarer le contrôle des six pièces, puis validez la forge."}
        </p>
      </main>
      <DemoFooter>
        Cette étude illustre un suivi de version et des validations humaines.
        Aucun contrôle de résistance ou de conformité technique n’est effectué.
      </DemoFooter>
    </div>
  );
}
