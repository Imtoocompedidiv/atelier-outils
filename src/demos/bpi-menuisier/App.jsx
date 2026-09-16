import React, { useState } from "react";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { days, initialJobs, initialPlan, checkPlacement } from "./model.js";
import "./styles.css";
export default function App() {
  useDocumentTitle("BPI · Livraison et pose");
  const [jobs, setJobs] = useState(structuredClone(initialJobs)),
    [plan, setPlan] = useState(structuredClone(initialPlan)),
    [active, setActive] = useState(initialJobs[0].id),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const current = jobs.find((j) => j.id === active),
    update = (k, v) => {
      setJobs((list) =>
        list.map((j) => (j.id === active ? { ...j, [k]: v } : j)),
      );
      setPlan((p) => p.filter((s) => s.jobId !== active));
      setMessage(
        "Le dossier a changé. Sa pose peut être repositionnée après vérification.",
      );
      setError("");
    },
    place = (day, crew) => {
      const reason = checkPlacement(current, day, crew, plan, jobs);
      if (reason) {
        setError(reason);
        setMessage("");
        return;
      }
      setPlan((p) => [
        ...p.filter((s) => s.jobId !== active),
        { jobId: active, day, crew },
      ]);
      setError("");
      setMessage(
        `${current.name} positionné le ${days[day].split("-").reverse().join("/")} avec l’équipe ${crew}.`,
      );
    },
    slotFor = (day, crew) =>
      plan.find(
        (s) =>
          s.crew === crew &&
          s.day <= day &&
          day < s.day + (jobs.find((j) => j.id === s.jobId)?.duration || 0),
      );
  return (
    <div className="bpi-menuisier">
      <DemoNotice company="BPI · La Boutique du Menuisier" />
      <header className="bpi-header">
        <div className="bpi-mark">
          <span aria-hidden="true">▥</span>
          <strong>
            BPI
            <small>
              LA BOUTIQUE <br />
              DU MENUISIER
            </small>
          </strong>
        </div>
        <p>DU MÉTRÉ À LA POSE</p>
        <button
          onClick={() => {
            setJobs(structuredClone(initialJobs));
            setPlan(structuredClone(initialPlan));
            setActive(initialJobs[0].id);
            setError("");
            setMessage("Semaine exemple rétablie.");
          }}
        >
          Revenir à l’exemple
        </button>
      </header>
      <main className="bpi-main">
        <div className="bpi-title">
          <h1>
            Une livraison confirmée. <br />
            <span>Une pose organisée.</span>
          </h1>
          <p>
            Rassembler les prérequis avant d’appeler le client pour un créneau.
          </p>
        </div>
        <div className="bpi-work">
          <aside className="bpi-jobs">
            <h2>Chantiers à organiser</h2>
            {jobs.map((j) => (
              <button
                key={j.id}
                aria-pressed={j.id === active}
                onClick={() => {
                  setActive(j.id);
                  setError("");
                  setMessage("");
                }}
              >
                <small>{j.id}</small>
                <strong>{j.name}</strong>
                <span>{j.description}</span>
                <p>
                  Livraison{" "}
                  <b>
                    {j.delivery
                      ? j.delivery.split("-").reverse().join(".")
                      : "à renseigner"}
                  </b>
                </p>
                <i>
                  {plan.some((s) => s.jobId === j.id)
                    ? "Pose positionnée"
                    : "À planifier"}
                </i>
              </button>
            ))}
            <p className="bpi-example">
              Chantiers et équipes fictifs. Aucun client contacté depuis cette
              page.
            </p>
          </aside>
          <section className="bpi-planner">
            <header>
              <span>SEMAINE DU</span>
              <h2>21 au 25 septembre 2026</h2>
              <small>
                {plan.length} / {jobs.length} poses positionnées
              </small>
            </header>
            <div className="bpi-agenda-scroll">
              <div className="bpi-agenda">
                <div className="bpi-corner">
                  Équipes <br />
                  exemples
                </div>
                {days.map((d, i) => (
                  <div className="bpi-day" key={d}>
                    {["Lun.", "Mar.", "Mer.", "Jeu.", "Ven."][i]}
                    <strong>{d.slice(-2)}</strong>
                  </div>
                ))}
                {[1, 2].map((crew) => (
                  <React.Fragment key={crew}>
                    <div className="bpi-crew">
                      <span>0{crew}</span>Équipe {crew}
                    </div>
                    {days.map((d, i) => {
                      const s = slotFor(i, crew),
                        j = s ? jobs.find((x) => x.id === s.jobId) : null,
                        reason = checkPlacement(current, i, crew, plan, jobs);
                      return (
                        <button
                          key={d}
                          className={`bpi-slot ${j ? "occupied" : ""} ${j?.id === active ? "active" : ""} ${!reason ? "available" : ""}`}
                          aria-label={`${["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"][i]} ${d.slice(-2)}, équipe ${crew}${j ? `, ${j.name}` : ""}`}
                          onClick={() => place(i, crew)}
                          title={
                            reason || "Positionner le chantier sélectionné"
                          }
                        >
                          {j ? (
                            <>
                              <strong>{j.name}</strong>
                              <small>
                                {j.id} ·{" "}
                                {i === s.day
                                  ? "Début de pose"
                                  : "Suite de pose"}
                              </small>
                            </>
                          ) : (
                            <>
                              <span>+</span>
                              <small>
                                {reason
                                  ? "Vérifier les prérequis"
                                  : "Créneau possible"}
                              </small>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="bpi-key">
              <span>
                <i />
                Pose positionnée
              </span>
              <span>
                <i />
                Créneau possible pour le chantier sélectionné
              </span>
            </div>
            <div className="bpi-explainer">
              <strong>La règle de ce planning exemple</strong>
              <p>
                Pose au plus tôt le lendemain de la date fournisseur confirmée,
                métré et accès renseignés, une pose par équipe et par jour. Ce
                tampon reste à adapter à votre organisation.
              </p>
            </div>
            {error && (
              <p role="alert" className="bpi-error">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="bpi-message">
                {message}
              </p>
            )}
            <div className="bpi-actions">
              <button
                className="bpi-remove"
                disabled={!plan.some((s) => s.jobId === active)}
                onClick={() => {
                  setPlan((p) => p.filter((s) => s.jobId !== active));
                  setError("");
                  setMessage("Pose retirée du planning local.");
                }}
              >
                Retirer la pose sélectionnée
              </button>
              <button
                className="bpi-export"
                disabled={!plan.length}
                onClick={() => {
                  downloadCsv(
                    "bpi-planning-pose-exemple.csv",
                    [
                      "Dossier",
                      "Chantier exemple",
                      "Équipe exemple",
                      "Premier jour",
                      "Dernier jour",
                      "Livraison confirmée",
                      "Durée jours",
                      "Note",
                    ],
                    [...plan]
                      .sort((a, b) => a.day - b.day || a.crew - b.crew)
                      .map((s) => {
                        const j = jobs.find((j) => j.id === s.jobId);
                        return [
                          j.id,
                          j.name,
                          s.crew,
                          days[s.day],
                          days[s.day + j.duration - 1],
                          j.delivery,
                          j.duration,
                          j.note,
                        ];
                      }),
                  );
                  setMessage(
                    `Planning téléchargé avec ${plan.length} poses positionnées. Les dossiers non planifiés sont exclus.`,
                  );
                  setError("");
                }}
              >
                ↓ Exporter le planning
              </button>
            </div>
          </section>
          <aside className="bpi-detail">
            <small>DOSSIER SÉLECTIONNÉ</small>
            <h2>{current.name}</h2>
            <p>{current.description}</p>
            <label>
              Date annoncée par le fournisseur
              <input
                type="date"
                value={current.delivery}
                onChange={(e) => update("delivery", e.target.value)}
              />
            </label>
            {[
              ["confirmed", "Date fournisseur confirmée"],
              ["measured", "Métré effectué"],
              ["access", "Accès au chantier confirmé"],
            ].map(([k, l]) => (
              <label className="bpi-check" key={k}>
                <input
                  type="checkbox"
                  checked={current[k]}
                  onChange={(e) => update(k, e.target.checked)}
                />
                {l}
              </label>
            ))}
            <label>
              Durée estimée
              <select
                value={current.duration}
                onChange={(e) => update("duration", Number(e.target.value))}
              >
                <option value="1">1 journée</option>
                <option value="2">2 journées consécutives</option>
              </select>
            </label>
            <label>
              Notes de préparation
              <textarea
                rows="4"
                value={current.note}
                onChange={(e) => update("note", e.target.value)}
              />
            </label>
            <p className="bpi-help">
              Une modification du dossier retire sa pose du planning afin de
              vérifier les nouveaux prérequis.
            </p>
          </aside>
        </div>
      </main>
      <DemoFooter />
    </div>
  );
}
