export const views = [
  {
    id: "ensemble",
    name: "Ensemble",
    position: "0% 0%",
    instruction: "Une vue du siège entier, dossier et pieds visibles.",
  },
  {
    id: "assise",
    name: "Assise",
    position: "100% 0%",
    instruction: "L’assise vue de dessus, sans coussin.",
  },
  {
    id: "dessous",
    name: "Dessous",
    position: "0% 100%",
    instruction:
      "Le dessous du siège, avec le pourtour et les fixations visibles.",
  },
  {
    id: "assemblage",
    name: "Assemblage",
    position: "100% 100%",
    instruction: "Un détail de la jonction entre le bras et le dossier.",
  },
];
export const initial = () => ({
  received: { ensemble: true, assise: true, dessous: false, assemblage: false },
  points: {
    ensemble: [],
    assise: [
      { id: 1, x: 52, y: 48, text: "Trame ouverte au centre de l’assise." },
    ],
    dessous: [],
    assemblage: [],
  },
  nextId: 2,
});
export const bound = (value) =>
  Math.max(
    0,
    Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 50),
  );
export function addPoint(state, view, x = 50, y = 50) {
  if (!state.received[view] || state.points[view].length >= 12) return state;
  return {
    ...state,
    nextId: state.nextId + 1,
    points: {
      ...state.points,
      [view]: [
        ...state.points[view],
        { id: state.nextId, x: bound(x), y: bound(y), text: "" },
      ],
    },
  };
}
export function assess(state) {
  const missing = views.filter((v) => !state.received[v.id]),
    errors = [];
  for (const view of views) {
    if (!state.received[view.id]) continue;
    for (const point of state.points[view.id]) {
      if (!point.text.trim())
        errors.push(
          `${view.name}, point ${point.id} : ajoutez une observation ou supprimez le point.`,
        );
      if (
        !Number.isFinite(point.x) ||
        point.x < 0 ||
        point.x > 100 ||
        !Number.isFinite(point.y) ||
        point.y < 0 ||
        point.y > 100
      )
        errors.push(`${view.name}, point ${point.id} : position invalide.`);
    }
  }
  return {
    missing,
    errors,
    received: 4 - missing.length,
    ready: !missing.length && !errors.length,
  };
}
export function photoRequest(state) {
  const missing = assess(state).missing;
  if (!missing.length) return "";
  return [
    "Bonjour,",
    "",
    "Pour compléter le dossier du siège, pourriez-vous ajouter les vues suivantes ?",
    ...missing.map((v) => `• ${v.name} : ${v.instruction}`),
    "",
    "Merci.",
    "",
    "Brouillon à adapter. Les vues demandées servent à préparer un échange avec l’atelier. Aucun diagnostic automatique.",
  ].join("\n");
}
export function dossier(state) {
  if (!assess(state).ready) return null;
  return {
    title: "Dossier photo du siège",
    example: "Photos et observations fictives, prototype indépendant.",
    views: views.map((v) => ({
      view: v.name,
      observations: state.points[v.id].map((p) => ({
        point: p.id,
        xPercent: p.x,
        yPercent: p.y,
        text: p.text.trim(),
      })),
    })),
    limit:
      "Les observations sont saisies manuellement. Les quatre vues ne remplacent pas un examen du siège.",
  };
}
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function printableDossier(state, dataUrl) {
  const data = dossier(state);
  if (!data || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(dataUrl))
    return null;
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dossier photo du siège</title><style>body{font:16px Georgia,serif;max-width:950px;margin:40px auto;padding:0 20px;color:#27231f}h1{font-weight:400;font-size:38px}header{border-bottom:1px solid #aaa;padding-bottom:20px}section{break-inside:avoid;display:grid;grid-template-columns:360px 1fr;gap:28px;padding:28px 0;border-bottom:1px solid #ddd}.photo{aspect-ratio:1;background-size:200%;position:relative;background-image:url('${dataUrl}')}.pin{position:absolute;transform:translate(-50%,-50%);background:#84523b;color:white;border:2px solid white;border-radius:50%;min-width:25px;height:25px;display:grid;place-items:center;font:14px Arial}li{margin-bottom:18px;line-height:1.6}small{display:block;color:#68615a}@media(max-width:650px){section{grid-template-columns:1fr}.photo{max-width:400px}}@media print{body{margin:0}.photo{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style><header><p>ATELIER FOGGIA · DÉMONSTRATION INDÉPENDANTE</p><h1>Dossier photo du siège</h1><p>Photos et observations fictives. Aucun diagnostic automatique.</p></header>${views.map((v) => `<section><div class="photo" style="background-position:${v.position}">${state.points[v.id].map((p) => `<span class="pin" style="left:${bound(p.x)}%;top:${bound(p.y)}%">${p.id}</span>`).join("")}</div><div><h2>${v.name}</h2>${state.points[v.id].length ? `<ol>${state.points[v.id].map((p) => `<li value="${p.id}">${esc(p.text.trim())}<small>Position ${Math.round(p.x)} % / ${Math.round(p.y)} %</small></li>`).join("")}</ol>` : "<p>Aucune observation saisie pour cette vue.</p>"}</div></section>`).join("")}<footer><p>${esc(data.limit)}</p></footer></html>`;
}
