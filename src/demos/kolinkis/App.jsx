import React, { useState } from "react";
import "@fontsource/quicksand/latin-600.css";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-700.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import {
  COST,
  CAPACITY,
  initialCompanies,
  allocateCents,
  updateSeats,
  daysUntil,
} from "./model.js";
import "./styles.css";

export default function Kolinkis() {
  useDocumentTitle("Kolinkis · Places et engagements");
  const [companies, setCompanies] = useState(() =>
    structuredClone(initialCompanies),
  );
  const [date, setDate] = useState("2026-10-20");
  const [today, setToday] = useState("2026-09-16");
  const [notice, setNotice] = useState("");
  const requested = companies.reduce((a, c) => a + c.requested, 0),
    confirmed = companies.reduce((a, c) => a + c.confirmed, 0);
  const forecast = allocateCents(
      COST,
      companies.map((c) => c.requested),
    ),
    committed = allocateCents(
      COST,
      companies.map((c) => c.confirmed),
    );
  const remaining = daysUntil(date, today);
  const seats = companies.flatMap((c) =>
    Array.from({ length: c.requested }, (_, i) => ({
      company: c.name,
      confirmed: i < c.confirmed,
    })),
  );
  while (seats.length < CAPACITY)
    seats.push({ company: "Disponible", free: true });
  function update(id, key, value) {
    const result = updateSeats(companies, id, key, value);
    if (result.error) {
      setNotice(result.error);
      return;
    }
    setCompanies(result.companies);
    setNotice("Demandes et confirmations mises à jour dans l’exemple.");
  }
  function exportCosts() {
    downloadCsv(
      "kolinkis-repartition-exemple.csv",
      [
        "Entreprise fictive",
        "Places demandées",
        "Places confirmées",
        "Projection HT en EUR",
        "Répartition sur confirmations HT en EUR",
        "Coût fixe scénario HT",
        "État du seuil",
      ],
      companies.map((c, i) => [
        c.name,
        c.requested,
        c.confirmed,
        forecast[i] === null ? "" : (forecast[i] / 100).toFixed(2),
        committed[i] === null ? "" : (committed[i] / 100).toFixed(2),
        "3630.00",
        confirmed >= 4
          ? "Seuil atteint dans l’exemple"
          : "Seuil non atteint dans l’exemple",
      ]),
    );
    setNotice(
      "Répartition téléchargée. Ce fichier de démonstration ne vaut ni devis ni engagement.",
    );
  }
  return (
    <div className="kolinkis">
      <DemoNotice company="Kolinkis" />
      <header>
        <a href="https://kolinkis.fr/" target="_blank" rel="noreferrer">
          Kolinkis<span>.</span>
        </a>
        <p>Intra partagé, côté organisation</p>
      </header>
      <main>
        <h1>
          Dix places, <br />
          des engagements clairs.
        </h1>
        <p className="kolinkis-intro">
          Les demandes donnent une projection. Les confirmations déterminent une
          autre répartition.
        </p>
        <div className="kolinkis-workspace">
          <section className="kolinkis-room">
            <h2>La table de la session</h2>
            <p>
              {confirmed} place(s) confirmée(s), {requested - confirmed}{" "}
              demandée(s), {CAPACITY - requested} libre(s).
            </p>
            <div
              className="kolinkis-seatplan"
              aria-label="Répartition des dix places"
            >
              <div className="kolinkis-table-center">
                <strong>
                  Deux jours <br />
                  chez l’hôte
                </strong>
                <span>Exemple de session</span>
              </div>
              {seats.map((seat, index) => (
                <div
                  key={index}
                  className={`kolinkis-seat seat-${index} ${seat.free ? "free" : seat.confirmed ? "confirmed" : "requested"}`}
                >
                  <strong>{index + 1}</strong>
                  <span>{seat.company}</span>
                  <small>
                    {seat.free
                      ? "Libre"
                      : seat.confirmed
                        ? "Confirmée"
                        : "Demandée"}
                  </small>
                </div>
              ))}
            </div>
            <div className="kolinkis-legend">
              <span>
                <i className="confirmed" />
                Confirmée
              </span>
              <span>
                <i className="requested" />
                Demandée
              </span>
              <span>
                <i className="free" />
                Libre
              </span>
            </div>
            <div className="kolinkis-dates">
              <label>
                Session fictive
                <input
                  type="date"
                  value={date}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                />
              </label>
              <label>
                Date de référence simulée
                <input
                  type="date"
                  value={today}
                  onChange={(e) => e.target.value && setToday(e.target.value)}
                />
              </label>
            </div>
            <div
              className={`kolinkis-threshold ${confirmed >= 4 ? "ready" : ""}`}
            >
              <strong>
                {remaining >= 0
                  ? `J-${remaining}`
                  : "Date de session dépassée dans l’exemple"}
              </strong>
              <p>
                {confirmed >= 4
                  ? "Le seuil de quatre confirmations est atteint dans cet exemple."
                  : remaining <= 30
                    ? "À J-30 ou moins, le seuil de quatre confirmations reste à atteindre. Une décision humaine est nécessaire."
                    : "Le seuil de quatre confirmations est à atteindre avant J-30."}
              </p>
            </div>
          </section>
          <section className="kolinkis-allocation">
            <div className="kolinkis-cost">
              <span>
                Scénario chez l’entreprise hôte <br />
                <small>Deux jours, coût fixe HT</small>
              </span>
              <strong>{euro(COST)}</strong>
            </div>
            <h2>Ce que chacun prend en charge</h2>
            <p>
              Le total est réparti au centime, selon le nombre de places de
              chaque entreprise.
            </p>
            <div className="kolinkis-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Entreprise</th>
                    <th>Demandées</th>
                    <th>Confirmées</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id}>
                      <th scope="row">{c.name}</th>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="1"
                          value={c.requested}
                          aria-label={`Places demandées par ${c.name}`}
                          onChange={(e) =>
                            update(c.id, "requested", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={c.requested}
                          step="1"
                          value={c.confirmed}
                          aria-label={`Places confirmées par ${c.name}`}
                          onChange={(e) =>
                            update(c.id, "confirmed", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="kolinkis-comparison">
              <div>
                <h3>Si toutes les demandes aboutissent</h3>
                <p>{requested} participant(s)</p>
                {companies.map((c, i) => (
                  <div key={c.id}>
                    <span>{c.name}</span>
                    <strong>
                      {forecast[i] === null ? "À répartir" : euro(forecast[i])}
                    </strong>
                  </div>
                ))}
                <footer>
                  Total <strong>{requested ? euro(COST) : "À répartir"}</strong>
                </footer>
              </div>
              <div>
                <h3>Sur les seules confirmations</h3>
                <p>{confirmed} participant(s)</p>
                {companies.map((c, i) => (
                  <div key={c.id}>
                    <span>{c.name}</span>
                    <strong>
                      {committed[i] === null
                        ? "À répartir"
                        : euro(committed[i])}
                    </strong>
                  </div>
                ))}
                <footer>
                  Total <strong>{confirmed ? euro(COST) : "À répartir"}</strong>
                </footer>
              </div>
            </div>
            <p className="kolinkis-explainer">
              Quand moins de personnes confirment, leur part augmente à coût
              fixe. La projection et la répartition confirmée ne se mélangent
              jamais.
            </p>
            <button className="primary" onClick={exportCosts}>
              Exporter la répartition
            </button>
            <button
              onClick={() => {
                setCompanies(structuredClone(initialCompanies));
                setDate("2026-10-20");
                setToday("2026-09-16");
                setNotice("Les engagements fictifs ont été rétablis.");
              }}
            >
              Reprendre l’exemple
            </button>
          </section>
        </div>
        <p className="kolinkis-notice" role="status">
          {notice}
        </p>
      </main>
      <DemoFooter>
        Tarif de scénario pour une formation chez l’hôte. Entreprises et
        engagements fictifs. Aucun paiement, inscription ou annulation.
      </DemoFooter>
    </div>
  );
}
