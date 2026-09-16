import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { initialOrders, orderMath } from "./model.js";
import "./styles.css";
const day = (x) =>
  x
    ? new Date(x + "T12:00:00Z").toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "À renseigner";
function Furniture({ type }) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      {type === 0 ? (
        <g stroke="#777" fill="#b7b3ac">
          <rect x="20" y="16" width="40" height="34" rx="6" />
          <rect x="15" y="40" width="50" height="18" rx="4" />
          <path d="M20 58v10M60 58v10" />
          <rect x="10" y="33" width="12" height="25" rx="4" />
          <rect x="58" y="33" width="12" height="25" rx="4" />
        </g>
      ) : type === 1 ? (
        <g stroke="#555" fill="#a5a29d">
          <ellipse cx="40" cy="28" rx="27" ry="8" />
          <path d="M40 36v30M22 68l18-6 18 6" strokeWidth="3" />
        </g>
      ) : (
        <g stroke="#555" fill="#7d827b">
          <path d="M40 5v25M15 58Q20 28 40 28Q60 28 65 58Z" />
          <ellipse cx="40" cy="58" rx="25" ry="5" />
        </g>
      )}
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Repérages · Suivi FF&E");
  const [orders, setOrders] = useState(initialOrders.map((x) => ({ ...x })));
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const o = orders[selected],
    r = orderMath(o);
  const edit = (k, v) => {
    setOrders((a) => a.map((x, i) => (i === selected ? { ...x, [k]: v } : x)));
    setMessage("");
  };
  const allValid = orders.every((x) => orderMath(x).valid);
  const total = orders.reduce((a, x) => a + (orderMath(x).outstanding || 0), 0);
  function exportOrders() {
    downloadCsv(
      "suivi-ffe-exemple.csv",
      [
        "Référence",
        "Produit",
        "Quantité",
        "Total HT EUR",
        "Acompte EUR",
        "Solde EUR",
        "Échéance solde",
        "Départ usine",
        "Acompte déclaré réglé",
        "Solde déclaré réglé",
      ],
      orders.map((x) => {
        const m = orderMath(x);
        return [
          x.id,
          x.name,
          x.quantity,
          (m.total / 100).toFixed(2),
          (m.advance / 100).toFixed(2),
          (m.balance / 100).toFixed(2),
          m.due,
          x.departure,
          x.paidDeposit ? "Oui" : "Non",
          x.paidBalance ? "Oui" : "Non",
        ];
      }),
    );
    setMessage("Suivi CSV téléchargé.");
  }
  return (
    <div className="reperages-design-app">
      <DemoNotice company="Repérages Conseil Design" />
      <header className="reperages-design-header">
        <b>
          REPÉRAGES<small>Conseil Design</small>
        </b>
        <span>FF&E / PRÉPARATION DES ACHATS</span>
        <button
          onClick={() => {
            setOrders(initialOrders.map((x) => ({ ...x })));
            setSelected(0);
            setSearch("");
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="reperages-design-title">
          <div>
            <span>ÉTUDE HÔTEL RIVE · DONNÉES FICTIVES</span>
            <h1>
              Le départ usine <br />
              se prépare ici.
            </h1>
            <p>Une date qui bouge, et son échéance suit.</p>
          </div>
          <div className="reperages-design-outstanding">
            <small>Reste à préparer, exemple HT</small>
            <strong>{euro(total)}</strong>
            <button disabled={!allValid} onClick={exportOrders}>
              Exporter le suivi des commandes ↓
            </button>
          </div>
        </div>
        <div className="reperages-design-work">
          <section className="reperages-design-list">
            <div className="reperages-design-toolbar">
              <b>{orders.length} commandes</b>
              <input
                aria-label="Rechercher un produit"
                placeholder="Rechercher un produit…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="reperages-design-table">
              <div className="reperages-design-columns">
                <span>Produit</span>
                <span>Départ usine</span>
                <span>Solde HT</span>
              </div>
              {orders.map((x, i) => {
                const m = orderMath(x);
                return x.name
                  .toLocaleLowerCase("fr")
                  .includes(search.toLocaleLowerCase("fr")) ? (
                  <button
                    className={`reperages-design-row ${selected === i ? "selected" : ""}`}
                    key={x.id}
                    onClick={() => setSelected(i)}
                  >
                    <span>
                      <Furniture type={i} />
                      <span>
                        <strong>{x.name}</strong>
                        <small>
                          {x.quantity} unités · {x.id}
                        </small>
                      </span>
                    </span>
                    <span>{day(x.departure)}</span>
                    <span>
                      {m.valid ? euro(m.balance) : "À corriger"}
                      <small>
                        {x.paidBalance ? "Réglé déclaré" : "À prévoir"}
                      </small>
                    </span>
                  </button>
                ) : null;
              })}
              {!orders.some((x) =>
                x.name.toLowerCase().includes(search.toLowerCase()),
              ) && <p>Aucun produit ne correspond.</p>}
            </div>
            <div className="reperages-design-project">
              <span>LE BON REPÈRE</span>
              <p>
                Départ usine et livraison sur site désignent deux dates
                différentes. Le calcul ci-contre porte sur le départ déclaré.
              </p>
              <small>
                Aucune capacité de fournisseur ni date de réception n’est
                engagée.
              </small>
            </div>
          </section>
          <section className="reperages-design-detail">
            <div className="reperages-design-detailtitle">
              <Furniture type={selected} />
              <div>
                <small>{o.id} · FICHE ACHAT</small>
                <h2>{o.name}</h2>
                <p>{o.supplier}</p>
              </div>
            </div>
            <label>
              Départ usine prévu
              <input
                type="date"
                value={o.departure}
                onChange={(e) => edit("departure", e.target.value)}
              />
            </label>
            <div className="reperages-design-pair">
              <label>
                Quantité
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={o.quantity}
                  onChange={(e) => edit("quantity", e.target.value)}
                />
              </label>
              <label>
                Prix unitaire HT (€)
                <input
                  inputMode="decimal"
                  value={o.unit}
                  onChange={(e) => edit("unit", e.target.value)}
                />
              </label>
            </div>
            <div className="reperages-design-pair">
              <label>
                Acompte (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={o.deposit}
                  onChange={(e) => edit("deposit", e.target.value)}
                />
              </label>
              <label>
                Délai avant départ (jours)
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={o.lead}
                  onChange={(e) => edit("lead", e.target.value)}
                />
              </label>
            </div>
            <div className="reperages-design-money">
              <span>
                Total HT<strong>{r.valid ? euro(r.total) : "—"}</strong>
              </span>
              <span>
                Acompte<strong>{r.valid ? euro(r.advance) : "—"}</strong>
              </span>
              <span>
                Solde<strong>{r.valid ? euro(r.balance) : "—"}</strong>
              </span>
            </div>
            <label className="reperages-design-check">
              <input
                type="checkbox"
                checked={o.paidDeposit}
                onChange={(e) => edit("paidDeposit", e.target.checked)}
              />
              Acompte déclaré réglé
            </label>
            <label className="reperages-design-check">
              <input
                type="checkbox"
                checked={o.paidBalance}
                onChange={(e) => edit("paidBalance", e.target.checked)}
              />
              Solde déclaré réglé
            </label>
            {!r.valid && (
              <p role="alert">
                Vérifiez date, quantité entière, prix à deux décimales, acompte
                de 0 à 100 % et délai de 0 à 365 jours.
              </p>
            )}
          </section>
        </div>
        <section className="reperages-design-timeline">
          <div>
            <span className="reperages-design-dot" />
            <small>ÉCHÉANCE CALCULÉE DU SOLDE</small>
            <strong>{r.valid ? day(r.due) : "À corriger"}</strong>
            <p>{o.lead} jours calendaires avant départ</p>
          </div>
          <div className="reperages-design-line" />
          <div>
            <span className="reperages-design-dot departure" />
            <small>DÉPART USINE DÉCLARÉ</small>
            <strong>{day(o.departure)}</strong>
            <p>À confirmer avec le fournisseur</p>
          </div>
        </section>
        <p className="reperages-design-source">
          Les paramètres initiaux 40 % et 10 jours reprennent les{" "}
          <a
            href="https://www.reperages-design.com/conditions-generales-de-vente"
            target="_blank"
            rel="noreferrer"
          >
            CGV publiques datées de 2019
          </a>
          . Ils restent modifiables et doivent être confirmés avant usage. Les
          fournisseurs et montants sont fictifs.
        </p>
        <p role="status">{message}</p>
      </main>
      <DemoFooter />
    </div>
  );
}
