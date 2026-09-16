import React, { useState } from "react";
import "@fontsource/fraunces/latin-400.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadJson, downloadCsv } from "../../shared/files.js";
import {
  makeDocuments,
  documentStatus,
  newVersion,
  review,
  manifest,
} from "./model.js";
import "./styles.css";
function DocIcon() {
  return (
    <svg
      width="23"
      height="27"
      viewBox="0 0 24 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 1h10l6 6v20H4zM14 1v7h6M8 14h8M8 19h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DocumentIndex({ documents, selected, onSelect }) {
  return (
    <nav className="terres-oubliees-index" aria-label="Documents du dossier">
      <h2>Documents du dossier</h2>
      {documents.map((d) => (
        <button
          key={d.id}
          onClick={() => onSelect(d.id)}
          aria-pressed={d.id === selected}
        >
          <DocIcon />
          <span>
            <strong>{d.name}</strong>
            <small>
              {documentStatus(d, documents).ready
                ? "Version relue"
                : "Relecture attendue"}
            </small>
          </span>
          <b>v{d.version}</b>
        </button>
      ))}
      <p>
        Une modification du plan de vols rend la référence de la lettre
        obsolète.
      </p>
    </nav>
  );
}
function ManifestPreview({ documents }) {
  return (
    <section className="terres-oubliees-folder">
      <div className="terres-oubliees-paper">
        <div className="terres-oubliees-paper-brand">Terres Oubliées</div>
        <h2>
          Manifeste
          <br />
          des documents
        </h2>
        <h3>Départ du 18 octobre</h3>
        <p className="terres-oubliees-ref">Dossier fictif TO-1810</p>
        <div className="terres-oubliees-manifest-head">
          <span>Document</span>
          <span>Version</span>
          <span>Relecture</span>
        </div>
        {documents.map((d) => {
          const s = documentStatus(d, documents);
          return (
            <div className="terres-oubliees-manifest-row" key={d.id}>
              <div>
                <strong>{d.name}</strong>
                <small>{d.description}</small>
              </div>
              <span>v{d.version}</span>
              <div
                className={
                  s.ready ? "terres-oubliees-ready" : "terres-oubliees-pending"
                }
              >
                <strong>{s.ready ? "À jour" : "À revoir"}</strong>
                <small>
                  {s.outdated.length
                    ? "Référence antérieure"
                    : s.selfPending
                      ? "Nouvelle version"
                      : "Version relue"}
                </small>
              </div>
            </div>
          );
        })}
        <p className="terres-oubliees-paper-note">
          Le manifeste répertorie les versions validées.
          <br />
          Il ne remplace pas les documents du voyage.
        </p>
      </div>
    </section>
  );
}
function ReviewPanel({ document, documents, onReview, onSave }) {
  const [draft, setDraft] = useState(document.content),
    state = documentStatus(document, documents),
    changed = draft !== document.content;
  return (
    <aside className="terres-oubliees-review">
      <h2>
        {state.outdated.length ? "Le plan de vols a changé" : document.name}
      </h2>
      {state.outdated.length ? (
        <>
          <p>
            La lettre fait encore référence au plan de vols v
            {document.references.vols}. La version disponible est maintenant v
            {documents.find((d) => d.id === "vols").version}.
          </p>
          <div className="terres-oubliees-warning">
            Relisez les informations d’arrivée avant de confirmer cette
            référence.
          </div>
          <div className="terres-oubliees-versions">
            <span>
              Référence relue<strong>v{document.references.vols}</strong>
            </span>
            <span>
              Version actuelle
              <strong>v{documents.find((d) => d.id === "vols").version}</strong>
            </span>
          </div>
        </>
      ) : (
        <p>
          {state.ready
            ? "Ce document est relu dans sa version actuelle."
            : "Le contenu a changé. Confirmez sa relecture avant l’export."}
        </p>
      )}
      <label>
        Texte d’exemple
        <textarea
          rows="5"
          value={draft}
          maxLength={1500}
          onChange={(e) => setDraft(e.target.value)}
        />
      </label>
      <button
        disabled={!changed || !draft.trim()}
        onClick={() => onSave(draft)}
      >
        Enregistrer une nouvelle version
      </button>
      <button
        className="terres-oubliees-primary"
        disabled={changed || state.ready}
        onClick={onReview}
      >
        {document.id === "lettre"
          ? "Valider la lettre relue"
          : "Confirmer la relecture"}
      </button>
      {changed && <small>Enregistrez d’abord vos modifications.</small>}
      <p className="terres-oubliees-small">
        La validation reste votre décision. L’outil suit les versions déclarées,
        sans analyser le contenu du document.
      </p>
    </aside>
  );
}
export default function App() {
  useDocumentTitle("Versions du dossier de départ");
  const [documents, setDocuments] = useState(makeDocuments),
    [selected, setSelected] = useState("lettre"),
    [message, setMessage] = useState("");
  const current = documents.find((d) => d.id === selected),
    ready = documents.every((d) => documentStatus(d, documents).ready);
  const receive = () => {
    setDocuments((ds) =>
      newVersion(
        ds,
        "vols",
        "Nouvelle version fictive reçue. Les références du trajet ont été modifiées.",
      ),
    );
    setSelected("lettre");
    setMessage(
      "Plan de vols mis à jour. La référence de la lettre doit être revue.",
    );
  };
  const exportManifest = (csv) => {
    if (!ready) return;
    const value = manifest(documents);
    csv
      ? downloadCsv(
          "manifeste-depart.csv",
          ["Document", "Version", "Références validées"],
          value.documents.map((d) => [
            d.name,
            d.version,
            Object.entries(d.validatedReferences)
              .map(([k, v]) => k + " v" + v)
              .join(", "),
          ]),
        )
      : downloadJson("manifeste-depart.json", value);
    setMessage(
      "Manifeste téléchargé. Aucun document publié dans un espace client.",
    );
  };
  return (
    <div className="terres-oubliees-app">
      <DemoNotice company="Terres Oubliées" />
      <header className="terres-oubliees-header">
        <span>Terres Oubliées</span>
        <span>Départ du 18 octobre</span>
        <button
          onClick={() => {
            setDocuments(makeDocuments());
            setSelected("lettre");
            setMessage("Exemple réinitialisé.");
          }}
        >
          Réinitialiser
        </button>
      </header>
      <main className="terres-oubliees-main">
        <h1>
          Le dossier de départ, <br />
          dans sa bonne version
        </h1>
        <p>
          Vérifiez les références des documents avant de préparer leur
          manifeste.
        </p>
        <div className="terres-oubliees-desk">
          <DocumentIndex
            documents={documents}
            selected={selected}
            onSelect={setSelected}
          />
          <ManifestPreview documents={documents} />
          <ReviewPanel
            key={current.id + "-" + current.version}
            document={current}
            documents={documents}
            onReview={() => {
              setDocuments((ds) => review(ds, selected));
              setMessage("Relecture confirmée pour la version actuelle.");
            }}
            onSave={(text) => {
              setDocuments((ds) => newVersion(ds, selected, text));
              setMessage("Nouvelle version enregistrée dans cette page.");
            }}
          />
        </div>
        <div className="terres-oubliees-actions">
          <button onClick={receive}>Nouvelle version du plan de vols</button>
          <span
            className={
              ready ? "terres-oubliees-ready" : "terres-oubliees-pending"
            }
            aria-live="polite"
          >
            {ready
              ? "Toutes les références sont à jour"
              : "Une relecture est attendue"}
          </span>
          <button disabled={!ready} onClick={() => exportManifest(true)}>
            Exporter CSV
          </button>
          <button
            className="terres-oubliees-primary"
            disabled={!ready}
            onClick={() => exportManifest(false)}
          >
            Exporter le manifeste
          </button>
        </div>
        <p className="terres-oubliees-message" role="status">
          {message}
        </p>
      </main>
      <DemoFooter>
        Documents fictifs et validations locales. Le manifeste suit des versions
        déclarées et ne certifie pas la faisabilité du voyage.
      </DemoFooter>
    </div>
  );
}
