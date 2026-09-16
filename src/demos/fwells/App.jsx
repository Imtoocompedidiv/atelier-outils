import React, { useState } from "react";
import "@fontsource/roboto-condensed/latin-700.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { initial, checks, change, ready, valid } from "./model.js";
import "./styles.css";
function Poster({ s, view }) {
  const c = view === "both" ? s.colors : ["#000000", "#000000"];
  return (
    <svg
      viewBox="0 0 300 400"
      role="img"
      aria-label={`Affiche fictive ${s.title}, ${view === "both" ? "superposition illustrative des deux couleurs" : `séparation ${view}`}`}
    >
      <rect width="300" height="400" fill="#f4f0e5" />
      {view !== "2" && (
        <g fill={c[0]}>
          <circle cx="150" cy="190" r="98" />
          <text
            x="22"
            y="372"
            fontFamily="Arial"
            fontSize="8"
            letterSpacing="2"
          >
            DEUX PASSAGES / UN VISUEL
          </text>
          <rect x="229" y="362" width="47" height="2" />
        </g>
      )}
      {view !== "1" && (
        <g
          fill={c[1]}
          style={{ mixBlendMode: view === "both" ? "multiply" : "normal" }}
        >
          <text
            x="19"
            y="60"
            fontFamily="Roboto Condensed,Arial Narrow,sans-serif"
            fontWeight="700"
            fontSize="45"
            textLength="262"
            lengthAdjust="spacingAndGlyphs"
          >
            {s.title || "NOCTURNE"}
          </text>
          <text x="23" y="82" fontFamily="Arial" fontSize="8" letterSpacing="3">
            ÉTUDE DE SÉRIGRAPHIE
          </text>
          <path d="M51 285 A99 99 0 0 1 249 285Z" />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={51 + i * 20} y="285" width="10" height="55" />
          ))}
          <text
            x="22"
            y="386"
            fontFamily="Arial"
            fontSize="6"
            letterSpacing="2"
          >
            COMPOSITION FICTIVE · AUCUNE ÉPREUVE CONTRACTUELLE
          </text>
        </g>
      )}
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Fwells · Avant le premier passage");
  const [s, setS] = useState(structuredClone(initial));
  const [view, setView] = useState("both");
  const [message, setMessage] = useState("");
  const count = checks.filter(([k]) => s.checked[k]).length;
  function edit(k, v) {
    setS((x) => change(x, k, v));
    setMessage(
      ["width", "height", "title", "colors", "refs"].includes(k)
        ? "Les déclarations liées à cette modification sont à reprendre."
        : "",
    );
  }
  function exportBrief() {
    downloadText(
      "fwells-brief-serigraphie.txt",
      `BRIEF SÉRIGRAPHIE · EXEMPLE INDÉPENDANT\n${s.title}\nFormat ${s.width} × ${s.height} cm\nQuantité ${s.quantity}\nSupport ${s.paper}\nDate souhaitée ${s.date} (non réservée)\nDeux passages de l’exemple\n\nCOULEURS\n${s.refs.map((ref, i) => `${i + 1}. ${ref} / couleur écran ${s.colors[i]} non contractuelle`).join("\n")}\n\nNOTE\n${s.note}\n\nPRÉPARATION DÉCLARÉE\n${checks.map(([k, label]) => `${label} : ${s.checked[k] ? "déclarée vérifiée" : "à préparer"}`).join("\n")}\n\nCe document ne contient aucun fichier d’impression ni validation atelier. Les contrôles sont déclaratifs. Les couleurs écran, le mélange affiché et le visuel fictif ne constituent ni simulation colorimétrique ni BAT. Format, support, teintes, délai et faisabilité doivent être confirmés avec l’atelier.`,
    );
    setMessage(
      "Brief téléchargé. Joignez vos vrais fichiers après préparation et vérification.",
    );
  }
  return (
    <div className="fwells-app">
      <DemoNotice company="Fwells" />
      <header className="fwells-header">
        <b>FWELLS</b>
        <span>SÉRIGRAPHIE / DOSSIER D’IMPRESSION</span>
        <button
          onClick={() => {
            setS(structuredClone(initial));
            setView("both");
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="fwells-heading">
          <p>UNE ÉTUDE EN DEUX PASSAGES</p>
          <h1>
            Avant le premier <br />
            passage.
          </h1>
          <span>
            Le support, les couches, les fichiers. <br />
            Un brief préparé avant l’échange.
          </span>
        </div>
        <div className="fwells-work">
          <section className="fwells-job">
            <h2>Le tirage</h2>
            <p>INFORMATIONS DU PROJET</p>
            <label>
              Titre du visuel fictif
              <input
                value={s.title}
                maxLength="20"
                onChange={(e) => edit("title", e.target.value)}
              />
            </label>
            <div className="fwells-pair">
              <label>
                Largeur (cm)
                <input
                  inputMode="decimal"
                  value={s.width}
                  onChange={(e) => edit("width", e.target.value)}
                />
              </label>
              <label>
                Hauteur (cm)
                <input
                  inputMode="decimal"
                  value={s.height}
                  onChange={(e) => edit("height", e.target.value)}
                />
              </label>
            </div>
            <label>
              Quantité
              <input
                inputMode="numeric"
                value={s.quantity}
                onChange={(e) => edit("quantity", e.target.value)}
              />
            </label>
            <label>
              Support et référence papier
              <input
                value={s.paper}
                maxLength="100"
                onChange={(e) => edit("paper", e.target.value)}
              />
            </label>
            <label>
              Date souhaitée
              <input
                type="date"
                value={s.date}
                onChange={(e) => edit("date", e.target.value)}
              />
            </label>
            <label>
              Note pour l’atelier
              <textarea
                rows="4"
                value={s.note}
                maxLength="800"
                onChange={(e) => edit("note", e.target.value)}
              />
            </label>
            <p className="fwells-small">
              Le format saisi décrit le projet. La faisabilité, le support et le
              délai sont à confirmer avec l’atelier.
            </p>
          </section>
          <section className="fwells-proof">
            <div className="fwells-proof-title">
              <h2>Lire les couches</h2>
              <span>COMPOSITION FICTIVE / HORS ÉCHELLE</span>
            </div>
            <div className="fwells-poster">
              <Poster s={s} view={view} />
            </div>
            <nav aria-label="Vue des couches">
              {[
                ["both", "Superposition"],
                ["1", "Couche 1"],
                ["2", "Couche 2"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  {l}
                </button>
              ))}
            </nav>
            <div className="fwells-inks">
              {s.colors.map((c, i) => (
                <div key={i}>
                  <label className="fwells-color">
                    <input
                      type="color"
                      aria-label={`Couleur écran couche ${i + 1}`}
                      value={c}
                      onChange={(e) =>
                        edit(
                          "colors",
                          s.colors.map((x, j) =>
                            i === j ? e.target.value : x,
                          ),
                        )
                      }
                    />
                    <span>
                      ENCRE {i + 1}
                      <small>{c.toUpperCase()}</small>
                    </span>
                  </label>
                  <label>
                    Référence ou intention
                    <input
                      value={s.refs[i]}
                      maxLength="90"
                      onChange={(e) =>
                        edit(
                          "refs",
                          s.refs.map((x, j) => (i === j ? e.target.value : x)),
                        )
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
            <p className="fwells-proof-note">
              Les vues séparées montrent chaque couche en noir. Le mélange à
              l’écran est illustratif et ne prédit pas le rendu des encres sur
              papier.
            </p>
          </section>
          <aside className="fwells-preparation">
            <h2>Fichiers à préparer</h2>
            <p>CHECKLIST DÉCLARATIVE</p>
            {checks.map(([k, l, d]) => (
              <label key={k}>
                <input
                  type="checkbox"
                  checked={s.checked[k]}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setS((x) => ({
                      ...x,
                      checked: { ...x.checked, [k]: checked },
                    }));
                    setMessage("Déclaration de préparation actualisée.");
                  }}
                />
                <span>
                  <b>{l}</b>
                  <small>{d}</small>
                </span>
              </label>
            ))}
            <div className="fwells-readiness">
              <div>
                <h3>
                  {count === 6
                    ? "Déclarations complètes"
                    : "Encore un peu de préparation"}
                </h3>
                <strong>
                  {count}
                  <i>/6</i>
                </strong>
              </div>
              <progress
                value={count}
                max="6"
                aria-label={`${count} déclarations sur 6`}
              />
              {count < 6 && (
                <p>
                  À préparer :{" "}
                  {checks
                    .filter(([k]) => !s.checked[k])
                    .map(([, l]) => l.toLowerCase())
                    .join(", ")}
                  .
                </p>
              )}
              {!valid(s) && (
                <p role="alert">
                  Complétez le titre, le support, les références, une date
                  valide, un format de 0,01 à 200 cm et une quantité entière de
                  1 à 100 000.
                </p>
              )}
              <button disabled={!ready(s)} onClick={exportBrief}>
                Exporter le brief ↓
              </button>
              <small>
                Le brief ne contient ni PDF ni fichier séparé. Il reprend
                seulement vos paramètres et déclarations.
              </small>
            </div>
          </aside>
        </div>
        <p role="status" className="fwells-status">
          {message ||
            "Passez sur « Couche 1 » puis « Couche 2 » pour lire les deux séparations de l’exemple."}
        </p>
      </main>
      <DemoFooter>
        Les règles de préparation reprennent les recommandations publiques de
        Fwells. Aucun fichier d’impression n’est analysé. Couleurs écran et
        superposition sont illustratives ; le brief doit être relu avec
        l’atelier.
      </DemoFooter>
    </div>
  );
}
