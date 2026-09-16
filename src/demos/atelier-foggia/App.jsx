import React, { useState } from "react";
import "@fontsource/spectral/latin-400.css";
import "@fontsource/open-sans/latin-400.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadJson, downloadText } from "../../shared/files.js";
import {
  views,
  initial,
  assess,
  addPoint,
  bound,
  photoRequest,
  dossier,
  printableDossier,
} from "./model.js";
import chairViews from "./chair-views.png";
import "./styles.css";
const photoStyle = (view) => ({
  backgroundImage: `url(${chairViews})`,
  backgroundPosition: view.position,
});
async function photoData() {
  const response = await fetch(chairViews);
  if (!response.ok) throw new Error("Image indisponible");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export default function App() {
  useDocumentTitle("Atelier Foggia · Dossier photo");
  const [state, setState] = useState(initial),
    [selected, setSelected] = useState("assise"),
    [pointId, setPointId] = useState(1),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const result = assess(state),
    view = views.find((v) => v.id === selected),
    points = state.points[selected],
    point = points.find((p) => p.id === pointId);
  const select = (id) => {
    setSelected(id);
    setPointId(state.points[id][0]?.id ?? null);
    setStatus("");
  };
  const updatePoint = (patch) => {
    setState((s) => ({
      ...s,
      points: {
        ...s.points,
        [selected]: s.points[selected].map((p) =>
          p.id === pointId ? { ...p, ...patch } : p,
        ),
      },
    }));
    setStatus("");
  };
  const add = (x = 50, y = 50) => {
    if (!state.received[selected] || points.length >= 12) return;
    setPointId(state.nextId);
    setState((s) => addPoint(s, selected, x, y));
    setStatus("Point ajouté. Décrivez votre observation.");
  };
  const toggleReceived = (id, received) => {
    setState((s) => ({ ...s, received: { ...s.received, [id]: received } }));
    setStatus(
      received
        ? "La vue d’exemple a été ajoutée au dossier."
        : "La vue est à nouveau demandée.",
    );
  };
  const exportPhoto = async () => {
    if (!result.ready) return;
    setBusy(true);
    setStatus("Préparation du dossier et des photos…");
    try {
      const html = printableDossier(state, await photoData());
      if (!html) throw new Error("Dossier incomplet");
      downloadText(
        "foggia-dossier-photo.html",
        html,
        "text/html;charset=utf-8",
      );
      setStatus(
        "Dossier HTML téléchargé, avec les photos et vos observations. Ouvrez-le pour le consulter ou l’imprimer.",
      );
    } catch {
      setStatus(
        "Le dossier n’a pas été téléchargé. Réessayez après le chargement des photos.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="atelier-foggia-app">
      <DemoNotice company="Atelier Foggia" />
      <header>
        <div>
          <strong>ATELIER FOGGIA</strong>
          <span>Dossier photo</span>
        </div>
        <button
          className="atelier-foggia-text-button"
          onClick={() => {
            setState(initial());
            setSelected("assise");
            setPointId(1);
            setStatus("Le dossier fictif a été rétabli.");
          }}
        >
          Réinitialiser
        </button>
      </header>
      <main>
        <h1>Quatre regards sur une assise.</h1>
        <p className="atelier-foggia-intro">
          Les vues utiles, les observations, puis la fiche pour l’atelier.
        </p>
        <div className="atelier-foggia-workbench">
          <nav aria-label="Vues du dossier">
            <div className="atelier-foggia-section-title">
              Vues du dossier <span>{result.received} sur 4 reçues</span>
            </div>
            {views.map((v, i) => (
              <div className="atelier-foggia-view-row" key={v.id}>
                <button
                  aria-pressed={selected === v.id}
                  className="atelier-foggia-view"
                  onClick={() => select(v.id)}
                >
                  <span className="atelier-foggia-number">{i + 1}</span>
                  <span
                    className="atelier-foggia-thumb"
                    style={photoStyle(v)}
                    role="img"
                    aria-label={`Photo fictive, ${v.name}`}
                  />
                  <span>
                    <strong>{v.name}</strong>
                    <small>
                      {state.received[v.id] ? "Reçue" : "À compléter"}
                    </small>
                  </span>
                </button>
                {!state.received[v.id] && (
                  <button
                    className="atelier-foggia-add-view"
                    onClick={() => {
                      toggleReceived(v.id, true);
                      select(v.id);
                    }}
                  >
                    Ajouter la vue d’exemple{" "}
                    <span className="atelier-foggia-sr">{v.name}</span>
                  </button>
                )}
              </div>
            ))}
          </nav>
          <section className="atelier-foggia-gallery">
            <div className="atelier-foggia-section-title">
              Photo sélectionnée <span>{view.name}</span>
            </div>
            {state.received[selected] ? (
              <div
                className="atelier-foggia-photo"
                style={photoStyle(view)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  add(
                    ((e.clientX - rect.left) / rect.width) * 100,
                    ((e.clientY - rect.top) / rect.height) * 100,
                  );
                }}
                role="img"
                aria-label={`Photo fictive ${view.name}. Un bouton permet d’ajouter une observation et de régler sa position.`}
              >
                {points.map((p) => (
                  <button
                    key={p.id}
                    className={`atelier-foggia-pin ${pointId === p.id ? "active" : ""}`}
                    style={{ left: p.x + "%", top: p.y + "%" }}
                    aria-label={`Sélectionner le point ${p.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPointId(p.id);
                    }}
                  >
                    {p.id}
                  </button>
                ))}
              </div>
            ) : (
              <div className="atelier-foggia-missing-photo">
                <span>{view.name}</span>
                <p>{view.instruction}</p>
                <button onClick={() => toggleReceived(view.id, true)}>
                  Ajouter la vue d’exemple
                </button>
              </div>
            )}
            <div className="atelier-foggia-caption">
              <p>
                {state.received[selected]
                  ? "Cliquez sur la photo pour ajouter un point, ou utilisez le bouton ci-contre."
                  : view.instruction}
              </p>
              {state.received[selected] && (
                <button
                  className="atelier-foggia-text-button"
                  onClick={() => toggleReceived(selected, false)}
                >
                  Marquer manquante
                </button>
              )}
            </div>
          </section>
          <section className="atelier-foggia-observations">
            <div className="atelier-foggia-section-title">
              Observations <span>{points.length} sur cette vue</span>
            </div>
            {state.received[selected] ? (
              <>
                {points.length > 0 && (
                  <label className="atelier-foggia-point-picker">
                    Point sélectionné
                    <select
                      value={pointId ?? ""}
                      onChange={(e) => setPointId(Number(e.target.value))}
                    >
                      {points.map((p) => (
                        <option key={p.id} value={p.id}>
                          Point {String(p.id).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {point ? (
                  <>
                    <h2>Point {String(point.id).padStart(2, "0")}</h2>
                    <label className="atelier-foggia-note">
                      Observation
                      <textarea
                        value={point.text}
                        maxLength="500"
                        rows="5"
                        onChange={(e) => updatePoint({ text: e.target.value })}
                        placeholder="Décrivez ce que vous souhaitez examiner."
                      />
                    </label>
                    <p className="atelier-foggia-position-title">
                      Position dans la photo
                    </p>
                    {[
                      ["x", "Horizontalement"],
                      ["y", "Verticalement"],
                    ].map(([key, label]) => (
                      <label className="atelier-foggia-range" key={key}>
                        <span>{key.toUpperCase()}</span>
                        <input
                          type="range"
                          aria-label={label}
                          min="0"
                          max="100"
                          step="1"
                          value={point[key]}
                          onChange={(e) =>
                            updatePoint({ [key]: bound(e.target.value) })
                          }
                        />
                        <output>{Math.round(point[key])} %</output>
                      </label>
                    ))}
                    <button
                      className="atelier-foggia-outline"
                      onClick={() => {
                        const remaining = points.filter(
                          (p) => p.id !== pointId,
                        );
                        setState((s) => ({
                          ...s,
                          points: { ...s.points, [selected]: remaining },
                        }));
                        setPointId(remaining[0]?.id ?? null);
                        setStatus("Observation supprimée.");
                      }}
                    >
                      Supprimer ce point
                    </button>
                  </>
                ) : (
                  <div className="atelier-foggia-empty-note">
                    <h2>Le regard de l’atelier</h2>
                    <p>
                      Ajoutez un point sur la photo et décrivez ce qui mérite un
                      examen.
                    </p>
                  </div>
                )}
                <button
                  disabled={points.length >= 12}
                  className="atelier-foggia-primary"
                  onClick={() => add()}
                >
                  Ajouter une observation
                </button>
                <p className="atelier-foggia-small">
                  12 points maximum par vue. Les observations restent manuelles.
                </p>
              </>
            ) : (
              <div className="atelier-foggia-empty-note">
                <h2>Une vue à recevoir</h2>
                <p>
                  L’exemple permet d’ajouter la photo correspondante. Aucun
                  document n’est envoyé à un client.
                </p>
              </div>
            )}
          </section>
        </div>
        <section className="atelier-foggia-delivery">
          <div>
            <span className="atelier-foggia-section-title">
              État du dossier
            </span>
            <h2>
              {result.missing.length
                ? `${result.missing.length} vue${result.missing.length > 1 ? "s" : ""} manquante${result.missing.length > 1 ? "s" : ""}`
                : result.errors.length
                  ? "Observations à compléter"
                  : "Le dossier est prêt."}
            </h2>
            <p>
              {result.missing.length
                ? result.missing.map((v) => v.name).join(" · ")
                : "Les quatre vues sont réunies. L’examen du siège reste nécessaire."}
            </p>
          </div>
          <div className="atelier-foggia-export-actions">
            <button
              className="atelier-foggia-outline"
              disabled={!result.missing.length}
              onClick={() => {
                downloadText("foggia-demande-photos.txt", photoRequest(state));
                setStatus(
                  "Brouillon téléchargé avec les seules vues manquantes. Aucun message envoyé.",
                );
              }}
            >
              Préparer la demande de photos
            </button>
            <button
              className="atelier-foggia-primary"
              disabled={!result.ready || busy}
              onClick={exportPhoto}
            >
              {busy ? "Préparation…" : "Exporter le dossier avec photos"}
            </button>
            <button
              className="atelier-foggia-text-button"
              disabled={!result.ready}
              onClick={() => {
                downloadJson("foggia-observations.json", dossier(state));
                setStatus(
                  "Observations téléchargées en JSON, sans fichier image.",
                );
              }}
            >
              Observations seules · JSON
            </button>
          </div>
        </section>
        {result.errors.length > 0 && (
          <div className="atelier-foggia-errors" role="alert">
            {result.errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        <p className="atelier-foggia-status" role="status">
          {status}
        </p>
      </main>
      <DemoFooter>
        Photos et observations fictives. Aucun diagnostic automatique. Les
        fichiers restent sur votre appareil.
      </DemoFooter>
    </div>
  );
}
