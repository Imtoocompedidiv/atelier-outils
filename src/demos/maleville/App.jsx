import React, { useState } from "react";
import "@fontsource/spectral/latin-400.css";
import "@fontsource/spectral/latin-500.css";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText } from "../../shared/files.js";
import { initial, crates, assign, review } from "./model.js";
import "./styles.css";
function Elevation({ room, selected, onSelect }) {
  const prefix = room === "Salon" ? "S" : "B";
  const shapes = [
    [65, 55, 12, 310],
    [343, 55, 12, 310],
    [77, 55, 266, 12],
    [77, 353, 266, 12],
    [77, 156, 266, 10],
    [77, 252, 266, 10],
  ];
  return (
    <svg
      viewBox="0 0 420 415"
      role="img"
      aria-label={`Élévation illustrative de la bibliothèque du ${room.toLowerCase()}`}
    >
      <g fill="none" stroke="#b5b1aa">
        <path d="M44 55V365 M38 55H50 M38 365H50 M65 390H355 M65 384V396 M355 384V396" />
        <path d="M77 67H343V353H77Z" strokeDasharray="3 4" />
      </g>
      {shapes.map(([x, y, w, h], i) => {
        const id = prefix + String(i + 1).padStart(2, "0");
        return (
          <g key={id}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={selected === id ? "#272727" : "#dedbd5"}
              stroke="#7d7972"
            />
            <text
              x={i === 0 ? 57 : i === 1 ? 365 : 210}
              y={y + (i < 2 ? 140 : -8)}
              textAnchor="middle"
              fontSize="10"
              fill="#514e49"
            >
              {id}
            </text>
          </g>
        );
      })}
      <text x="210" y="412" textAnchor="middle" fontSize="9" letterSpacing="2">
        ÉLÉVATION D’INTENTION · HORS ÉCHELLE
      </text>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Maleville · Le repère jusqu’à la pose");
  const [pieces, setPieces] = useState(structuredClone(initial));
  const [room, setRoom] = useState("Salon");
  const [selected, setSelected] = useState("S06");
  const [message, setMessage] = useState("");
  const state = review(pieces);
  const piece = pieces.find((p) => p.id === selected);
  function move(crate) {
    const result = assign(pieces, selected, crate);
    setPieces(result.pieces);
    setMessage(
      result.error ||
        `${selected} ${crate ? `affecté à la caisse ${crate}` : "retiré de sa caisse"}. Pointage à confirmer.`,
    );
  }
  function exportManifest() {
    downloadCsv(
      "maleville-manifeste-exemple.csv",
      [
        "Projet",
        "Repère",
        "Désignation",
        "Pièce",
        "Dimensions indicatives mm",
        "Caisse",
        "Pointage déclaré",
      ],
      pieces.map((p) => [
        "Bibliothèques R-026",
        p.id,
        p.name,
        p.room,
        p.dimensions,
        p.crate,
        p.checked ? "Oui" : "Non",
      ]),
    );
    setMessage("Manifeste téléchargé.");
  }
  return (
    <div className="maleville-app">
      <DemoNotice company="Maleville" />
      <header className="maleville-header">
        <b>
          MALEVILLE<span>MENUISERIE · ÉBÉNISTERIE D’ART</span>
        </b>
        <span>DU MONTAGE À BLANC À LA POSE</span>
        <button
          onClick={() => {
            setPieces(structuredClone(initial));
            setSelected("S06");
            setRoom("Salon");
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="maleville-heading">
          <div>
            <p className="maleville-kicker">CARNET DE REPÉRAGE / R-026</p>
            <h1>
              Chaque élément, <br />à sa place.
            </h1>
            <p>
              Deux bibliothèques. Douze repères. Un manifeste pour les
              retrouver.
            </p>
          </div>
          <div className="maleville-counter">
            <strong>
              {state.checked}
              <i>/12</i>
            </strong>
            <span>ÉLÉMENTS POINTÉS</span>
          </div>
        </div>
        <div className="maleville-work">
          <section className="maleville-plan">
            <nav aria-label="Pièce du projet">
              {["Salon", "Bureau"].map((r) => (
                <button
                  key={r}
                  aria-pressed={room === r}
                  onClick={() => {
                    setRoom(r);
                    setSelected(r === "Salon" ? "S01" : "B01");
                  }}
                >
                  {r}
                </button>
              ))}
            </nav>
            <Elevation room={room} selected={selected} />
            <p>
              Repère sélectionné <b>{selected}</b> <br />
              La géométrie illustre le dossier. Elle ne remplace pas un plan
              d’exécution.
            </p>
          </section>
          <section className="maleville-inventory">
            <h2>
              Nomenclature <span>{room}</span>
            </h2>
            <div className="maleville-piece-list">
              {pieces
                .filter((p) => p.room === room)
                .map((p) => (
                  <button
                    key={p.id}
                    className={selected === p.id ? "selected" : ""}
                    onClick={() => setSelected(p.id)}
                  >
                    <b>{p.id}</b>
                    <span>
                      {p.name}
                      <small>{p.dimensions} mm</small>
                    </span>
                    <i>
                      {p.checked
                        ? "✓"
                        : p.crate
                          ? `C. ${p.crate}`
                          : "À affecter"}
                    </i>
                  </button>
                ))}
            </div>
            <div className="maleville-editor">
              <span>ÉLÉMENT {piece.id}</span>
              <h3>{piece.name}</h3>
              <label>
                Affectation à une caisse
                <select
                  value={piece.crate}
                  onChange={(e) => move(e.target.value)}
                >
                  <option value="">Sans caisse</option>
                  {crates.map((c) => (
                    <option key={c.id} value={c.id}>
                      Caisse {c.id} · {c.room}
                    </option>
                  ))}
                </select>
              </label>
              <label className="maleville-check">
                <input
                  type="checkbox"
                  disabled={!piece.crate}
                  checked={piece.checked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setPieces((p) =>
                      p.map((x) => (x.id === selected ? { ...x, checked } : x)),
                    );
                    setMessage(
                      `${selected} ${checked ? "pointé" : "à pointer"}.`,
                    );
                  }}
                />
                Repère et présence dans la caisse vérifiés
              </label>
            </div>
          </section>
          <aside className="maleville-crates">
            <h2>Préparation des caisses</h2>
            {crates.map((c) => {
              const contents = pieces.filter((p) => p.crate === c.id);
              return (
                <article key={c.id}>
                  <div>
                    <b>{c.id}</b>
                    <span>
                      {c.room}
                      <small>
                        {contents.length} / {c.capacity} éléments
                      </small>
                    </span>
                  </div>
                  <p>
                    {contents.map((p) => p.id).join(" · ") || "Aucun élément"}
                  </p>
                  <span>
                    {contents.filter((p) => p.checked).length} pointés
                  </span>
                </article>
              );
            })}
            <p>
              Capacités d’exemple exprimées en nombre d’éléments. Aucun calcul
              de poids, de calage ou de résistance.
            </p>
          </aside>
        </div>
        <section className="maleville-export">
          <div>
            <h2>
              {state.ready
                ? "Le manifeste est prêt."
                : `${12 - state.assigned} repères à affecter, ${12 - state.checked} à pointer.`}
            </h2>
            <p>Les changements de caisse demandent un nouveau pointage.</p>
          </div>
          <div>
            <button disabled={!state.ready} onClick={exportManifest}>
              Télécharger le manifeste ↓
            </button>
            <button
              disabled={!state.ready}
              onClick={() => {
                downloadText(
                  "maleville-etiquettes-caisses.txt",
                  crates
                    .map(
                      (c) =>
                        `MALEVILLE · EXEMPLE INDÉPENDANT\nPROJET R-026 / CAISSE ${c.id} / ${c.room.toUpperCase()}\n${pieces
                          .filter((p) => p.crate === c.id)
                          .map((p) => `${p.id} — ${p.name}`)
                          .join("\n")}\nPointage déclaré, données fictives.`,
                    )
                    .join("\n\n────────────────────\n\n"),
                );
                setMessage("Liste des étiquettes téléchargée.");
              }}
            >
              Exporter les étiquettes texte
            </button>
          </div>
        </section>
        <p role="status" className="maleville-status">
          {message ||
            "Sélectionnez un repère dans la nomenclature pour compléter son affectation."}
        </p>
      </main>
      <DemoFooter>
        Les bibliothèques et caisses sont fictives. Le pointage est une
        déclaration humaine ; ce prototype ne contrôle pas physiquement le
        colis.
      </DemoFooter>
    </div>
  );
}
