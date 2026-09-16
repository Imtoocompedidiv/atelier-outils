import React, { useRef, useState } from "react";
import "@fontsource/catamaran/latin-400.css";
import "@fontsource/catamaran/latin-700.css";
import "@fontsource/livvic/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText, downloadJson } from "../../shared/files.js";
import { seed, auditAnnouncement, applyFields } from "./model.js";
import "./styles.css";

export default function Keltis() {
  useDocumentTitle("Keltis · Prêt à publier");
  const [value, setValue] = useState({ ...seed });
  const [checked, setChecked] = useState(JSON.stringify(seed));
  const [issues, setIssues] = useState(() => auditAnnouncement(seed));
  const [notice, setNotice] = useState("");
  const editor = useRef(null);
  const fields = useRef({});
  const stale = checked !== JSON.stringify(value);
  function update(field, next) {
    setValue({ ...value, [field]: next });
  }
  function check(next = value) {
    const result = auditAnnouncement(next);
    setIssues(result);
    setChecked(JSON.stringify(next));
    setNotice(
      result.length
        ? `${result.length} point(s) à relire dans l’annonce.`
        : "Les contrôles de cet exemple sont passés. Une relecture humaine reste utile.",
    );
  }
  function focusIssue(issue) {
    const target =
      issue.field === "body" ? editor.current : fields.current[issue.field];
    target?.focus();
    if (issue.field === "body" && issue.start !== undefined)
      target.setSelectionRange(issue.start, issue.end);
  }
  function removeDuplicate(issue) {
    const next = {
      ...value,
      body: value.body.slice(0, issue.start) + value.body.slice(issue.end),
    };
    next.body = next.body.replace(/\n{3,}/g, "\n\n").trim();
    setValue(next);
    check(next);
  }
  return (
    <div className="keltis">
      <DemoNotice company="Keltis" />
      <header className="keltis-header">
        <a href="https://www.keltis.fr/" target="_blank" rel="noreferrer">
          Keltis<span>.</span>
        </a>
        <button
          onClick={() => {
            setValue({ ...seed });
            check(seed);
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main>
        <h1>
          Une annonce prête à <br />
          rencontrer ses lecteurs.
        </h1>
        <p className="keltis-intro">
          Des champs oubliés, une répétition, une information absente. Un
          dernier passage avant publication.
        </p>
        <div className="keltis-desk">
          <section className="keltis-editor">
            <h2>Texte de l’annonce</h2>
            <div className="keltis-fields">
              {[
                ["title", "Intitulé"],
                ["location", "Localisation"],
                ["contract", "Contrat"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    ref={(el) => (fields.current[key] = el)}
                    value={value[key]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={
                      key === "location" ? "À compléter, par exemple Lyon" : ""
                    }
                  />
                </label>
              ))}
            </div>
            <label className="keltis-body-label">
              Annonce fictive
              <textarea
                ref={editor}
                value={value.body}
                onChange={(e) => update("body", e.target.value)}
                spellCheck="true"
                rows={16}
              />
            </label>
            <div className="keltis-editor-actions">
              <button className="primary" onClick={() => check()}>
                Contrôler l’annonce
              </button>
              <button
                onClick={() => {
                  const next = applyFields(value);
                  setValue(next);
                  check(next);
                }}
              >
                Appliquer les champs renseignés
              </button>
            </div>
          </section>
          <aside className="keltis-checks" aria-label="Résultat du contrôle">
            <h2>
              {stale
                ? "Texte modifié"
                : issues.length
                  ? `${issues.length} points à traiter`
                  : "Prête pour la relecture"}
            </h2>
            <p>
              {stale
                ? "Relancez le contrôle pour actualiser cette liste."
                : "Contrôles éditoriaux de démonstration, sans audit juridique."}
            </p>
            {issues.map((issue, index) => (
              <article key={issue.id} className={stale ? "stale" : ""}>
                <div>
                  <span>{index + 1}</span>
                  <h3>{issue.label}</h3>
                  {issue.line && <small>Ligne {issue.line}</small>}
                </div>
                <p>{issue.detail}</p>
                <button disabled={stale} onClick={() => focusIssue(issue)}>
                  Voir dans le texte
                </button>
                {issue.id.startsWith("duplicate-") && (
                  <button
                    disabled={stale}
                    onClick={() => removeDuplicate(issue)}
                  >
                    Retirer cette répétition
                  </button>
                )}
              </article>
            ))}
            {!issues.length && !stale && (
              <div className="keltis-clear">
                <strong>✓</strong>
                <p>
                  Aucun champ de modèle ni paragraphe répété détecté. L’annonce
                  peut être exportée pour relecture.
                </p>
              </div>
            )}
          </aside>
        </div>
        <div className="keltis-export">
          <p>
            {stale
              ? "Le texte a changé depuis le dernier contrôle."
              : "Le fichier contient votre texte, sans publication automatique."}
          </p>
          <button
            disabled={stale || issues.length > 0}
            onClick={() => {
              downloadText(
                "keltis-annonce-exemple.txt",
                `${value.title}\n${value.location} · ${value.contract}\n\n${value.body}`,
              );
              setNotice("Le texte contrôlé a été téléchargé.");
            }}
          >
            Télécharger l’annonce
          </button>
          <button
            disabled={stale}
            onClick={() =>
              downloadJson("keltis-controle-exemple.json", {
                prototype: true,
                announcement: value,
                issues,
                checkedAt: new Date().toISOString(),
              })
            }
          >
            Exporter le contrôle
          </button>
        </div>
        <p className="keltis-notice" role="status">
          {notice}
        </p>
      </main>
      <DemoFooter />
    </div>
  );
}
