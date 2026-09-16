import React, { useState } from "react";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadJson } from "../../shared/files.js";
import { documents, allowedDocuments, buildManifest } from "./model.js";
import "./styles.css";

export default function TalentInSight() {
  useDocumentTitle("Talent In Sight · Avant de transmettre");
  const [recipient, setRecipient] = useState("Atelier Horizon");
  const [approval, setApproval] = useState({
    recipient: "Atelier Horizon",
    confirmed: false,
  });
  const [chosen, setChosen] = useState(["cv", "parcours", "references"]);
  const [active, setActive] = useState("cv");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const allowed = allowedDocuments(chosen, recipient, approval);
  const activeDoc = allowed.find((d) => d.id === active) || allowed[0];
  const approved = approval.recipient === recipient && approval.confirmed;
  function choose(doc) {
    if (doc.internal) return;
    if (doc.restricted && !approved) {
      setNotice(
        "Le pitch reste exclu. Confirmez d’abord l’accord pour ce destinataire dans cet exemple.",
      );
      return;
    }
    setChosen((current) =>
      current.includes(doc.id)
        ? current.filter((id) => id !== doc.id)
        : [...current, doc.id],
    );
    setActive(doc.id);
  }
  function changeRecipient(value) {
    setRecipient(value);
    setApproval({ recipient: value, confirmed: false });
    setChosen((current) => current.filter((id) => id !== "pitch"));
    setNotice(
      "Le destinataire a changé. Le pitch est retiré et son accord doit être confirmé à nouveau.",
    );
  }
  async function exportManifest() {
    setExporting(true);
    try {
      const manifest = await buildManifest(chosen, recipient, approval);
      downloadJson("talent-in-sight-dossier-exemple.json", manifest);
      setNotice(
        `${manifest.files.length} pièces fictives exportées avec leur empreinte SHA-256. Aucune note interne ni transmission automatique.`,
      );
    } catch {
      setNotice(
        "Le manifeste n’a pas pu être préparé. Rechargez cette page puis réessayez.",
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="talent">
      <DemoNotice company="Talent In Sight" />
      <header className="talent-header">
        <a
          href="https://www.talent-in-sight.fr/"
          target="_blank"
          rel="noreferrer"
        >
          Talent <span>In Sight</span>
        </a>
        <p>Avant de transmettre</p>
        <button
          onClick={() => {
            setRecipient("Atelier Horizon");
            setApproval({ recipient: "Atelier Horizon", confirmed: false });
            setChosen(["cv", "parcours", "references"]);
            setActive("cv");
            setPreview(false);
            setNotice("Le dossier fictif a été rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main>
        <div className="talent-heading">
          <h1>Le dossier que verra votre client.</h1>
          <button
            className={preview ? "active" : ""}
            onClick={() => setPreview(!preview)}
            aria-pressed={preview}
          >
            {preview
              ? "Revenir à la préparation"
              : "Voir seulement le dossier client"}
          </button>
        </div>
        <div className={preview ? "talent-desk client-only" : "talent-desk"}>
          {!preview && (
            <section className="talent-files" aria-label="Pièces à partager">
              <h2>Choisir les pièces</h2>
              <p>
                Les fichiers de cet exemple sont fictifs. Seule votre sélection
                autorisée entre dans le manifeste.
              </p>
              {documents.map((doc) => (
                <div
                  className={
                    doc.internal ? "talent-file internal" : "talent-file"
                  }
                  key={doc.id}
                >
                  <span className="talent-file-type">{doc.type}</span>
                  <div>
                    <strong>{doc.title}</strong>
                    <small>
                      {doc.internal
                        ? "Toujours exclues du dossier client"
                        : doc.restricted && !approved
                          ? "Accord requis pour ce destinataire"
                          : doc.filename}
                    </small>
                  </div>
                  <button
                    className={
                      allowed.some((d) => d.id === doc.id)
                        ? "talent-toggle selected"
                        : "talent-toggle"
                    }
                    disabled={doc.internal}
                    aria-label={`${allowed.some((d) => d.id === doc.id) ? "Retirer" : "Ajouter"} ${doc.title}`}
                    aria-pressed={allowed.some((d) => d.id === doc.id)}
                    onClick={() => choose(doc)}
                  >
                    {allowed.some((d) => d.id === doc.id) ? "✓" : "+"}
                  </button>
                </div>
              ))}
            </section>
          )}
          <section className="talent-preview" aria-label="Aperçu client">
            <div className="talent-paper">
              <div className="talent-paper-brand">
                Talent <span>In Sight</span>
              </div>
              <p className="talent-for">Dossier préparé pour</p>
              <h2>{recipient}</h2>
              <div className="talent-person">
                <span>CP</span>
                <div>
                  <strong>C. P.</strong>
                  <p>
                    Ingénierie commerciale <br />
                    Exemple entièrement fictif
                  </p>
                </div>
              </div>
              <h3>Pièces incluses</h3>
              <ul className="talent-manifest">
                {allowed.map((doc) => (
                  <li key={doc.id}>
                    <button
                      className={activeDoc?.id === doc.id ? "selected" : ""}
                      onClick={() => setActive(doc.id)}
                    >
                      {doc.title}
                      <span>Lire l’exemple</span>
                    </button>
                  </li>
                ))}
              </ul>
              {!allowed.length && (
                <p className="talent-empty">
                  Le dossier est vide. Ajoutez au moins une pièce pour préparer
                  le manifeste.
                </p>
              )}
              {activeDoc && (
                <div className="talent-excerpt">
                  <h4>{activeDoc.title}</h4>
                  <pre>{activeDoc.content}</pre>
                </div>
              )}
              <p className="talent-paper-footer">
                {allowed.length} pièce(s) dans le dossier. Aucune note interne.
              </p>
            </div>
          </section>
          {!preview && (
            <aside className="talent-controls">
              <h2>Le bon destinataire</h2>
              <label>
                Entreprise fictive
                <select
                  value={recipient}
                  onChange={(e) => changeRecipient(e.target.value)}
                >
                  <option>Atelier Horizon</option>
                  <option>Maison Rivage</option>
                  <option>Groupe Aster, exemple</option>
                </select>
              </label>
              <div className="talent-consent">
                <label>
                  <input
                    type="checkbox"
                    checked={approved}
                    onChange={(e) => {
                      setApproval({ recipient, confirmed: e.target.checked });
                      if (!e.target.checked)
                        setChosen((current) =>
                          current.filter((id) => id !== "pitch"),
                        );
                      setNotice(
                        e.target.checked
                          ? "Accord de démonstration confirmé. Le pitch peut maintenant être ajouté."
                          : "Accord retiré. Le pitch est exclu de la sélection.",
                      );
                    }}
                  />
                  <strong>
                    Accord de partage du pitch confirmé pour {recipient}
                  </strong>
                </label>
                <p>
                  Cette case simule une validation préalable. Changer de
                  destinataire retire le pitch de la sélection.
                </p>
              </div>
              <div className="talent-output">
                <h3>Un manifeste vérifiable</h3>
                <p>
                  Le fichier JSON contient les textes fictifs sélectionnés, leur
                  taille et leur empreinte SHA-256. Il permet de vérifier
                  exactement ce qui compose le dossier.
                </p>
                <button
                  className="talent-primary"
                  onClick={exportManifest}
                  disabled={!allowed.length || exporting}
                >
                  {exporting
                    ? "Préparation du fichier…"
                    : "Exporter le manifeste"}
                </button>
                <small>Un téléchargement local. Aucun envoi au client.</small>
              </div>
            </aside>
          )}
        </div>
        <p className="talent-notice" role="status" aria-live="polite">
          {notice}
        </p>
      </main>
      <DemoFooter>
        Prototype de composition de dossier. Aucun CV, fichier vidéo ou accord
        réel. Les notes internes sont exclues de l’export.
      </DemoFooter>
    </div>
  );
}
