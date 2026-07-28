// Extrai um valor numérico aproximado a partir de texto livre em português,
// aceitando formatos como "1.000.000", "1000000", "1,5 milhão", "500 mil", "R$ 800.000"

function parseValor(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase().replace(/r\$/g, "").trim();

  // "1,5 milhão" / "1.5 milhões" / "2 milhoes"
  const milhaoMatch = t.match(/(\d+[.,]?\d*)\s*milh/);
  if (milhaoMatch) {
    const num = parseFloat(milhaoMatch[1].replace(",", "."));
    return num * 1_000_000;
  }

  // "500 mil" / "800mil"
  const milMatch = t.match(/(\d+[.,]?\d*)\s*mil\b/);
  if (milMatch) {
    const num = parseFloat(milMatch[1].replace(",", "."));
    return num * 1_000;
  }

  // Número puro, possivelmente com pontos de milhar: "1.000.000" ou "1000000" ou "800.000,50"
  const numMatch = t.match(/[\d.,]+/);
  if (numMatch) {
    let raw = numMatch[0];
    // Remove pontos de milhar e normaliza vírgula decimal
    if (raw.includes(",")) {
      raw = raw.replace(/\./g, "").replace(",", ".");
    } else if ((raw.match(/\./g) || []).length > 1) {
      raw = raw.replace(/\./g, "");
    }
    const num = parseFloat(raw);
    if (!isNaN(num)) return num;
  }

  return null;
}

module.exports = { parseValor };
