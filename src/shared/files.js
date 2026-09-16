export function downloadText(
  filename,
  content,
  type = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function toCsv(headers, rows) {
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")
  );
}
export function downloadCsv(filename, headers, rows) {
  downloadText(filename, toCsv(headers, rows), "text/csv;charset=utf-8");
}
export function downloadJson(filename, value) {
  downloadText(
    filename,
    JSON.stringify(value, null, 2),
    "application/json;charset=utf-8",
  );
}
export function euro(cents) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
export function parseQuantity(raw, { min = 0, max = 100000 } = {}) {
  const number = Number(String(raw).replace(",", "."));
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
}
