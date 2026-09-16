export const initial = {
  width: 16,
  length: 20,
  guests: 120,
  aisle: 1.4,
  clearance: 1,
};
export function layout(f) {
  const valid =
    Number.isFinite(f.width) &&
    f.width >= 5 &&
    f.width <= 40 &&
    Number.isFinite(f.length) &&
    f.length >= 5 &&
    f.length <= 60 &&
    Number.isInteger(f.guests) &&
    f.guests >= 1 &&
    f.guests <= 600 &&
    Number.isFinite(f.aisle) &&
    f.aisle >= 0.8 &&
    f.aisle <= 3 &&
    Number.isFinite(f.clearance) &&
    f.clearance >= 0.5 &&
    f.clearance <= 3;
  if (!valid)
    return {
      valid: false,
      error:
        "Indiquez un espace de 5 à 40 m sur 5 à 60 m, 1 à 600 invités, une allée de 0,8 à 3 m et un retrait de 0,5 à 3 m.",
      tables: [],
      capacity: 0,
      needed: 0,
      missing: 0,
    };
  const half = (f.width - 2 * f.clearance - f.aisle) / 2,
    cols = Math.max(0, Math.floor(half / 2.4)),
    rows = Math.max(0, Math.floor((f.length - 2 * f.clearance) / 2.8)),
    capacity = cols * rows * 2,
    needed = Math.ceil(f.guests / 6),
    tables = [];
  for (let r = 0; r < rows; r++)
    for (let side = 0; side < 2; side++)
      for (let c = 0; c < cols; c++) {
        if (tables.length < needed)
          tables.push({
            id: tables.length + 1,
            x: f.clearance + (side ? half + f.aisle : 0) + c * 2.4 + 0.8,
            y: f.clearance + r * 2.8 + 0.5,
            w: 0.8,
            h: 1.8,
          });
      }
  return {
    valid: true,
    tables,
    capacity,
    needed,
    missing: Math.max(0, needed - capacity),
    seats: tables.length * 6,
    area: f.width * f.length,
  };
}
