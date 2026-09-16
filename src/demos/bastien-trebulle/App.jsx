import React, { useState } from "react";
import "@fontsource/lato/latin-400.css";
import "@fontsource/lato/latin-700.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText, euro } from "../../shared/files.js";
import { initial, titles, estimate, editLine, amount } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Bastien & Trebulle · Dossier de variantes");
  const [s, setS] = useState(structuredClone(initial));
  const [message, setMessage] = useState("");
  const r = estimate(s);
  const ready =
    r.valid && s.project.trim() && Object.values(s.checked).every(Boolean);
  function change(k, v) {
    setS((x) => ({ ...x, [k]: v, checked: { ...x.checked, scope: false } }));
    setMessage("Le périmètre doit être relu après cette modification.");
  }
  function lineTable(lines, section) {
    return (
      <div className="bastien-trebulle-lines">
        {lines.map((l) => (
          <div key={l.id}>
            <label>
              <span>Désignation {l.id}</span>
              <input
                aria-label={`Désignation ${l.id}`}
                value={l.label}
                maxLength="90"
                onChange={(e) =>
                  setS((x) =>
                    editLine(x, section, l.id, "label", e.target.value),
                  )
                }
              />
            </label>
            <label>
              <span>Quantité ({l.unit})</span>
              <input
                aria-label={`Quantité ${l.id}`}
                inputMode="decimal"
                value={l.quantity}
                onChange={(e) =>
                  setS((x) =>
                    editLine(x, section, l.id, "quantity", e.target.value),
                  )
                }
              />
            </label>
            <label>
              <span>Prix unitaire HT (€)</span>
              <input
                aria-label={`Prix ${l.id}`}
                inputMode="decimal"
                value={l.price}
                onChange={(e) =>
                  setS((x) =>
                    editLine(x, section, l.id, "price", e.target.value),
                  )
                }
              />
            </label>
            <strong>
              {amount(l) !== null ? euro(amount(l)) : "À corriger"}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  function exportPacket() {
    downloadText(
      "bastien-trebulle-dossier-variantes.txt",
      `DOSSIER DE VARIANTES · EXEMPLE INDÉPENDANT\n${s.project}\n\nVARIANTE RETENUE POUR CETTE ÉTUDE\n${s.variant} · ${titles[s.variant]}\nLes variantes A et B sont exclusives.\n\nDÉTAIL\n${r.lines.map((l) => `${l.label} · ${l.quantity} ${l.unit} × ${l.price} € HT = ${euro(amount(l))} HT`).join("\n")}\n\nTotal ${euro(r.ht)} HT\nTVA choisie ${s.tax}% : ${euro(r.vat)}\nTotal indicatif ${euro(r.total)} TTC\n\nCOMPARAISON\n${Object.keys(
        titles,
      )
        .map(
          (v) =>
            `${v} · ${titles[v]} : ${estimate(s, v).valid ? euro(estimate(s, v).ht) + " HT" : "montants à corriger"}`,
        )
        .join(
          "\n",
        )}\nOption finitions ${s.option ? "incluse dans les deux comparaisons" : "non incluse"}\n\nNOTE\n${s.note}\n\nPhotos, relevés et périmètre déclarés relus. Aucune pièce jointe ni validation externe vérifiée.\nPrix, quantités et chantier fictifs. Ce document de travail n’est ni un devis contractuel ni un dossier d’assemblée générale juridiquement vérifié.`,
    );
    setMessage("Dossier de comparaison téléchargé.");
  }
  return (
    <div className="bastien-trebulle-app">
      <DemoNotice company="Bastien & Trebulle" />
      <header className="bastien-trebulle-header">
        <b>
          BASTIEN <i>&</i> TREBULLE
          <span>PLOMBERIE · CHAUFFAGE · COUVERTURE</span>
        </b>
        <span>PRÉPARATION DU DOSSIER</span>
        <button
          onClick={() => {
            setS(structuredClone(initial));
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="bastien-trebulle-heading">
          <p>SYNDICS & HÔTELS / ÉTUDE INDÉPENDANTE</p>
          <h1>
            Deux périmètres. <br />
            Une décision plus claire.
          </h1>
          <p>
            De la visite au choix des travaux, garder les quantités, les options
            et les pièces ensemble.
          </p>
        </div>
        <div className="bastien-trebulle-project">
          <label>
            Intitulé du dossier
            <input
              value={s.project}
              maxLength="100"
              onChange={(e) => change("project", e.target.value)}
            />
          </label>
          <label>
            TVA choisie
            <select
              value={s.tax}
              onChange={(e) => change("tax", e.target.value)}
            >
              {["0", "5.5", "10", "20"].map((v) => (
                <option value={v} key={v}>
                  {v.replace(".", ",")} %
                </option>
              ))}
            </select>
          </label>
        </div>
        <section
          className="bastien-trebulle-comparison"
          aria-label="Choix exclusif de variante"
        >
          {Object.entries(titles).map(([v, title]) => {
            const calc = estimate(s, v);
            return (
              <button
                key={v}
                className={s.variant === v ? "selected" : ""}
                aria-pressed={s.variant === v}
                onClick={() => change("variant", v)}
              >
                <span>
                  VARIANTE {v}
                  <i>{s.variant === v ? "✓ Sélectionnée" : "Sélectionner"}</i>
                </span>
                <h2>{title}</h2>
                <p>
                  {v === "A"
                    ? "Intervention limitée aux zones repérées dans cet exemple."
                    : "Un périmètre élargi sur la zone témoin du dossier."}
                </p>
                <strong>
                  {calc.valid ? euro(calc.ht) : "À corriger"}
                  <small>
                    HT · base commune{" "}
                    {s.option ? "et option incluses" : "incluse"}
                  </small>
                </strong>
              </button>
            );
          })}
        </section>
        <div className="bastien-trebulle-layout">
          <section className="bastien-trebulle-quantities">
            <h2>
              <span>01</span> Base commune
            </h2>
            {lineTable(s.common, "common")}
            <h2>
              <span>02</span> Variante {s.variant} · {titles[s.variant]}
            </h2>
            {lineTable(s.variants[s.variant], s.variant)}
            <div className="bastien-trebulle-option">
              <label>
                <input
                  type="checkbox"
                  checked={s.option}
                  onChange={(e) => change("option", e.target.checked)}
                />
                <span>
                  Ajouter les finitions intérieures
                  <small>
                    Option commune aux deux variantes. Aucun cumul entre A et B.
                  </small>
                </span>
              </label>
              {s.option && lineTable([s.extra], "extra")}
            </div>
            <label className="bastien-trebulle-note">
              Note de périmètre
              <textarea
                rows="3"
                maxLength="1400"
                value={s.note}
                onChange={(e) => change("note", e.target.value)}
              />
            </label>
          </section>
          <aside className="bastien-trebulle-dossier">
            <h2>Avant de transmettre</h2>
            <p>
              Cette liste suit votre relecture. Elle ne vérifie pas les fichiers
              ni leur contenu.
            </p>
            {[
              ["photos", "Photos de visite réunies"],
              ["measure", "Relevés et quantités contrôlés"],
              ["scope", "Périmètre et options relus"],
            ].map(([k, l]) => (
              <label key={k}>
                <input
                  type="checkbox"
                  checked={s.checked[k]}
                  onChange={(e) => {
                    const value = e.target.checked;
                    setS((x) => ({
                      ...x,
                      checked: { ...x.checked, [k]: value },
                    }));
                  }}
                />
                {l}
              </label>
            ))}
            <div className="bastien-trebulle-summary">
              <span>VARIANTE {s.variant} RETENUE</span>
              <p>
                <span>Total HT</span>
                <b>{r.valid ? euro(r.ht) : "—"}</b>
              </p>
              <p>
                <span>TVA choisie</span>
                <b>{r.valid ? euro(r.vat) : "—"}</b>
              </p>
              <strong>{r.valid ? euro(r.total) : "—"}</strong>
              <small>Total indicatif TTC</small>
            </div>
            {!r.valid && (
              <p role="alert">
                Quantités strictement positives, prix positifs et deux décimales
                maximum. Chaque ligne doit avoir une désignation.
              </p>
            )}
            <button disabled={!ready} onClick={exportPacket}>
              Exporter le dossier ↓
            </button>
            <p className="bastien-trebulle-hint">
              {ready
                ? "Le texte exporté contient le détail et la comparaison des deux variantes."
                : "Terminez les trois points de relecture pour préparer l’export."}
            </p>
          </aside>
        </div>
        <p role="status" className="bastien-trebulle-status">
          {message ||
            "Sélectionnez une variante pour modifier ses lignes et voir l’écart se recalculer."}
        </p>
      </main>
      <DemoFooter>
        Chantier, quantités et prix fictifs. Les options techniques et le taux
        de TVA doivent être validés par les professionnels concernés. Aucun
        devis contractuel ni conformité juridique d’assemblée générale n’est
        établi.
      </DemoFooter>
    </div>
  );
}
