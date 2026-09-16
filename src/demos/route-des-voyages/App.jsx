import React, { useState } from "react";
import "@fontsource/asul/latin-400.css";
import "@fontsource/asul/latin-700.css";
import "@fontsource/lexend/latin-400.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, downloadText, euro } from "../../shared/files.js";
import { original, makeRevision, compare, changeRows, cents } from "./model.js";
import "./styles.css";
const labels = {
  destination: "Destination",
  hotel: "Hébergement",
  nights: "Nuits",
  budget: "Budget (€)",
  activity: "Activité",
};
function InitialStep({ step }) {
  return step ? (
    <>
      <strong>{step.hotel}</strong>
      <div className="route-des-voyages-original-numbers">
        <span>{step.nights} nuits</span>
        <span>{euro(cents(step.budget))}</span>
      </div>
      <small>{step.activity}</small>
    </>
  ) : (
    <p className="route-des-voyages-added">Nouvelle étape</p>
  );
}
function RevisedStep({ step, before, onChange, onRemove }) {
  return (
    <>
      <div className="route-des-voyages-edit-fields">
        {!before && (
          <label className="route-des-voyages-wide">
            Destination
            <input
              value={step.destination}
              onChange={(e) => onChange("destination", e.target.value)}
            />
          </label>
        )}
        <label className="route-des-voyages-wide">
          Hébergement
          <input
            className={
              before && before.hotel !== step.hotel
                ? "route-des-voyages-changed"
                : ""
            }
            value={step.hotel}
            onChange={(e) => onChange("hotel", e.target.value)}
          />
        </label>
        <label>
          Nuits
          <input
            aria-label={"Nuits à " + step.destination}
            inputMode="numeric"
            value={step.nights}
            onChange={(e) => onChange("nights", e.target.value)}
          />
        </label>
        <label>
          Budget (€)
          <input
            aria-label={"Budget à " + step.destination}
            inputMode="decimal"
            value={step.budget}
            onChange={(e) => onChange("budget", e.target.value)}
          />
        </label>
      </div>
      <label className="route-des-voyages-activity">
        Activité
        <input
          value={step.activity}
          onChange={(e) => onChange("activity", e.target.value)}
        />
      </label>
      <button className="route-des-voyages-remove" onClick={onRemove}>
        Retirer cette étape
      </button>
    </>
  );
}
export default function App() {
  useDocumentTitle("Comparer un itinéraire");
  const [revision, setRevision] = useState(makeRevision),
    [only, setOnly] = useState(false),
    [notes, setNotes] = useState(""),
    [message, setMessage] = useState(""),
    [nextId, setNextId] = useState(1);
  const result = compare(original, revision),
    all = [
      ...new Set([...original.map((s) => s.id), ...revision.map((s) => s.id)]),
    ],
    ids = only
      ? all.filter((id) => result.changes.some((c) => c.id === id))
      : all;
  const update = (id, key, value) =>
    setRevision((s) =>
      s.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    );
  const reset = () => {
    setRevision(makeRevision());
    setOnly(false);
    setNotes("");
    setNextId(1);
    setMessage("Exemple réinitialisé.");
  };
  const add = () => {
    setRevision((s) => [
      ...s,
      {
        id: "new-" + nextId,
        destination: "Nouvelle escale",
        hotel: "Hébergement à préciser",
        nights: "1",
        budget: "0.00",
        activity: "",
      },
    ]);
    setNextId((n) => n + 1);
  };
  const exportChanges = (csv) => {
    if (result.errors.length) return;
    const rows = changeRows(result);
    if (csv)
      downloadCsv(
        "changements-itineraire.csv",
        ["Étape", "Modification", "Champ", "Avant", "Après"],
        rows,
      );
    else
      downloadText(
        "changements-itineraire.txt",
        [
          "Ouest américain : modifications proposées",
          "Itinéraire et montants fictifs",
          "",
          ...rows.map(
            (r) =>
              r[0] +
              " | " +
              r[1] +
              " | " +
              labels[r[2]] +
              " : " +
              (r[3] || "absent") +
              " > " +
              (r[4] || "absent"),
          ),
          "",
          "Écart de budget : " + euro(result.delta),
          "Durée : " +
            result.beforeNights +
            " > " +
            result.afterNights +
            " nuits",
          notes ? "Note : " + notes : "",
        ].join("\n"),
      );
    setMessage("Récapitulatif téléchargé. Aucun document n’a été envoyé.");
  };
  return (
    <div className="route-des-voyages-app">
      <DemoNotice company="La Route des Voyages" />
      <header className="route-des-voyages-header">
        <span>La Route des Voyages</span>
        <span>Ouest américain</span>
        <button onClick={reset}>Réinitialiser</button>
      </header>
      <main className="route-des-voyages-main">
        <h1>
          Le voyage a changé. <br />
          Voici où.
        </h1>
        <p>
          Comparez la version initiale à la nouvelle proposition. Modifiez les
          étapes de droite pour préparer votre récapitulatif.
        </p>
        <div className="route-des-voyages-summary" aria-live="polite">
          <div>
            <strong>{result.changes.length} étapes modifiées</strong>
            <small>Ajouts et retraits compris</small>
          </div>
          <div>
            <strong>
              {result.beforeNights} →{" "}
              {Number.isFinite(result.afterNights) ? result.afterNights : "?"}{" "}
              nuits
            </strong>
            <small>Durée du parcours</small>
          </div>
          <div>
            <strong>
              {result.errors.length
                ? "À vérifier"
                : (result.delta > 0 ? "+ " : "") + euro(result.delta)}
            </strong>
            <small>Écart entre les deux versions</small>
          </div>
        </div>
        <label className="route-des-voyages-filter">
          <input
            type="checkbox"
            checked={only}
            onChange={(e) => setOnly(e.target.checked)}
          />{" "}
          Montrer seulement les changements
        </label>
        <div className="route-des-voyages-table">
          <div className="route-des-voyages-table-head">
            <span>Étape</span>
            <h2>Version initiale</h2>
            <h2>Nouvelle version</h2>
          </div>
          {ids.map((id) => {
            const before = original.find((s) => s.id === id),
              after = revision.find((s) => s.id === id);
            return (
              <section className="route-des-voyages-row" key={id}>
                <h3>{before?.destination || after.destination}</h3>
                <div className="route-des-voyages-original">
                  <InitialStep step={before} />
                </div>
                <div className="route-des-voyages-revised">
                  {after ? (
                    <RevisedStep
                      step={after}
                      before={before}
                      onChange={(k, v) => update(id, k, v)}
                      onRemove={() =>
                        setRevision((s) => s.filter((r) => r.id !== id))
                      }
                    />
                  ) : (
                    <div className="route-des-voyages-deleted">
                      <p>Étape retirée de la proposition.</p>
                      <button
                        onClick={() =>
                          setRevision((s) => [...s, { ...before }])
                        }
                      >
                        Rétablir l’étape
                      </button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
          {!ids.length && (
            <p className="route-des-voyages-empty">
              Les deux versions sont identiques.
            </p>
          )}
        </div>
        <button className="route-des-voyages-add" onClick={add}>
          Ajouter une étape
        </button>
        <label className="route-des-voyages-notes">
          Note pour le récapitulatif
          <textarea
            value={notes}
            maxLength={600}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Précisez le motif d’une modification, si utile."
          />
        </label>
        {result.errors.length > 0 && (
          <div className="route-des-voyages-errors" role="alert">
            {result.errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
        <div className="route-des-voyages-actions">
          <span role="status">{message}</span>
          <button
            disabled={!!result.errors.length}
            onClick={() => exportChanges(true)}
          >
            Exporter CSV
          </button>
          <button
            className="route-des-voyages-primary"
            disabled={!!result.errors.length}
            onClick={() => exportChanges(false)}
          >
            Exporter les changements
          </button>
        </div>
      </main>
      <DemoFooter>
        Itinéraire, hébergements et montants fictifs. Le budget est celui des
        étapes saisies ; aucune disponibilité n’est vérifiée.
      </DemoFooter>
    </div>
  );
}
