export const initial = [
  {
    id: "RP-026-01",
    type: "Moteur",
    reference: "Moteur de ventilation · exemple",
    serial: "DEMO-M026",
    power: "2,2 kW · donnée fictive",
    voltage: "230/400 V · donnée fictive",
    accessories: "Poulie déposée, capot conservé avec le matériel.",
    symptom:
      "Bruit inhabituel rapporté par le déposant. Aucune cause confirmée.",
    technician: "",
    diagnosis: "",
    approval: false,
    approvalRef: "",
    testNote: "",
    recipient: "",
    stages: [false, false, false, false],
  },
  {
    id: "RP-026-02",
    type: "Pompe",
    reference: "Pompe de circulation · exemple",
    serial: "DEMO-P014",
    power: "À relever",
    voltage: "À relever",
    accessories: "Corps et raccords reçus séparément.",
    symptom: "Débit jugé insuffisant par le déposant.",
    technician: "",
    diagnosis: "",
    approval: false,
    approvalRef: "",
    testNote: "",
    recipient: "",
    stages: [false, false, false, false],
  },
  {
    id: "RP-026-03",
    type: "Réducteur",
    reference: "Réducteur d’entraînement · exemple",
    serial: "DEMO-R008",
    power: "Sans objet",
    voltage: "Sans objet",
    accessories: "Réducteur seul.",
    symptom: "Suintement signalé, origine non vérifiée.",
    technician: "",
    diagnosis: "",
    approval: false,
    approvalRef: "",
    testNote: "",
    recipient: "",
    stages: [false, false, false, false],
  },
];
export const stageNames = [
  "Réception",
  "Compte rendu atelier",
  "Accord déclaré",
  "Restitution",
];
export function missing(s, stage) {
  if (stage > 0 && !s.stages[stage - 1])
    return ["Valider d’abord l’étape précédente."];
  if (stage === 0)
    return [
      ["reference", "la désignation"],
      ["serial", "le repère matériel"],
      ["technician", "l’intervenant"],
    ]
      .filter(([k]) => !s[k].trim())
      .map(([, label]) => `Renseigner ${label}.`);
  if (stage === 1)
    return s.diagnosis.trim()
      ? []
      : ["Saisir le compte rendu du professionnel."];
  if (stage === 2)
    return [
      ...(!s.approval ? ["Déclarer l’accord reçu."] : []),
      ...(!s.approvalRef.trim()
        ? ["Renseigner sa référence ou son contexte."]
        : []),
    ];
  return [
    ...(!s.testNote.trim()
      ? ["Saisir la référence du contrôle final ou ses observations."]
      : []),
    ...(!s.recipient.trim()
      ? ["Renseigner le destinataire de la restitution."]
      : []),
  ];
}
export function edit(s, key, value) {
  let reset = 0;
  if (["diagnosis"].includes(key)) reset = 1;
  else if (["approval", "approvalRef"].includes(key)) reset = 2;
  else if (["testNote", "recipient"].includes(key)) reset = 3;
  return {
    ...s,
    [key]: value,
    stages: s.stages.map((done, i) => (i < reset ? done : false)),
    ...(reset < 2 ? { approval: false, approvalRef: "" } : {}),
  };
}
export function validate(s, stage) {
  return missing(s, stage).length
    ? s
    : { ...s, stages: s.stages.map((done, i) => (i === stage ? true : done)) };
}
