require("dotenv").config();
const express = require("express");
const { processarMensagem } = require("./bot");
const store = require("./store");

const app = express();
app.use(express.json());

// Endpoint de vida — útil para testar se o servidor está no ar
app.get("/", (req, res) => {
  res.send("GX WhatsApp Bot está rodando ✅");
});

// Webhook chamado pela Z-API quando uma mensagem chega no WhatsApp
// Configure esta URL em: painel Z-API > sua instância > Webhooks > "Ao receber"
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    // A Z-API envia mensagens de texto neste formato (pode variar por versão da API,
    // confira o payload real no painel se necessário)
    const telefone = body.phone;
    const textoMensagem =
      body.text && body.text.message
        ? body.text.message
        : body.message || null;

    // Ignora mensagens enviadas pelo próprio bot/número (fromMe) e mensagens sem texto
    if (!telefone || !textoMensagem || body.fromMe) {
      return res.sendStatus(200);
    }

    await processarMensagem(telefone, textoMensagem);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Erro no webhook:", err);
    return res.sendStatus(200); // sempre 200 para a Z-API não reenviar em loop
  }
});

// Endpoint simples para você consultar os leads coletados pelo bot
app.get("/leads", (req, res) => {
  res.json(store.listarLeads());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
