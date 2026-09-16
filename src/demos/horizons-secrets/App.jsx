import React, { useState } from "react";
import "@fontsource/lato/latin-400.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadJson, downloadText } from "../../shared/files.js";
import {
  makeExample,
  validateCards,
  documentFor,
  readableDocument,
  isCalendarDate,
} from "./model.js";
import "./styles.css";

function EnvelopePreview({ document, isPreparation }) {
  const date =
    !isPreparation &&
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(
      new Date(document.date + "T12:00:00"),
    );
  return (
    <div className="horizons-secrets-paper">
      <div className="horizons-secrets-paper-brand">Horizons Secrets</div>
      <div className="horizons-secrets-paper-rule" />
      <p>{isPreparation ? "Avant le départ" : document.document}</p>
      {isPreparation ? (
        <>
          <h2>Le voyage commence bientôt.</h2>
          <p className="horizons-secrets-instruction">{document.preparation}</p>
          <ul>
            {document.ouvertureDesEnveloppes.map((c, index) => (
              <li key={index}>
                Enveloppe {c.number}
                <span>
                  {c.date} à {c.time}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <small>À ouvrir le</small>
          <h2>{date}</h2>
          <p>{document.time}</p>
          <div className="horizons-secrets-paper-rule" />
          <p className="horizons-secrets-instruction">{document.instruction}</p>
        </>
      )}
      <div className="horizons-secrets-paper-end">
        Un voyage imaginaire, pour essayer l’atelier.
      </div>
    </div>
  );
}
export default function App() {
  useDocumentTitle("Chaque indice, au bon moment");
  const [state, setState] = useState(makeExample),
    [selected, setSelected] = useState("eau"),
    [status, setStatus] = useState("");
  const preparation = selected === "preparation",
    card = state.cards.find((c) => c.id === selected),
    errors = validateCards(state.cards);
  const document = documentFor(state, selected);
  const update = (key, value) =>
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) =>
        c.id === selected ? { ...c, [key]: value } : c,
      ),
    }));
  const reset = () => {
    setState(makeExample());
    setSelected("eau");
    setStatus("Exemple réinitialisé.");
  };
  const exportDoc = (json) => {
    if (errors.length) return;
    const name = preparation
      ? "carnet-avant-depart"
      : "enveloppe-" + card.number;
    json
      ? downloadJson(name + ".json", document)
      : downloadText(name + ".txt", readableDocument(document));
    setStatus("Le fichier contient uniquement le document sélectionné.");
  };
  return (
    <div className="horizons-secrets-app">
      <DemoNotice company="Horizons Secrets" />
      <header className="horizons-secrets-header">
        <span>Horizons Secrets</span>
        <button onClick={reset}>Réinitialiser</button>
      </header>
      <main className="horizons-secrets-desk">
        <nav className="horizons-secrets-rail" aria-label="Choisir un document">
          {state.cards.map((c) => (
            <button
              key={c.id}
              aria-pressed={selected === c.id}
              onClick={() => setSelected(c.id)}
            >
              <strong>{String(c.number).padStart(2, "0")}</strong>
              <span>
                Enveloppe {String(c.number).padStart(2, "0")}
                <small>{c.title}</small>
              </span>
            </button>
          ))}
          <button
            className="horizons-secrets-book"
            aria-pressed={preparation}
            onClick={() => setSelected("preparation")}
          >
            <span>
              Carnet avant départ<small>Informations et calendrier</small>
            </span>
          </button>
        </nav>
        <section className="horizons-secrets-editor">
          <h1>
            Chaque indice, <br />
            au bon moment
          </h1>
          <p className="horizons-secrets-intro">
            Rédigez votre document, puis vérifiez ce qui sera remis au voyageur.
          </p>
          {preparation ? (
            <label>
              Informations de préparation
              <textarea
                rows="7"
                value={state.preparation}
                onChange={(e) =>
                  setState((s) => ({ ...s, preparation: e.target.value }))
                }
              />
            </label>
          ) : (
            <>
              <div className="horizons-secrets-fields">
                <label>
                  Numéro
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={card.number}
                    onChange={(e) => update("number", Number(e.target.value))}
                  />
                </label>
                <label>
                  Ouvrir le
                  <input
                    type="date"
                    value={card.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </label>
                <label>
                  Heure
                  <input
                    type="time"
                    value={card.time}
                    onChange={(e) => update("time", e.target.value)}
                  />
                </label>
              </div>
              <label>
                Instruction
                <textarea
                  rows="7"
                  value={card.instruction}
                  maxLength={700}
                  onChange={(e) => update("instruction", e.target.value)}
                />
              </label>
              <small className="horizons-secrets-count">
                {card.instruction.length} / 700
              </small>
            </>
          )}
          <div className="horizons-secrets-note">
            Le carnet de préparation rassemble les horaires d’ouverture. Le
            texte des enveloppes reste dans leurs fichiers séparés.
          </div>
          {errors.length > 0 && (
            <div role="alert" className="horizons-secrets-errors">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
        </section>
        <section
          className="horizons-secrets-preview"
          aria-label="Aperçu du document"
        >
          <div className="horizons-secrets-preview-label">
            <span>Aperçu du document</span>
            <span>{preparation ? "Carnet" : document.document + " / 4"}</span>
          </div>
          {card && !isCalendarDate(card.date) ? (
            <p>Choisissez une date valide pour l’aperçu.</p>
          ) : (
            <EnvelopePreview document={document} isPreparation={preparation} />
          )}
        </section>
      </main>
      <div className="horizons-secrets-actions">
        <span role="status">{status}</span>
        <button disabled={errors.length > 0} onClick={() => window.print()}>
          Imprimer
        </button>
        <button onClick={() => exportDoc(true)} disabled={errors.length > 0}>
          Exporter JSON
        </button>
        <button
          className="horizons-secrets-primary"
          onClick={() => exportDoc(false)}
          disabled={errors.length > 0}
        >
          {preparation ? "Exporter le carnet" : "Exporter la carte"}
        </button>
      </div>
      <DemoFooter>
        Atelier interne avec un voyage fictif. Le fichier exporté contient
        uniquement le document sélectionné. Rien n’est envoyé.
      </DemoFooter>
    </div>
  );
}
