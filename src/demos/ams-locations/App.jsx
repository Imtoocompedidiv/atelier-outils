import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { seed, schedule, clock } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("AMS · Tournée des sapins");
  const [stops, setStops] = useState(structuredClone(seed)),
    [message, setMessage] = useState("");
  const plan = schedule(stops),
    issues = plan.filter((s) => s.late || !s.valid);
  const update = (id, key, value) => {
    setStops((xs) => xs.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    setMessage("");
  };
  const move = (i, d) => {
    setMessage("");
    setStops((xs) => {
      const a = [...xs];
      [a[i], a[i + d]] = [a[i + d], a[i]];
      return a;
    });
  };
  return (
    <div className="ams-locations">
      <DemoNotice company="AMS Locations" />
      <header className="ams-header">
        <strong>
          AMS <span>Locations</span>
        </strong>
        <button
          onClick={() => {
            setStops(structuredClone(seed));
            setMessage("Tournée exemple rétablie.");
          }}
        >
          Reprendre l’exemple
        </button>
      </header>
      <main className="ams-main">
        <div className="ams-title">
          <div>
            <h1>La tournée des sapins.</h1>
            <p>
              Préparer la pose du 3 décembre, jusqu’à la fiche de chaque arrêt.
            </p>
          </div>
          <button
            className="ams-export"
            disabled={issues.length > 0}
            onClick={() => {
              downloadCsv(
                "ams-carnet-sapins.csv",
                [
                  "Ordre",
                  "Lieu fictif",
                  "Secteur",
                  "Sapin",
                  "Coloris",
                  "Début prévu",
                  "Fin prévue",
                  "Trajet suivant min",
                ],
                plan.map((s, i) => [
                  i + 1,
                  s.client,
                  s.area,
                  s.size,
                  s.colors,
                  clock(s.start),
                  clock(s.end),
                  s.travel,
                ]),
              );
              setMessage(
                "Carnet de tournée téléchargé. Aucun rendez-vous n’a été confirmé.",
              );
            }}
          >
            Exporter le carnet
          </button>
        </div>
        <div className="ams-body">
          <section>
            <div className="ams-timeline">
              <h2>Planning des installations</h2>
              <div className="ams-hours">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i}>{i + 8} h</span>
                ))}
              </div>
              <div className="ams-track">
                {plan.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      left: `${Math.min(100, Math.max(0, ((s.start - 480) / 540) * 100))}%`,
                      width: `${Math.max(0, Math.min((s.duration / 540) * 100, 100 - Math.min(100, Math.max(0, ((s.start - 480) / 540) * 100))))}%`,
                    }}
                    className={s.late ? "ams-late" : ""}
                  >
                    <strong>{s.client}</strong>
                    <span>
                      {clock(s.start)} – {clock(s.end)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="ams-steps-title">Étapes de la tournée</h2>
            {plan.map((s, i) => (
              <article
                className={`ams-stop ${s.late || !s.valid ? "ams-stop-warning" : ""}`}
                key={s.id}
              >
                <div className="ams-stop-name">
                  <span>{i + 1}</span>
                  <div>
                    <h3>{s.client}</h3>
                    <p>{s.area}</p>
                  </div>
                  <div className="ams-order">
                    <button
                      aria-label={`Monter ${s.client}`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      Monter
                    </button>
                    <button
                      aria-label={`Descendre ${s.client}`}
                      disabled={i === stops.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      Descendre
                    </button>
                  </div>
                </div>
                <div className="ams-fields">
                  <label>
                    Sapin
                    <select
                      value={s.size}
                      onChange={(e) => update(s.id, "size", e.target.value)}
                    >
                      {[
                        "90–120 cm",
                        "140–175 cm",
                        "200–250 cm",
                        "300–400 cm",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Deux coloris
                    <select
                      value={s.colors}
                      onChange={(e) => update(s.id, "colors", e.target.value)}
                    >
                      {["Vert et or", "Rouge et or", "Blanc et argent"].map(
                        (x) => (
                          <option key={x}>{x}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    Début du créneau
                    <input
                      type="time"
                      value={s.from}
                      onChange={(e) => update(s.id, "from", e.target.value)}
                    />
                  </label>
                  <label>
                    Fin du créneau
                    <input
                      type="time"
                      value={s.to}
                      onChange={(e) => update(s.id, "to", e.target.value)}
                    />
                  </label>
                  <label>
                    Pose (min)
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={s.duration}
                      onChange={(e) =>
                        update(s.id, "duration", Number(e.target.value))
                      }
                    />
                  </label>
                  <label>
                    Trajet suivant (min)
                    <input
                      type="number"
                      min="0"
                      max="240"
                      value={s.travel}
                      onChange={(e) =>
                        update(s.id, "travel", Number(e.target.value))
                      }
                    />
                  </label>
                </div>
                {s.late && (
                  <p className="ams-error">
                    Fin prévue à {clock(s.end)}, après le créneau autorisé.
                    Ajustez le créneau ou la durée.
                  </p>
                )}
                {!s.valid && (
                  <p className="ams-error">
                    Vérifiez les horaires et saisissez des durées entières
                    positives.
                  </p>
                )}
              </article>
            ))}
            <p className="ams-help">
              Trajets saisis à titre d’exemple, sans calcul routier. La pose
              doit être entièrement comprise dans le créneau convenu.
            </p>
          </section>
          <aside className="ams-packing">
            <h2>À embarquer</h2>
            <p>La bonne taille, les bons coloris, pour chaque lieu.</p>
            {plan.map((s) => (
              <div key={s.id}>
                <svg viewBox="0 0 38 54" aria-hidden="true">
                  <path
                    d="M19 2 8 19h6L4 34h9L1 46h15v7h6v-7h15L25 34h9L24 19h6Z"
                    fill="#255039"
                  />
                </svg>
                <div>
                  <h3>{s.client}</h3>
                  <p>
                    1 sapin {s.size} <br />
                    {s.colors} <br />
                    Pose {clock(s.start)}
                  </p>
                </div>
              </div>
            ))}
            <section className="ams-status" role="status">
              <strong>
                {issues.length
                  ? `${issues.length} arrêt(s) à ajuster`
                  : "La tournée est cohérente"}
              </strong>
              <p>
                {message ||
                  "Le carnet devient exportable après correction des créneaux."}
              </p>
            </section>
          </aside>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
