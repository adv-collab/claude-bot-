// Salva os leads coletados pelo bot direto numa planilha do Google Sheets,
// usando uma Service Account (sem precisar de login/OAuth interativo).

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const CABECALHO = [
  "criadoEm",
  "telefone",
  "nome",
  "tipoCaso",
  "valorCausaTexto",
  "valorCausaNumerico",
  "classificacao",
  "dataAgendamento",
  "tipo",
];

let sheetCache = null;

function habilitado() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY
  );
}

async function getSheet() {
  if (sheetCache) return sheetCache;

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    process.env.GOOGLE_SHEET_ID,
    serviceAccountAuth
  );
  await doc.loadInfo();

  const nomeAba = process.env.GOOGLE_SHEET_ABA || "Leads";
  let sheet = doc.sheetsByTitle[nomeAba];
  if (!sheet) {
    sheet = await doc.addSheet({ title: nomeAba, headerValues: CABECALHO });
  }

  sheetCache = sheet;
  return sheet;
}

async function adicionarLead(lead) {
  if (!habilitado()) return false;

  try {
    const sheet = await getSheet();
    await sheet.addRow({
      criadoEm: new Date().toISOString(),
      telefone: lead.telefone || "",
      nome: lead.nome || "",
      tipoCaso: lead.tipoCaso || "",
      valorCausaTexto: lead.valorCausaTexto || "",
      valorCausaNumerico:
        lead.valorCausaNumerico !== null && lead.valorCausaNumerico !== undefined
          ? lead.valorCausaNumerico
          : "",
      classificacao: lead.classificacao || "",
      dataAgendamento: lead.dataAgendamento || "",
      tipo: lead.tipo || "",
    });
    return true;
  } catch (err) {
    console.error(
      "Erro ao salvar lead no Google Sheets:",
      err.message || err
    );
    return false;
  }
}

module.exports = { adicionarLead, habilitado };
