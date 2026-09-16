export const stages = [
  "Dessin",
  "Gabarit",
  "Forge",
  "Assemblage",
  "Peinture",
  "Remise",
];
export const initial = {
  name: "Équerre décorative",
  material: "Acier",
  width: "240",
  height: "320",
  quantity: "6",
  revision: "B",
  finish: "Noir mat",
  note: "Motif à volute. Étude décorative fictive.",
  steps: [true, true, false, false, false, false],
  pieces: [false, false, false, false, false, false],
};
export function isValid(s) {
  return (
    Number(s.width) > 0 &&
    Number(s.width) <= 2000 &&
    Number(s.height) > 0 &&
    Number(s.height) <= 2000 &&
    Number.isInteger(Number(s.quantity)) &&
    Number(s.quantity) > 0 &&
    Number(s.quantity) <= 24 &&
    s.revision.trim().length > 0 &&
    s.name.trim().length > 0
  );
}
export function changeSpec(s, key, value) {
  if (key === "quantity")
    return {
      ...s,
      [key]: value,
      steps: [false, false, false, false, false, false],
      pieces: Array(
        Math.max(0, Math.min(24, Math.floor(Number(value) || 0))),
      ).fill(false),
    };
  if (["width", "height", "revision", "material"].includes(key))
    return {
      ...s,
      [key]: value,
      steps: s.steps.map(() => false),
      pieces: s.pieces.map(() => false),
    };
  if (key === "finish")
    return {
      ...s,
      finish: value,
      steps: s.steps.map((v, i) => (i < 4 ? v : false)),
    };
  return { ...s, [key]: value };
}
export function canComplete(s, index) {
  return (
    isValid(s) &&
    (index === 0 || s.steps.slice(0, index).every(Boolean)) &&
    (index !== 2 || s.pieces.every(Boolean))
  );
}
export function toggleStage(s, index) {
  if (s.steps[index])
    return { ...s, steps: s.steps.map((v, i) => (i < index ? v : false)) };
  if (!canComplete(s, index)) return s;
  return { ...s, steps: s.steps.map((v, i) => (i === index ? true : v)) };
}
