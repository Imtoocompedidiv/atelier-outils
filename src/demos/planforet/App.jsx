import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv, euro } from "../../shared/files.js";
import { seed, resolve } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("Planforet · Révision de bordereau");
  const [rows, setRows] = useState(seed.map((r) => ({ ...r }))),
    [selected, setSelected] = useState("07.02"),
    [filter, setFilter] = useState(false),
    [message, setMessage] = useState("");
  const result = rows.map(resolve),
    current = result.find((x) => x.id === selected),
    ready = result.filter((r) => r.ready),
    update = (key, value) => {
      setRows((xs) =>
        xs.map((r) =>
          r.id === selected
            ? {
                ...r,
                [key]: value,
                ...(key !== "approved" ? { approved: false } : {}),
              }
            : r,
        ),
      );
      setMessage("");
    };
  return (
    <div className="planforet">
      <DemoNotice company="Planforet" />
      <header className="pf-header">
        <strong>Planforet</strong>
        <span>Lot menuiserie intérieure</span>
        <button
          onClick={() => {
            setRows(seed.map((r) => ({ ...r })));
            setSelected("07.02");
            setMessage("Exemple rétabli.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="pf-main">
        <section className="pf-sources">
          <h2>Documents de travail</h2>
          <div>
            <strong>Offre historique</strong>
            <p>
              Version A <br />5 repères d’exemple
            </p>
          </div>
          <div className="pf-source-active">
            <strong>Révision B</strong>
            <p>
              Unité modifiée <br />
              Nouvelle prestation
            </p>
          </div>
          <p className="pf-note">
            Les deux versions sont fictives. L’export contient uniquement les
            lignes validées.
          </p>
        </section>
        <section className="pf-compare">
          <h1>Le DCE a changé.</h1>
          <p>Conserver ce qui correspond. Décider de ce qui a changé.</p>
          <label className="pf-filter">
            <input
              type="checkbox"
              checked={filter}
              onChange={(e) => setFilter(e.target.checked)}
            />
            Voir uniquement les lignes à revoir
          </label>
          <div className="pf-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Repère</th>
                  <th>Offre historique</th>
                  <th>Révision B</th>
                  <th>Prix retenu</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {result
                  .filter((r) => !filter || !r.ready)
                  .map((r) => (
                    <tr
                      key={r.id}
                      className={selected === r.id ? "pf-selected" : ""}
                    >
                      <td>
                        <button
                          onClick={() => setSelected(r.id)}
                          aria-label={`Examiner ${r.id}`}
                        >
                          {r.id}
                        </button>
                      </td>
                      <td>
                        {r.before || "Nouvelle ligne"}
                        <small>{r.oldUnit || "—"}</small>
                      </td>
                      <td>
                        {r.after}
                        <small>
                          {r.qty} {r.unit}
                        </small>
                      </td>
                      <td>
                        {r.chosenPrice === null
                          ? "À renseigner"
                          : euro(r.chosenPrice)}
                      </td>
                      <td>
                        <span className={r.ready ? "pf-ok" : "pf-pending"}>
                          {r.ready
                            ? "Validé"
                            : r.requiresManual
                              ? "Prix à établir"
                              : "À revoir"}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="pf-rule">
            <span>
              {ready.length} / {rows.length}
            </span>
            <div>
              <h2>lignes vérifiées</h2>
              <p>
                Une unité différente bloque la reprise du prix. Vous pouvez
                établir un nouveau prix et le valider explicitement.
              </p>
            </div>
          </div>
        </section>
        <aside className="pf-inspector">
          <h2>Détail de la ligne {current.id}</h2>
          <label>
            Libellé révisé
            <input
              value={current.after}
              maxLength="160"
              onChange={(e) => update("after", e.target.value)}
            />
          </label>
          <div className="pf-units">
            <div>
              <small>Ancienne unité</small>
              <strong>{current.oldUnit || "—"}</strong>
            </div>
            <label>
              Nouvelle unité
              <select
                value={current.unit}
                onChange={(e) => update("unit", e.target.value)}
              >
                {["u", "ml", "m²", "ens"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Quantité
            <input
              type="number"
              min="1"
              max="10000"
              value={Number.isNaN(current.qty) ? "" : current.qty}
              onChange={(e) =>
                update(
                  "qty",
                  e.target.value === "" ? NaN : Number(e.target.value),
                )
              }
            />
          </label>
          <label>
            {current.requiresManual
              ? "Nouveau prix à établir (€)"
              : "Remplacer le prix proposé (€)"}
            <input
              inputMode="decimal"
              placeholder={
                current.requiresManual
                  ? "Saisie requise"
                  : (current.price / 100).toFixed(2)
              }
              value={current.manual}
              onChange={(e) => update("manual", e.target.value)}
            />
          </label>
          {current.requiresManual && (
            <p className="pf-warning">
              {current.before
                ? "L’unité a changé. Le prix historique n’est pas transféré."
                : "Cette prestation est nouvelle. Son prix doit être renseigné."}
            </p>
          )}
          {!current.valid && (
            <p className="pf-error">
              Renseignez un prix valide (deux décimales maximum) et une quantité
              entière positive.
            </p>
          )}
          <button
            className="pf-validate"
            disabled={!current.valid || !current.after.trim()}
            onClick={() => {
              update("approved", true);
              setMessage(`Ligne ${current.id} validée.`);
            }}
          >
            Valider cette ligne
          </button>
        </aside>
      </main>
      <section className="pf-bottom">
        <div>
          <small>Total des seules lignes vérifiées</small>
          <strong>{euro(ready.reduce((a, r) => a + r.total, 0))}</strong>
        </div>
        <p role="status">
          {message ||
            `${rows.length - ready.length} ligne(s) exclue(s) de l’export tant qu’elles restent à vérifier.`}
        </p>
        <button
          disabled={!ready.length}
          onClick={() => {
            downloadCsv(
              "planforet-prix-verifies.csv",
              [
                "Repère",
                "Libellé",
                "Unité",
                "Quantité",
                "Prix unitaire EUR",
                "Total EUR",
                "État",
              ],
              ready.map((r) => [
                r.id,
                r.after,
                r.unit,
                r.qty,
                (r.chosenPrice / 100).toFixed(2),
                (r.total / 100).toFixed(2),
                "Validé dans la démonstration",
              ]),
            );
            setMessage(
              `${ready.length} lignes vérifiées téléchargées. Export partiel explicite.`,
            );
          }}
        >
          Exporter les prix vérifiés
        </button>
      </section>
      <DemoFooter />
    </div>
  );
}
