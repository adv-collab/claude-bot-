// Armazenamento simples em arquivo JSON — sem necessidade de banco de dados externo.
// Guarda: (1) estado da conversa de cada número, (2) leads coletados.

const fs = require("fs");
const path = require("path");
const sheets = require("./sheets");

const DATA_DIR = path.join(__dirname, "data");
const CONVERSAS_FILE = path.join(DATA_DIR, "conversas.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function ensureFile(file, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
}

function readJson(file, defaultValue) {
  ensureFile(file, defaultValue);
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    return defaultValue;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---- Estado da conversa (por número de telefone) ----
// Ex: { "555199999999": { etapa: "aguardando_nome", dados: {} } }

function getEstado(telefone) {
  const conversas = readJson(CONVERSAS_FILE, {});
  return conversas[telefone] || { etapa: "menu", dados: {} };
}

function setEstado(telefone, estado) {
  const conversas = readJson(CONVERSAS_FILE, {});
  conversas[telefone] = estado;
  writeJson(CONVERSAS_FILE, conversas);
}

function resetEstado(telefone) {
  setEstado(telefone, { etapa: "menu", dados: {} });
}

// ---- Leads ----

async function salvarLead(lead) {
  // Backup local (arquivo JSON) — útil sobretudo se o Sheets não estiver configurado
  const leads = readJson(LEADS_FILE, []);
  leads.push({ ...lead, criadoEm: new Date().toISOString() });
  writeJson(LEADS_FILE, leads);

  // Armazenamento principal: Google Sheets (se configurado no .env)
  if (sheets.habilitado()) {
    await sheets.adicionarLead(lead);
  }
}

function listarLeads() {
  return readJson(LEADS_FILE, []);
}

module.exports = {
  getEstado,
  setEstado,
  resetEstado,
  salvarLead,
  listarLeads,
};
