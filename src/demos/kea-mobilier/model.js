export function validate(f) {
  const errors = [];
  if (!Number.isInteger(f.width) || f.width < 600 || f.width > 5000)
    errors.push("Largeur attendue entre 600 et 5 000 mm.");
  if (!Number.isInteger(f.height) || f.height < 600 || f.height > 3500)
    errors.push("Hauteur attendue entre 600 et 3 500 mm.");
  if (!Number.isInteger(f.depth) || f.depth < 200 || f.depth > 1000)
    errors.push("Profondeur attendue entre 200 et 1 000 mm.");
  if (f.width / f.modules.length < 300)
    errors.push("Chaque travée doit faire au moins 300 mm dans cet exemple.");
  return errors;
}
export const base = {
  width: 2400,
  height: 2500,
  depth: 600,
  finish: "Chêne naturel",
  modules: ["Penderie", "Étagères", "Penderie"],
  plinth: true,
  socket: true,
  slope: false,
  measured: false,
};
