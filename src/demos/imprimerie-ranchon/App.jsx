import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { formats, initial, assess } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Imprimerie Ranchon · Brief impression");
  const [f, setF] = useState(initial),
    [message, setMessage] = useState("");
  const p = assess(f),
    set = (key, value) => {
      setF((x) => ({ ...x, [key]: value }));
      setMessage("");
    };
  return (
    <div className="imprimerie-ranchon">
      <DemoNotice company="Imprimerie Ranchon" />
      <header className="rch-header">
        <strong>
          <small>IMPRIMERIE</small>RANCHON
          <i />
        </strong>
        <p>
          Le papier commence <br />
          par un bon brief.
        </p>
        <button
          onClick={() => {
            setF(initial);
            setMessage("Brief exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="rch-main">
        <section className="rch-form">
          <small>LE CARNET DE FABRICATION / ÉTAPE 01</small>
          <h1>
            Des idées. <br />
            Des pages. <br />
            <em>Un brief complet.</em>
          </h1>
          <p>
            Préparer une demande d’impression avec les informations qui changent
            le devis.
          </p>
          <div className="rch-fields">
            <label>
              Format fini
              <select
                value={f.format}
                onChange={(e) => set("format", e.target.value)}
              >
                {Object.entries(formats).map(([k, d]) => (
                  <option key={k} value={k}>
                    {k} · {d.join(" × ")} mm
                  </option>
                ))}
              </select>
            </label>
            <label>
              Exemplaires
              <input
                type="number"
                min="1"
                max="1000000"
                value={f.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
              />
            </label>
            <label>
              Pages, couverture comprise
              <input
                type="number"
                min="4"
                max="1000"
                value={f.pages}
                onChange={(e) => set("pages", Number(e.target.value))}
              />
            </label>
            <label>
              Papier intérieur
              <select
                value={f.paper}
                onChange={(e) => set("paper", Number(e.target.value))}
              >
                {[135, 170, 250].map((x) => (
                  <option key={x} value={x}>
                    {x} g/m²
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reliure
              <select
                value={f.binding}
                onChange={(e) => set("binding", e.target.value)}
              >
                <option>Piqûre à cheval</option>
                <option>Dos carré collé</option>
              </select>
            </label>
            <label>
              Finition de couverture
              <select
                value={f.finish}
                onChange={(e) => set("finish", e.target.value)}
              >
                <option>Sans pelliculage</option>
                <option>Pelliculage mat</option>
                <option>Pelliculage brillant</option>
              </select>
            </label>
            <label>
              Fichiers disponibles le
              <input
                type="date"
                value={f.artwork}
                onChange={(e) => set("artwork", e.target.value)}
              />
            </label>
            <label>
              Livraison souhaitée le
              <input
                type="date"
                value={f.delivery}
                onChange={(e) => set("delivery", e.target.value)}
              />
            </label>
          </div>
          <label className="rch-note">
            Ce qui mérite d’être précisé
            <textarea
              rows="3"
              value={f.note}
              onChange={(e) => set("note", e.target.value)}
            />
          </label>
          <p className="rch-limit">
            Délais et faisabilité à confirmer par l’imprimerie. Ce brief ne
            contrôle pas le PDF et ne remplace pas le bon à tirer.
          </p>
        </section>
        <section className="rch-proof">
          <div className="rch-project">
            <span>DOSSIER EXEMPLE</span>
            <strong>RCH / 026</strong>
            <p>
              BROCHURE <br />
              {f.format} · {f.pages || "—"} PAGES · {f.quantity || "—"} EX.
            </p>
          </div>
          <div className="rch-art">
            <div className="rch-cover">
              <small>
                ÉDITION <br />
                DE RENTRÉE
              </small>
              <b>
                Les idées <br />
                prennent <br />
                forme.
              </b>
              <span>09 / 2026</span>
              <i>R</i>
            </div>
            <div className="rch-format">
              <svg
                viewBox="0 0 220 295"
                role="img"
                aria-label={`Format fini ${p.dim[0]} par ${p.dim[1]} millimètres`}
              >
                <defs>
                  <marker
                    id="rch-arrow"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M0 0L10 5L0 10z" fill="#242424" />
                  </marker>
                </defs>
                <rect
                  x="50"
                  y="55"
                  width={(184 * p.dim[0]) / p.dim[1]}
                  height="184"
                  fill="#fff"
                  stroke="#222"
                />
                <line
                  x1="50"
                  y1="38"
                  x2={50 + (184 * p.dim[0]) / p.dim[1]}
                  y2="38"
                  stroke="#222"
                  markerStart="url(#rch-arrow)"
                  markerEnd="url(#rch-arrow)"
                />
                <text
                  x={50 + (92 * p.dim[0]) / p.dim[1]}
                  y="26"
                  textAnchor="middle"
                  fontSize="13"
                >
                  {p.dim[0]} mm
                </text>
                <line
                  x1="29"
                  y1="55"
                  x2="29"
                  y2="239"
                  stroke="#222"
                  markerStart="url(#rch-arrow)"
                  markerEnd="url(#rch-arrow)"
                />
                <text
                  transform="translate(15 150) rotate(-90)"
                  textAnchor="middle"
                  fontSize="13"
                >
                  {p.dim[1]} mm
                </text>
                <text
                  x={50 + (92 * p.dim[0]) / p.dim[1]}
                  y="150"
                  textAnchor="middle"
                  fontSize="19"
                >
                  {f.format}
                </text>
              </svg>
              <p>
                Le format fini <br />
                après façonnage
              </p>
            </div>
          </div>
          <div className="rch-specs">
            <h2>Repères du projet</h2>
            {[
              ["Papier", `${f.paper} g/m²`],
              ["Reliure", f.binding],
              ["Finition", f.finish],
              [
                "Masse papier indicative",
                p.mass === null
                  ? "Après correction du brief"
                  : `${p.mass.toFixed(1)} kg`,
              ],
            ].map(([k, v]) => (
              <div key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </div>
            ))}
            <p>
              Masse théorique avec le même papier sur toutes les pages. Hors
              gâche, colle, emballage et transport.
            </p>
          </div>
          <div
            className={p.valid ? "rch-feedback valid" : "rch-feedback"}
            role="status"
          >
            <strong>
              {p.valid
                ? "Les informations du brief sont cohérentes."
                : "Un détail à régler avant le devis."}
            </strong>
            {p.errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
            {f.binding === "Piqûre à cheval" &&
              f.pages % 4 !== 0 &&
              f.pages >= 4 &&
              f.pages < 1000 && (
                <button
                  onClick={() => set("pages", Math.ceil(f.pages / 4) * 4)}
                >
                  Passer à {Math.ceil(f.pages / 4) * 4} pages
                </button>
              )}
          </div>
          <button
            className="rch-export"
            disabled={!p.valid}
            onClick={() => {
              downloadText(
                "ranchon-brief-impression.txt",
                `BRIEF IMPRESSION / EXEMPLE\nPrototype indépendant pour Imprimerie Ranchon\n\nBrochure ${f.format}, ${p.dim.join(" × ")} mm\n${f.quantity} exemplaires\n${f.pages} pages couverture comprise\nPapier ${f.paper} g/m²\n${f.binding}\n${f.finish}\n\nFichiers disponibles le ${f.artwork}\nLivraison souhaitée le ${f.delivery}, à confirmer\n\n${f.note}\n\nMasse papier théorique ${p.mass.toFixed(1)} kg. Même papier sur toutes les pages, hors gâche, colle et emballage.\n\nFaisabilité, papier de couverture, délais et prix à confirmer. Aucun contrôle du PDF ni BAT effectué.`,
              );
              setMessage("Brief téléchargé. Prêt à accompagner les fichiers.");
            }}
          >
            ↓ Télécharger le brief impression
          </button>
          <p className="rch-message" role="status">
            {message}
          </p>
        </section>
      </main>
      <DemoFooter />
    </div>
  );
}
