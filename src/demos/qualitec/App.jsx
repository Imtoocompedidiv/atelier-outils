import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { duration, reportText } from "./model.js";
import "./styles.css";
const base = {
  ref: "Q-2609-14",
  date: "2026-09-26",
  place: "Appartement témoin, Lyon 2e",
  tech: "Technicien exemple",
  start: "08:15",
  end: "09:35",
  work: "Remplacement du robinet d’arrêt sous évier et du joint. Remise en eau progressive et contrôle visuel des raccords.",
  checked: false,
  service: false,
  next: "Vérifier le raccord lors du prochain passage.",
};
const initial = [
  { id: 1, name: "Robinet d’arrêt 1/4 tour", qty: 1 },
  { id: 2, name: "Joint fibre", qty: 2 },
];
export default function App() {
  useDocumentTitle("Qualitec · Compte rendu terrain");
  const [f, setF] = useState({ ...base }),
    [parts, setParts] = useState(initial.map((p) => ({ ...p }))),
    [message, setMessage] = useState("");
  const change = (key, value) => {
    setF((x) => ({ ...x, [key]: value }));
    setMessage("");
  };
  const d = duration(f.start, f.end),
    valid =
      f.ref.trim() &&
      f.place.trim() &&
      f.work.trim() &&
      f.date &&
      f.tech.trim() &&
      d !== null &&
      f.checked &&
      f.service &&
      parts.every(
        (p) =>
          p.name.trim() &&
          Number.isInteger(p.qty) &&
          p.qty > 0 &&
          p.qty <= 1000,
      );
  return (
    <div className="qualitec">
      <DemoNotice company="Qualitec" />
      <header className="qt-header">
        <strong>
          Qualitec<span>Interventions terrain</span>
        </strong>
        <button
          onClick={() => {
            setF({ ...base });
            setParts(initial.map((p) => ({ ...p })));
            setMessage("Exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <div className="qt-banner">
        <h1>
          {valid
            ? "Le compte rendu est prêt à relire."
            : "Le compte rendu se prépare ici."}
        </h1>
        <p>Du terrain au bureau, les informations au même endroit.</p>
      </div>
      <main className="qt-workspace">
        <section className="qt-form">
          <h2>1. L’intervention</h2>
          <div className="qt-fields">
            {[
              ["ref", "Référence"],
              ["place", "Lieu"],
              ["tech", "Technicien"],
              ["date", "Date"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  type={key === "date" ? "date" : "text"}
                  maxLength="160"
                  value={f[key]}
                  onChange={(e) => change(key, e.target.value)}
                />
              </label>
            ))}
            <label>
              Début
              <input
                type="time"
                value={f.start}
                onChange={(e) => change("start", e.target.value)}
              />
            </label>
            <label>
              Fin
              <input
                type="time"
                value={f.end}
                onChange={(e) => change("end", e.target.value)}
              />
            </label>
          </div>
          {d === null && (
            <p role="alert" className="qt-error">
              La fin doit suivre le début, le même jour.
            </p>
          )}
          <h2>2. Les travaux réalisés</h2>
          <label>
            Observation du technicien
            <textarea
              maxLength="2000"
              value={f.work}
              onChange={(e) => change("work", e.target.value)}
            />
          </label>
          <h2>3. Les pièces utilisées</h2>
          <div className="qt-parts">
            {parts.map((p) => (
              <div key={p.id}>
                <input
                  aria-label="Désignation de la pièce"
                  value={p.name}
                  maxLength="160"
                  onChange={(e) =>
                    setParts((xs) =>
                      xs.map((x) =>
                        x.id === p.id ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  aria-label={`Quantité ${p.name}`}
                  type="number"
                  min="1"
                  max="1000"
                  value={Number.isNaN(p.qty) ? "" : p.qty}
                  onChange={(e) =>
                    setParts((xs) =>
                      xs.map((x) =>
                        x.id === p.id
                          ? {
                              ...x,
                              qty:
                                e.target.value === ""
                                  ? NaN
                                  : Number(e.target.value),
                            }
                          : x,
                      ),
                    )
                  }
                />
                <button
                  aria-label={`Supprimer ${p.name}`}
                  onClick={() =>
                    setParts((xs) => xs.filter((x) => x.id !== p.id))
                  }
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
          <button
            className="qt-add"
            onClick={() =>
              setParts((xs) => [
                ...xs,
                { id: Date.now(), name: "Nouvelle pièce", qty: 1 },
              ])
            }
          >
            Ajouter une pièce
          </button>
          <h2>4. La clôture</h2>
          <div className="qt-checks">
            <label>
              <input
                type="checkbox"
                checked={f.checked}
                onChange={(e) => change("checked", e.target.checked)}
              />
              Étanchéité vérifiée
            </label>
            <label>
              <input
                type="checkbox"
                checked={f.service}
                onChange={(e) => change("service", e.target.checked)}
              />
              Remise en service effectuée
            </label>
          </div>
          <label>
            Suite à prévoir
            <textarea
              value={f.next}
              maxLength="1000"
              onChange={(e) => change("next", e.target.value)}
            />
          </label>
        </section>
        <section className="qt-preview">
          <div className="qt-preview-bar">Aperçu du compte rendu</div>
          <article className="qt-paper">
            <header>
              <strong>Qualitec</strong>
              <span>
                Exemple de document <br />à valider par l’équipe
              </span>
            </header>
            <h2>Compte rendu d’intervention</h2>
            <div className="qt-paper-meta">
              <div>
                <small>Référence</small>
                <b>{f.ref || "À renseigner"}</b>
              </div>
              <div>
                <small>Durée</small>
                <b>
                  {d === null
                    ? "À corriger"
                    : `${Math.floor(d / 60)} h ${String(d % 60).padStart(2, "0")}`}
                </b>
              </div>
              <div>
                <small>Date</small>
                <b>{f.date}</b>
              </div>
              <div>
                <small>Lieu</small>
                <b>{f.place}</b>
              </div>
            </div>
            <h3>Travaux réalisés</h3>
            <p>
              {f.work || "Renseignez les travaux pour compléter le rapport."}
            </p>
            <h3>Pièces utilisées</h3>
            <ul>
              {parts.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <b>{p.qty || "—"}</b>
                </li>
              ))}
            </ul>
            <h3>Contrôles de fin d’intervention</h3>
            <p>
              {f.checked ? "Étanchéité vérifiée." : "Étanchéité à vérifier."}{" "}
              <br />
              {f.service
                ? "Remise en service effectuée."
                : "Remise en service à confirmer."}
            </p>
            <h3>Prochaine action</h3>
            <p>{f.next || "Aucune suite renseignée."}</p>
            <footer>
              {f.tech}
              <span>Dossier fictif</span>
            </footer>
          </article>
          <p className="qt-help">
            Ce rapport libre ne remplace aucune attestation réglementaire.
          </p>
        </section>
      </main>
      <section className="qt-bottom">
        <p role="status">
          {message ||
            (!valid
              ? "Complétez les informations et les deux contrôles pour exporter."
              : "Les informations sont complètes pour préparer le rapport.")}
        </p>
        <button
          disabled={!valid}
          onClick={() => {
            downloadText("qualitec-compte-rendu.txt", reportText(f, parts));
            setMessage("Compte rendu téléchargé, prêt à relire.");
          }}
        >
          Exporter le compte rendu
        </button>
      </section>
      <DemoFooter />
    </div>
  );
}
