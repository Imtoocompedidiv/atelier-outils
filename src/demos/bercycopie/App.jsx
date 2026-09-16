import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import { products, destinations, safeTarget, fragment } from "./model.js";
import "./styles.css";
function Sample({ index }) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true">
      {index === 3 ? (
        <g>
          <ellipse cx="61" cy="61" rx="25" ry="38" fill="#bcc3c6" />
          <ellipse cx="61" cy="61" rx="16" ry="28" fill="#f7f8f9" />
          <path
            d="M70 24H130L106 98H70Q108 60 70 24Z"
            fill="#e7ecee"
            stroke="#b4bec2"
          />
        </g>
      ) : index === 4 ? (
        <g>
          <ellipse cx="80" cy="77" rx="50" ry="27" fill="#333" />
          <ellipse cx="80" cy="68" rx="50" ry="27" fill="#5d6265" />
        </g>
      ) : (
        <g>
          <path
            d="M23 35L125 14L142 84L41 108Z"
            fill={index === 2 ? "#eef6f480" : "#e7ebee"}
            stroke="#b7c4c4"
          />
          <path d="M23 35L41 108L36 112L18 39Z" fill="#bac1c4" />
          <path d="M41 108L142 84L137 89L36 112Z" fill="#929fa6" />
          {index === 2 && (
            <path
              d="M35 42L130 22M47 104L138 83"
              stroke="#fff"
              strokeWidth="3"
            />
          )}
        </g>
      )}
    </svg>
  );
}
export default function App() {
  useDocumentTitle("BercyCopie · Liens produits");
  const [rows, setRows] = useState(products.map((x) => ({ ...x }))),
    [selected, setSelected] = useState(2),
    [message, setMessage] = useState("");
  const row = rows[selected],
    count = rows.filter((x) => safeTarget(x.target)).length;
  function choose(value) {
    setRows((a) =>
      a.map((x, i) => (i === selected ? { ...x, target: value } : x)),
    );
    setMessage(
      "Destination de travail actualisée. Le site public reste inchangé.",
    );
  }
  function exportPlan() {
    downloadCsv(
      "bercycopie-plan-liens.csv",
      ["Support", "Ancienne adresse", "Nouvelle adresse proposée", "État"],
      rows.map((x) => [
        x.name,
        x.old,
        x.target,
        safeTarget(x.target) ? "Destination choisie, à valider" : "À choisir",
      ]),
    );
    setMessage("Plan de remplacement téléchargé.");
  }
  return (
    <div className="bercycopie-app">
      <DemoNotice company="BercyCopie" />
      <header className="bercycopie-header">
        <b>
          Bercy<span>Copie</span>
        </b>
        <p>
          IMPRESSION GRAND FORMAT <br />
          SIGNALÉTIQUE & DÉCOUPE
        </p>
        <button
          onClick={() => {
            setRows(products.map((x) => ({ ...x })));
            setSelected(2);
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <div className="bercycopie-title">
        <div>
          <span>PARCOURS PRODUIT · ÉTUDE DE CORRECTION</span>
          <h1>
            Du support <br />à la bonne fiche.
          </h1>
        </div>
        <p>
          Une destination lisible. <br />
          Un client qui peut poursuivre <br />
          jusqu’à sa demande de devis.
        </p>
      </div>
      <main>
        <div className="bercycopie-work">
          <section className="bercycopie-list">
            <h2>Cinq supports à revoir</h2>
            {rows.map((x, i) => (
              <button
                key={x.name}
                className={selected === i ? "selected" : ""}
                onClick={() => setSelected(i)}
              >
                <Sample index={i} />
                <span>
                  <strong>{x.name}</strong>
                  <small>{x.type}</small>
                  <i>
                    {safeTarget(x.target)
                      ? "✓ Destination proposée"
                      : "○ À choisir"}
                  </i>
                </span>
              </button>
            ))}
          </section>
          <section className="bercycopie-detail">
            <div className="bercycopie-product">
              <Sample index={selected} />
              <div>
                <small>SUPPORT {selected + 1} / 5</small>
                <h2>{row.name}</h2>
                <p>{row.type}</p>
              </div>
            </div>
            <div className="bercycopie-old">
              <span>ADRESSE À REMPLACER DANS L’EXEMPLE</span>
              <code>{row.old}</code>
              <p>
                Une adresse localhost vise l’ordinateur du visiteur. Elle ne
                mène pas à votre fiche publique.
              </p>
            </div>
            <div className="bercycopie-new">
              <label>
                Destination proposée
                <select
                  value={
                    destinations.some((x) => x[1] === row.target)
                      ? row.target
                      : "custom"
                  }
                  onChange={(e) => choose(e.target.value)}
                >
                  {destinations.map(([label, url]) => (
                    <option key={label} value={url}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p>
                {selected === 2 || selected === 4
                  ? "La fiche dédiée n’a pas été vérifiée. Un renvoi vers Devis peut être proposé après votre accord."
                  : "La fiche dédiée existe dans le catalogue public consulté le 16 septembre 2026."}
              </p>
              {row.target && <code>{row.target}</code>}
            </div>
            <div className="bercycopie-path">
              <span>Découpe sur mesure</span>
              <b>→</b>
              <strong>{row.name}</strong>
              <b>→</b>
              <span>
                {row.target
                  ? row.target.endsWith("/devis/")
                    ? "Demande de devis"
                    : "Fiche publique"
                  : "Destination à choisir"}
              </span>
            </div>
            <p className="bercycopie-note">
              Ce plan prépare une correction de contenu. La démo ne vérifie pas
              les codes HTTP en direct et ne publie aucune modification.
            </p>
          </section>
        </div>
        <section className="bercycopie-export">
          <div>
            <span>
              <strong>{count}</strong> / 5 destinations proposées
            </span>
            <progress max="5" value={count} />
            <small>Validation éditoriale requise avant intégration.</small>
          </div>
          <div>
            <button onClick={exportPlan}>Exporter le plan CSV ↓</button>
            <button
              disabled={count !== 5}
              onClick={() => {
                downloadText(
                  "bercycopie-liens-proposes.html",
                  fragment(rows),
                  "text/html;charset=utf-8",
                );
                setMessage(
                  "Fragment HTML téléchargé. À relire et intégrer par la personne qui maintient le site.",
                );
              }}
            >
              Exporter le fragment HTML ↓
            </button>
          </div>
        </section>
        <p role="status">
          {message ||
            "Choisissez les destinations pour Plexiglas et Magnets pour compléter le fragment."}
        </p>
      </main>
      <DemoFooter>
        Les adresses de travail ne sont pas des liens cliquables. Les exports
        restent sur votre appareil et ne modifient pas BercyCopie.
      </DemoFooter>
    </div>
  );
}
