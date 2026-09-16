import React, { useState } from "react";
import "@fontsource/montserrat/latin-400.css";
import "@fontsource/montserrat/latin-600.css";
import { DemoNotice, DemoFooter, useDocumentTitle } from "../../shared/ui.jsx";
import { downloadText } from "../../shared/files.js";
import { initial, stageNames, missing, edit, validate } from "./model.js";
import "./styles.css";
function MotorDrawing() {
  return (
    <svg
      viewBox="0 0 430 200"
      role="img"
      aria-label="Croquis de matériel électromécanique fictif, sans valeur de diagnostic"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M96 77L140 58H288L326 79V150L288 165H140L96 145Z M140 58V165 M288 58V165 M96 77V145 M326 79H355V150H326 M355 101H400V127H355 M150 165V181H184V165 M253 165V181H283V165 M179 58V30H254V58 M187 36H246V52H187Z" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${151 + i * 13} 72V152`} />
        ))}
        <ellipse cx="110" cy="112" rx="11" ry="30" />
        <path d="M65 112H94M65 108V116 M376 94V135 M366 181H408 M381 173V188" />
        <circle cx="205" cy="43" r="2" />
        <circle cx="229" cy="43" r="2" />
      </g>
      <text
        x="30"
        y="195"
        fill="currentColor"
        fontFamily="Arial"
        fontSize="7"
        letterSpacing="2"
      >
        CROQUIS D’INTENTION · DONNÉES FICTIVES
      </text>
    </svg>
  );
}
export default function App() {
  useDocumentTitle("Rémy Pascal · Carnet matériel");
  const [tickets, setTickets] = useState(structuredClone(initial));
  const [selected, setSelected] = useState(initial[0].id);
  const [stage, setStage] = useState(0);
  const [message, setMessage] = useState("");
  const s = tickets.find((t) => t.id === selected);
  const update = (key, value) => {
    setTickets((ts) =>
      ts.map((t) => (t.id === selected ? edit(t, key, value) : t)),
    );
    setMessage(
      "Les validations concernées sont à reprendre après modification.",
    );
  };
  function confirm() {
    const errors = missing(s, stage);
    if (errors.length) {
      setMessage(errors.join(" "));
      return;
    }
    setTickets((ts) =>
      ts.map((t) => (t.id === selected ? validate(t, stage) : t)),
    );
    setMessage(`Étape « ${stageNames[stage]} » consignée dans l’exemple.`);
    if (stage < 3) setStage(stage + 1);
  }
  function exportTicket() {
    downloadText(
      `remy-pascal-${s.id}.txt`,
      `FICHE MATÉRIEL · EXEMPLE INDÉPENDANT\n${s.id} / ${s.type}\n${s.reference}\nRepère ${s.serial}\nPuissance ${s.power}\nTension ${s.voltage}\nIntervenant déclaré ${s.technician}\n\nÀ LA RÉCEPTION\nAccessoires : ${s.accessories}\nSymptôme rapporté : ${s.symptom}\n\nCOMPTE RENDU PROFESSIONNEL\n${s.diagnosis || "Non renseigné"}\n\nACCORD\n${s.approval ? "Déclaré reçu" : "Non déclaré"}\n${s.approvalRef}\n\nRESTITUTION\nContrôle final / référence : ${s.testNote || "Non renseigné"}\nDestinataire : ${s.recipient || "Non renseigné"}\n\nÉTAPES\n${stageNames.map((name, i) => `${name} : ${s.stages[i] ? "consignée" : "à consigner"}`).join("\n")}\n\nDonnées fictives. Aucune mesure électrique, diagnostic ou aptitude à la remise en service n’est déterminé par ce prototype. Validations et accord sont déclaratifs.`,
    );
    setMessage("Fiche téléchargée avec son état actuel.");
  }
  function field(k, l, multi = false) {
    return (
      <label>
        {l}
        {multi ? (
          <textarea
            rows="4"
            value={s[k]}
            maxLength="1500"
            onChange={(e) => update(k, e.target.value)}
          />
        ) : (
          <input
            value={s[k]}
            maxLength="120"
            onChange={(e) => update(k, e.target.value)}
          />
        )}
      </label>
    );
  }
  return (
    <div className="remy-pascal-app">
      <DemoNotice company="Rémy Pascal Bobinage" />
      <header className="remy-pascal-header">
        <b>
          RÉMY PASCAL<span>BOBINAGE · ÉLECTROMÉCANIQUE</span>
        </b>
        <span>LE CARNET DU MATÉRIEL</span>
        <button
          onClick={() => {
            setTickets(structuredClone(initial));
            setSelected(initial[0].id);
            setStage(0);
            setMessage("Exemple réinitialisé.");
          }}
        >
          Reprendre l’exemple ↺
        </button>
      </header>
      <main>
        <div className="remy-pascal-heading">
          <div>
            <p>ATELIER / SUIVI DE MATÉRIEL</p>
            <h1>
              Du dépôt au retour. <br />
              <span>Le même dossier.</span>
            </h1>
          </div>
          <span>
            03 MATÉRIELS D’EXEMPLE <br />
            AUCUNE DONNÉE CLIENT
          </span>
        </div>
        <div className="remy-pascal-work">
          <aside className="remy-pascal-queue">
            <h2>À l’atelier</h2>
            {tickets.map((t, i) => (
              <button
                key={t.id}
                className={selected === t.id ? "selected" : ""}
                onClick={() => {
                  setSelected(t.id);
                  setStage(0);
                  setMessage("");
                }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{t.type}</b>
                  <small>{t.id}</small>
                  <p>{t.stages.filter(Boolean).length} / 4 étapes consignées</p>
                </div>
              </button>
            ))}
            <p>
              Un identifiant accompagne le matériel, ses accessoires et les
              comptes rendus.
            </p>
          </aside>
          <section className="remy-pascal-ticket">
            <div className="remy-pascal-ticket-head">
              <div>
                <span>FICHE MATÉRIEL</span>
                <h2>{s.id}</h2>
              </div>
              <span className={s.stages.every(Boolean) ? "ready" : ""}>
                {s.stages.every(Boolean) ? "Dossier complété" : "En cours"}
              </span>
            </div>
            <div className="remy-pascal-plate">
              <div>
                <span>
                  {s.type.toUpperCase()} / REPÈRE {s.serial}
                </span>
                <h3>{s.reference}</h3>
                <dl>
                  <div>
                    <dt>PUISSANCE SAISIE</dt>
                    <dd>{s.power}</dd>
                  </div>
                  <div>
                    <dt>TENSION SAISIE</dt>
                    <dd>{s.voltage}</dd>
                  </div>
                </dl>
              </div>
              <MotorDrawing />
            </div>
            <nav className="remy-pascal-stages" aria-label="Étapes du dossier">
              {stageNames.map((name, i) => (
                <button
                  key={name}
                  className={stage === i ? "active" : ""}
                  aria-pressed={stage === i}
                  onClick={() => setStage(i)}
                >
                  <b>{s.stages[i] ? "✓" : i + 1}</b>
                  <span>{name}</span>
                </button>
              ))}
            </nav>
            <section className="remy-pascal-form">
              <div className="remy-pascal-form-title">
                <span>ÉTAPE {stage + 1}</span>
                <h2>{stageNames[stage]}</h2>
              </div>
              {stage === 0 ? (
                <>
                  <div className="remy-pascal-pair">
                    {field("reference", "Désignation du matériel")}
                    {field("serial", "Repère ou numéro relevé")}
                    {field("power", "Puissance relevée ou « À relever »")}
                    {field("voltage", "Tension relevée ou « À relever »")}
                  </div>
                  {field("accessories", "Accessoires et éléments reçus", true)}
                  {field(
                    "symptom",
                    "Symptôme rapporté, sans diagnostic automatique",
                    true,
                  )}
                  {field("technician", "Intervenant déclaré")}
                </>
              ) : stage === 1 ? (
                <>
                  {field(
                    "diagnosis",
                    "Compte rendu rédigé par le professionnel",
                    true,
                  )}
                  <p>
                    Consignez ici vos constats ou la référence de votre rapport.
                    L’outil n’interprète aucune mesure et ne recommande aucune
                    réparation.
                  </p>
                </>
              ) : stage === 2 ? (
                <>
                  <label className="remy-pascal-check">
                    <input
                      type="checkbox"
                      checked={s.approval}
                      onChange={(e) => update("approval", e.target.checked)}
                    />
                    Je déclare avoir reçu l’accord du client pour le périmètre
                    discuté.
                  </label>
                  {field(
                    "approvalRef",
                    "Référence, date ou contexte de l’accord",
                  )}
                  <p>
                    Ce suivi n’envoie aucune demande et ne recueille pas de
                    signature. La preuve de l’accord reste dans votre dossier
                    habituel.
                  </p>
                </>
              ) : (
                <>
                  {field(
                    "testNote",
                    "Référence du contrôle final ou observations du professionnel",
                    true,
                  )}
                  {field("recipient", "Destinataire déclaré de la restitution")}
                  <p>
                    Consigner cette étape ne vaut pas autorisation de remise en
                    service ni contrôle de sécurité automatisé.
                  </p>
                </>
              )}
              <div className="remy-pascal-actions">
                <button
                  onClick={confirm}
                  disabled={s.stages[stage] || missing(s, stage).length > 0}
                >
                  {s.stages[stage]
                    ? "Étape consignée ✓"
                    : "Consigner cette étape →"}
                </button>
                <span>
                  {missing(s, stage).join(" ") || "Champs requis renseignés."}
                </span>
              </div>
            </section>
          </section>
        </div>
        <div className="remy-pascal-export">
          <div>
            <h2>
              {s.stages.filter(Boolean).length} étapes consignées pour {s.id}
            </h2>
            <p>
              L’export garde les champs renseignés et signale les étapes encore
              ouvertes.
            </p>
          </div>
          <button onClick={exportTicket}>Télécharger la fiche ↓</button>
        </div>
        <p role="status" className="remy-pascal-status">
          {message ||
            "Complétez l’intervenant puis consignez la réception pour ouvrir la suite du parcours."}
        </p>
      </main>
      <DemoFooter>
        Les saisies sont déclaratives et fictives. Ce prototype n’analyse pas de
        mesures électriques et ne réalise aucun diagnostic, contrôle technique
        ou autorisation de remise en service.
      </DemoFooter>
    </div>
  );
}
