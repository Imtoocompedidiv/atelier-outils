import React, { useState } from "react";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadCsv } from "../../shared/files.js";
import { travellers, makeRooms, analyse, move, exportRows } from "./model.js";
import "./styles.css";
function RoomPicker({ rooms, value = "", label, onChange }) {
  return (
    <label className="voyages-gallia-picker">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">À affecter</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.id} · {r.type} ({r.guests.length}/{r.capacity})
          </option>
        ))}
      </select>
    </label>
  );
}
function WaitingList({ people, rooms, onMove }) {
  return (
    <aside className="voyages-gallia-waiting">
      <h2>À affecter ({people.length})</h2>
      <p>Voyageurs sans chambre</p>
      {people.map((p) => (
        <div className="voyages-gallia-wait-person" key={p.id}>
          <strong>{p.name}</strong>
          <RoomPicker
            rooms={rooms}
            label={"Chambre pour " + p.name}
            onChange={(id) => onMove(p.id, id)}
          />
        </div>
      ))}
      {!people.length && (
        <p className="voyages-gallia-ok">Chaque voyageur a sa chambre.</p>
      )}
    </aside>
  );
}
function RoomInspector({ room, people, rooms, onMove, onNights }) {
  return (
    <aside className="voyages-gallia-inspector">
      <h2>Détails de la chambre</h2>
      <h3>Chambre {room.id}</h3>
      <dl>
        <div>
          <dt>Type</dt>
          <dd>{room.type}</dd>
        </div>
        <div>
          <dt>Capacité</dt>
          <dd>{room.capacity}</dd>
        </div>
        <div>
          <dt>Personnes affectées</dt>
          <dd>{room.guests.length}</dd>
        </div>
      </dl>
      {room.guests.length > room.capacity && (
        <div className="voyages-gallia-warning">
          <strong>Capacité dépassée</strong>
          <p>
            Déplacez {room.guests.length - room.capacity} personne vers une
            chambre libre.
          </p>
        </div>
      )}
      <div className="voyages-gallia-inspector-list">
        {room.guests.map((id) => {
          const p = people.find((x) => x.id === id);
          return (
            <div key={id}>
              <strong>{p.name}</strong>
              <RoomPicker
                rooms={rooms}
                value={room.id}
                label={"Déplacer " + p.name}
                onChange={(target) => onMove(id, target)}
              />
              <label className="voyages-gallia-picker">
                Nuits pour {p.name}
                <select
                  value={p.nights}
                  onChange={(e) => onNights(id, Number(e.target.value))}
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {n} nuit{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
        {!room.guests.length && (
          <p>Cette chambre est disponible pour une affectation.</p>
        )}
      </div>
    </aside>
  );
}
export default function App() {
  useDocumentTitle("Vérifier une rooming");
  const [rooms, setRooms] = useState(makeRooms),
    [people, setPeople] = useState(() => travellers.map((p) => ({ ...p }))),
    [selected, setSelected] = useState("203"),
    [message, setMessage] = useState("");
  const state = analyse(rooms, people),
    room = rooms.find((r) => r.id === selected),
    hotel = "Hôtel de la Ria";
  const onMove = (id, target) => {
    setRooms((s) => move(s, id, target));
    setMessage(
      target
        ? "Affectation mise à jour."
        : "Le voyageur est de nouveau à affecter.",
    );
  };
  const reset = () => {
    setRooms(makeRooms());
    setPeople(travellers.map((p) => ({ ...p })));
    setSelected("203");
    setMessage("Exemple réinitialisé.");
  };
  const exportHotel = () => {
    if (!state.ready) return;
    downloadCsv(
      "rooming-hotel-ria.csv",
      [
        "Hôtel",
        "Chambre",
        "Type",
        "Identifiant",
        "Prénom",
        "Arrivée",
        "Départ",
        "Nuits",
      ],
      exportRows(rooms, people, hotel),
    );
    setMessage("Rooming téléchargée. Aucun document envoyé à l’hôtel.");
  };
  const diagnostic = () => {
    downloadCsv(
      "controle-rooming.csv",
      ["Type", "Détail"],
      [
        ...state.unassigned.map((p) => ["Non affecté", p.name]),
        ...state.overflow.map((id) => ["Capacité dépassée", "Chambre " + id]),
        ...state.errors.map((e) => ["Erreur", e]),
      ],
    );
    setMessage("Liste des points à corriger téléchargée.");
  };
  return (
    <div className="voyages-gallia-app">
      <DemoNotice company="Voyages Gallia" />
      <header className="voyages-gallia-header">
        <span>Voyages Gallia</span>
        <div>
          <strong>Groupe Algarve</strong>
          <small>12 voyageurs / 18 au 21 octobre</small>
        </div>
        <span className="voyages-gallia-header-hotel">
          {hotel}
          <small>Hébergement fictif</small>
        </span>
      </header>
      <main className="voyages-gallia-main">
        <div className="voyages-gallia-title">
          <div>
            <h1>
              La rooming, <br />
              avant de l’envoyer
            </h1>
            <p>
              Affectez les voyageurs, vérifiez les capacités et préparez le
              fichier de l’hôtel.
            </p>
          </div>
          <div>
            <button onClick={reset}>Réinitialiser</button>
            <button
              className="voyages-gallia-primary"
              disabled={!state.ready}
              onClick={exportHotel}
            >
              Exporter pour l’hôtel
            </button>
          </div>
        </div>
        <div className="voyages-gallia-workspace">
          <WaitingList
            people={state.unassigned}
            rooms={rooms}
            onMove={onMove}
          />
          <section className="voyages-gallia-plan">
            <h2>Plan des chambres</h2>
            <p>
              {rooms.length} chambres / {state.bedNights} nuitées individuelles
            </p>
            <div className="voyages-gallia-columns">
              <span>Chambre</span>
              <span>Type</span>
              <span>Voyageurs affectés</span>
            </div>
            {rooms.map((r) => (
              <button
                key={r.id}
                className={
                  "voyages-gallia-room " +
                  (state.overflow.includes(r.id)
                    ? "voyages-gallia-room-over"
                    : "")
                }
                aria-pressed={r.id === selected}
                onClick={() => setSelected(r.id)}
              >
                <strong>{r.id}</strong>
                <span>
                  {r.type}
                  <small>
                    {r.capacity} place{r.capacity > 1 ? "s" : ""}
                  </small>
                </span>
                <span>
                  {r.guests.length ? (
                    r.guests.map((id) => (
                      <span className="voyages-gallia-name" key={id}>
                        {people.find((p) => p.id === id).name}
                      </span>
                    ))
                  ) : (
                    <span className="voyages-gallia-free">Chambre libre</span>
                  )}
                  {state.overflow.includes(r.id) && (
                    <small className="voyages-gallia-capacity-error">
                      Capacité dépassée (+{r.guests.length - r.capacity})
                    </small>
                  )}
                </span>
              </button>
            ))}
            <button
              className="voyages-gallia-add"
              onClick={() => {
                const id = String(207 + rooms.length - 6);
                setRooms((s) => [
                  ...s,
                  { id, type: "Double", capacity: 2, hotel, guests: [] },
                ]);
                setSelected(id);
                setMessage(
                  "Chambre fictive ajoutée. Sa disponibilité réelle resterait à confirmer.",
                );
              }}
            >
              Ajouter une chambre double
            </button>
          </section>
          <RoomInspector
            room={room}
            people={people}
            rooms={rooms}
            onMove={onMove}
            onNights={(id, n) =>
              setPeople((s) =>
                s.map((p) => (p.id === id ? { ...p, nights: n } : p)),
              )
            }
          />
        </div>
        <div
          className={
            "voyages-gallia-status " +
            (state.ready ? "voyages-gallia-status-ready" : "")
          }
          aria-live="polite"
        >
          <strong>
            {state.ready
              ? "La répartition est cohérente"
              : state.unassigned.length +
                " sans chambre · " +
                state.overflow.length +
                " capacité dépassée" +
                (state.overflow.length > 1 ? "s" : "")}
          </strong>
          <span>
            {state.ready
              ? "Le fichier de l’hôtel peut être préparé."
              : "Corrigez les affectations avant l’export."}
          </span>
        </div>
        {state.errors.map((e) => (
          <p role="alert" key={e}>
            {e}
          </p>
        ))}
        <div className="voyages-gallia-bottom">
          <span role="status">{message}</span>
          {!state.ready && (
            <button onClick={diagnostic}>Exporter les points à corriger</button>
          )}
        </div>
      </main>
      <DemoFooter>
        Personnes et hôtel fictifs. Chaque durée commence le 18 octobre et
        compte de une à trois nuits. L’ajout d’une chambre ne réserve rien.
      </DemoFooter>
    </div>
  );
}
