// Wrapper simples para enviar mensagens de texto via Z-API
// Docs: https://developer.z-api.io/

const axios = require("axios");

function baseUrl() {
  const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;
  return `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}`;
}

function headers() {
  const h = { "Content-Type": "application/json" };
  if (process.env.ZAPI_CLIENT_TOKEN) {
    h["Client-Token"] = process.env.ZAPI_CLIENT_TOKEN;
  }
  return h;
}

async function enviarTexto(telefone, mensagem) {
  try {
    await axios.post(
      `${baseUrl()}/send-text`,
      { phone: telefone, message: mensagem },
      { headers: headers() }
    );
  } catch (err) {
    console.error(
      "Erro ao enviar mensagem via Z-API:",
      err.response ? err.response.data : err.message
    );
  }
}

module.exports = { enviarTexto };
