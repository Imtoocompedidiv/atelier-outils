import React, { useState } from "react";
import "@fontsource/mulish/latin-400.css";
import "@fontsource/mulish/latin-600.css";
import "@fontsource/montserrat/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText, euro } from "../../shared/files.js";
import { initial, calculate } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Loiseau · Retour d’intervention");
  const [s, setS] = useState({ ...initial });
  const [message, setMessage] = useState("");
  const r = calculate(s);
  const edit = (key, value) => {
    setS((x) => ({ ...x, [key]: value }));
    setMessage("");
  };
  const ready =
    r.valid &&
    s.reference.trim() &&
    s.location.trim() &&
    s.technician.trim() &&
    s.note.trim();
  function exportReport() {
    downloadText(
      "loiseau-retour-intervention.txt",
      `RETOUR D’INTERVENTION · EXEMPLE INDÉPENDANT\nRéférence ${s.reference}\nLieu ${s.location}\nMétier ${s.trade}\nIntervenant déclaré ${s.technician}\n\nOBSERVATIONS\n${s.note}\n\nDURÉE\nPrésence déclarée ${s.duration} min\nDurée retenue par la règle d’exemple ${r.minutes} min\nPremière heure indivisible puis tranches de 30 min\n\nBASE DE PRÉPARATION\nMain-d’œuvre ${euro(r.labor)} HT\nDéplacement ${euro(r.travel)} HT\nFournitures ${euro(r.supplies)} HT\nTotal ${euro(r.ht)} HT\nTVA choisie ${s.tax}% : ${euro(r.vat)}\nTotal indicatif ${euro(r.total)} TTC\n\nClient informé selon déclaration : ${s.clientSeen ? "oui" : "non"}\n\nDonnées fictives. Ce document n’est pas une facture. Tarifs et taux de TVA saisis par l’utilisateur, à confirmer pour le chantier concerné.`,
    );
    setMessage(
      "Compte rendu téléchargé. Il pourra être relu avant préparation de la facture.",
    );
  }
  return (
    <div className="loiseau-app">
      <DemoNotice company="Établissement Loiseau" />
      <header className="loiseau-header">
        <b>
          LOISEAU<span>PLOMBERIE · COUVERTURE · MAÇONNERIE</span>
        </b>
        <span>LE RETOUR DU TERRAIN</span>
        <button
          onClick={() => {
            setS({ ...initial });
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="loiseau-heading">
          <div>
            <p>CARNET D’INTERVENTION / EXEMPLE</p>
            <h1>
              Le chantier est terminé. <br />
              <span>Le dossier suit.</span>
            </h1>
          </div>
          <div className="loiseau-stamp">
            COMPTE RENDU<strong>{s.reference || "À compléter"}</strong>
            <span>À préparer · données fictives</span>
          </div>
        </div>
        <div className="loiseau-layout">
          <section className="loiseau-report">
            <div className="loiseau-section-title">
              <b>01</b>
              <h2>Ce qui s’est passé sur place</h2>
            </div>
            <div className="loiseau-pair">
              <label>
                Référence de l’intervention
                <input
                  value={s.reference}
                  maxLength="35"
                  onChange={(e) => edit("reference", e.target.value)}
                />
              </label>
              <label>
                Corps de métier
                <select
                  value={s.trade}
                  onChange={(e) => edit("trade", e.target.value)}
                >
                  <option>Plomberie</option>
                  <option>Couverture</option>
                  <option>Maçonnerie</option>
                </select>
              </label>
            </div>
            <label>
              Lieu ou référence client
              <input
                value={s.location}
                maxLength="90"
                onChange={(e) => edit("location", e.target.value)}
              />
            </label>
            <label>
              Observations à transmettre
              <textarea
                rows="4"
                maxLength="1500"
                value={s.note}
                onChange={(e) => edit("note", e.target.value)}
              />
            </label>
            <label>
              Intervenant déclaré
              <input
                placeholder="Prénom ou initiales"
                value={s.technician}
                maxLength="60"
                onChange={(e) => edit("technician", e.target.value)}
              />
            </label>
            <div className="loiseau-section-title">
              <b>02</b>
              <h2>Le temps réellement passé</h2>
            </div>
            <div className="loiseau-time-entry">
              <label>
                Durée sur place
                <input
                  type="number"
                  min="1"
                  max="1440"
                  step="1"
                  value={s.duration}
                  onChange={(e) => edit("duration", e.target.value)}
                />
                <span>minutes</span>
              </label>
              <div>
                <strong>
                  {r.valid ? r.minutes : "—"}
                  <small>min</small>
                </strong>
                <span>retenues par la règle d’exemple</span>
              </div>
            </div>
            <div
              className="loiseau-ruler"
              aria-label={
                r.valid
                  ? `${s.duration} minutes déclarées, ${r.minutes} minutes retenues`
                  : "Durée à corriger"
              }
            >
              <div className="loiseau-ruler-bg">
                <i
                  style={{
                    width: `${r.valid ? Math.min(100, (Number(s.duration) / Math.max(150, r.minutes)) * 100) : 0}%`,
                  }}
                />
                <b
                  style={{
                    left: `${r.valid ? (r.minutes / Math.max(150, r.minutes)) * 100 : 0}%`,
                  }}
                />
              </div>
              <div>
                <span>0 min</span>
                <span>{r.valid ? Math.max(150, r.minutes) : 150} min</span>
              </div>
              <p>
                <i /> Présence déclarée <b /> Durée retenue
              </p>
            </div>
            <p className="loiseau-rule">
              Première heure indivisible, puis tranches de 30 minutes. La règle
              provient de la grille publique de janvier 2025 et doit être
              confirmée aujourd’hui.
            </p>
            <label className="loiseau-check">
              <input
                type="checkbox"
                checked={s.clientSeen}
                onChange={(e) => edit("clientSeen", e.target.checked)}
              />
              Compte rendu expliqué au client, selon votre déclaration
            </label>
          </section>
          <aside className="loiseau-billing">
            <div className="loiseau-section-title">
              <b>03</b>
              <h2>Préparer le chiffrage</h2>
            </div>
            <p>
              Montants d’exemple modifiables. Le métier choisi ne change pas
              automatiquement le tarif.
            </p>
            <div className="loiseau-rate-grid">
              {[
                ["hourly", "Main-d’œuvre / h HT"],
                ["travel", "Déplacement HT"],
                ["supplies", "Fournitures HT"],
              ].map(([k, l]) => (
                <label key={k}>
                  {l}
                  <div>
                    <input
                      inputMode="decimal"
                      value={s[k]}
                      onChange={(e) => edit(k, e.target.value)}
                    />
                    <span>€</span>
                  </div>
                </label>
              ))}
              <label>
                Taux de TVA choisi
                <select
                  value={s.tax}
                  onChange={(e) => edit("tax", e.target.value)}
                >
                  {["0", "5.5", "10", "20"].map((t) => (
                    <option value={t} key={t}>
                      {t.replace(".", ",")} %
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="loiseau-receipt">
              <p>
                <span>
                  Main-d’œuvre{" "}
                  {r.valid && `· ${(r.minutes / 60).toLocaleString("fr-FR")} h`}
                </span>
                <b>{r.valid ? euro(r.labor) : "—"}</b>
              </p>
              <p>
                <span>Déplacement</span>
                <b>{r.valid ? euro(r.travel) : "—"}</b>
              </p>
              <p>
                <span>Fournitures</span>
                <b>{r.valid ? euro(r.supplies) : "—"}</b>
              </p>
              <p className="subtotal">
                <span>Total HT</span>
                <b>{r.valid ? euro(r.ht) : "—"}</b>
              </p>
              <p>
                <span>TVA {s.tax.replace(".", ",")} %</span>
                <b>{r.valid ? euro(r.vat) : "—"}</b>
              </p>
              <p className="total">
                <span>Total indicatif TTC</span>
                <strong>{r.valid ? euro(r.total) : "—"}</strong>
              </p>
            </div>
            {!r.valid && (
              <p role="alert" className="loiseau-error">
                Durée entière de 1 à 1 440 minutes. Montants positifs avec deux
                décimales maximum.
              </p>
            )}
            <button
              className="loiseau-export"
              disabled={!ready}
              onClick={exportReport}
            >
              Exporter le compte rendu ↓
            </button>
            <p className="loiseau-helper">
              {ready
                ? "Le document reprend vos saisies et le détail du calcul."
                : "Complétez l’intervenant, les observations et les champs de dossier pour exporter."}
            </p>
          </aside>
        </div>
        <p role="status" className="loiseau-status">
          {message ||
            "Essayez 60, 61 puis 91 minutes pour voir les tranches se recalculer."}
        </p>
      </main>
      <DemoFooter>
        Ce prototype prépare un compte rendu. Il ne produit pas de facture et ne
        détermine pas le taux fiscal applicable. Tarifs, règles et montants
        restent à valider pour chaque intervention.
      </DemoFooter>
    </div>
  );
}
