import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { initialItems, assess } from "./model.js";
import "./styles.css";

function Sketch({ kind }) {
  return (
    <svg viewBox="0 0 100 86" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      >
        {kind === "barnum" ? (
          <>
            <path d="M10 32 50 8 90 32Z M10 32V78 M90 32V78 M17 32V77 M83 32V77 M50 8 34 32 M50 8 66 32" />
            <path d="M17 75H83" opacity=".3" />
          </>
        ) : kind === "lest" ? (
          <>
            <path d="m20 30 26-8 14 8-26 9Z M20 30v39l14 8V39 M34 77l26-9V30 M46 42l22-7 13 8-22 7Z M46 42v31l13 7V50 M59 80l22-8V43" />
          </>
        ) : kind === "chaise" ? (
          <>
            <path d="M25 12v37h46V12 M25 12h46 M31 19h34v22H31Z M22 51h52v8H22Z M27 59l-7 21 M68 59l8 21 M32 59v17 M63 59v17" />
          </>
        ) : (
          <>
            <path d="m10 30 59-9 21 15-60 9Z M10 30v6l20 14 60-9v-5 M25 49l-6 28 M77 45l8 28 M37 48l8 27 M65 44 54 72" />
          </>
        )}
      </g>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Velvet · Fiche de départ");
  const [items, setItems] = useState(initialItems.map((x) => ({ ...x }))),
    [event, setEvent] = useState("Dîner à Écully"),
    [date, setDate] = useState("2026-09-26"),
    [ratio, setRatio] = useState(4),
    [message, setMessage] = useState("");
  const state = assess(items, ratio);
  const change = (id, v) => {
    setItems((xs) =>
      xs.map((x) =>
        x.id === id ? { ...x, quantity: v === "" ? NaN : Number(v) } : x,
      ),
    );
    setMessage("");
  };
  const exportSheet = () => {
    downloadCsv(
      "velvet-fiche-depart.csv",
      [
        "Événement",
        "Date",
        "Article",
        "Quantité",
        "Prix unitaire exemple EUR",
        "Total exemple EUR",
      ],
      items.map((x) => [
        event,
        date,
        x.name,
        x.quantity,
        (x.price / 100).toFixed(2),
        ((x.price * x.quantity) / 100).toFixed(2),
      ]),
    );
    setMessage("Fiche de départ téléchargée.");
  };
  return (
    <div className="velvet-rendez-vous">
      <DemoNotice company="Velvet Rendez-Vous" />
      <header className="vr-header">
        <strong>Velvet Rendez-Vous</strong>
        <button
          onClick={() => {
            setItems(initialItems.map((x) => ({ ...x })));
            setRatio(4);
            setEvent("Dîner à Écully");
            setDate("2026-09-26");
            setMessage("Exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="vr-workspace">
        <section className="vr-list">
          <div className="vr-intro">
            <div>
              <h1>
                Tout est prêt <br />
                pour samedi ?
              </h1>
              <p>
                Les décors choisis, leurs accessoires et une fiche claire pour
                le départ.
              </p>
            </div>
            <div className="vr-drawing">
              <Sketch kind="barnum" />
              <small>Une réception à préparer</small>
            </div>
          </div>
          <h2>La sélection</h2>
          <p className="vr-caption">
            Quantités et tarifs fictifs, librement modifiables pour tester.
          </p>
          <div className="vr-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Décor</th>
                  <th>Prix exemple</th>
                  <th>Quantité</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <div className="vr-product">
                        <Sketch kind={x.id} />
                        <div>
                          <strong>{x.name}</strong>
                          <small>{x.detail}</small>
                          {x.id === "lest" && state.missing > 0 && (
                            <span className="vr-alert-text">
                              {state.missing} accessoire
                              {state.missing > 1 ? "s" : ""} à ajouter
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{euro(x.price)}</td>
                    <td>
                      <input
                        aria-label={`Quantité ${x.name}`}
                        type="number"
                        min="0"
                        max="10000"
                        step="1"
                        value={Number.isNaN(x.quantity) ? "" : x.quantity}
                        onChange={(e) => change(x.id, e.target.value)}
                      />
                    </td>
                    <td>
                      {Number.isFinite(x.quantity)
                        ? euro(x.price * x.quantity)
                        : "À préciser"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <details>
            <summary>La règle d’accessoires utilisée dans cet exemple</summary>
            <label>
              Lests par barnum{" "}
              <input
                type="number"
                min="1"
                max="20"
                value={ratio}
                onChange={(e) =>
                  setRatio(
                    Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                  )
                }
              />
            </label>
            <p>
              Ratio pédagogique à définir par l’équipe selon son matériel et ses
              consignes. Ce calcul ne dimensionne pas le lestage et ne vaut pas
              validation de sécurité.
            </p>
          </details>
        </section>
        <aside className="vr-docket">
          <h2>Départ atelier</h2>
          <label>
            Événement
            <input
              value={event}
              maxLength="120"
              onChange={(e) => setEvent(e.target.value)}
            />
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <div
            className={`vr-verdict ${state.missing || state.invalid ? "vr-review" : "vr-ready"}`}
            role="status"
          >
            <strong>
              {state.invalid
                ? "Quantités à corriger"
                : state.missing
                  ? "Un détail à compléter"
                  : "La sélection est complète"}
            </strong>
            <p>
              {state.invalid
                ? "Utilisez des nombres entiers entre 0 et 10 000."
                : state.missing
                  ? `${state.missing} accessoire${state.missing > 1 ? "s" : ""} manque${state.missing > 1 ? "nt" : ""} selon la règle de cet exemple.`
                  : "Vous pouvez télécharger la fiche et préparer le départ."}
            </p>
          </div>
          <dl>
            <div>
              <dt>Pièces à préparer</dt>
              <dd>{state.invalid ? "—" : state.pieces}</dd>
            </div>
            <div>
              <dt>Sous-total fictif HT</dt>
              <dd>{state.invalid ? "—" : euro(state.subtotal)}</dd>
            </div>
          </dl>
          <button
            className="vr-primary"
            disabled={state.invalid || !state.missing}
            onClick={() => {
              setItems((xs) =>
                xs.map((x) =>
                  x.id === "lest"
                    ? { ...x, quantity: x.quantity + state.missing }
                    : x,
                ),
              );
              setMessage(
                "Accessoires complétés selon la règle de démonstration.",
              );
            }}
          >
            Compléter les accessoires
          </button>
          <button
            className="vr-export"
            disabled={
              state.invalid || state.missing > 0 || !event.trim() || !date
            }
            onClick={exportSheet}
          >
            Exporter la fiche
          </button>
          <p aria-live="polite">{message}</p>
          <small>
            Aucune disponibilité réelle n’est vérifiée. La validation atelier
            reste nécessaire.
          </small>
        </aside>
      </main>
      <DemoFooter />
    </div>
  );
}
