const config = require("./config");
const store = require("./store");
const { enviarTexto } = require("./zapi");
const { parseValor } = require("./parseValor");

const VALOR_CORTE = Number(process.env.VALOR_CORTE_IMPORTANTE || 1000000);

function formatar(template, dados) {
  return template.replace(/\{(\w+)\}/g, (_, key) => dados[key] || "");
}

async function processarMensagem(telefone, textoOriginal) {
  const texto = (textoOriginal || "").trim();
  const textoLower = texto.toLowerCase();
  const estado = store.getEstado(telefone);

  // Comando universal para voltar ao menu
  if (["menu", "voltar", "início", "inicio"].includes(textoLower)) {
    store.resetEstado(telefone);
    await enviarTexto(telefone, config.mensagens.boasVindas);
    return;
  }

  switch (estado.etapa) {
    case "menu":
      return tratarMenu(telefone, textoLower);

    case "aguardando_nome":
      estado.dados.nome = texto;
      estado.etapa = "aguardando_tipo_caso";
      store.setEstado(telefone, estado);
      await enviarTexto(
        telefone,
        formatar(config.mensagens.pedirTipoCaso, estado.dados)
      );
      return;

    case "aguardando_tipo_caso":
      estado.dados.tipoCaso = texto;
      estado.etapa = "aguardando_valor_causa";
      store.setEstado(telefone, estado);
      await enviarTexto(telefone, config.mensagens.pedirValorCausa);
      return;

    case "aguardando_valor_causa": {
      estado.dados.valorCausaTexto = texto;
      const valorNumerico = parseValor(texto);
      estado.dados.valorCausaNumerico = valorNumerico;
      estado.dados.classificacao =
        valorNumerico !== null && valorNumerico >= VALOR_CORTE
          ? "IMPORTANTE"
          : "NÃO PRIORITÁRIO";

      await store.salvarLead({
        telefone,
        nome: estado.dados.nome,
        tipoCaso: estado.dados.tipoCaso,
        valorCausaTexto: estado.dados.valorCausaTexto,
        valorCausaNumerico: estado.dados.valorCausaNumerico,
        classificacao: estado.dados.classificacao,
        tipo: "novo_caso",
      });

      await enviarTexto(
        telefone,
        formatar(config.mensagens.confirmacaoLead, estado.dados)
      );
      await notificarAdvogado(estado.dados);

      store.resetEstado(telefone);
      await enviarTexto(telefone, config.mensagens.encerrarMenu);
      return;
    }

    case "aguardando_data_agendamento": {
      estado.dados.dataAgendamento = texto;
      await store.salvarLead({
        telefone,
        dataAgendamento: texto,
        tipo: "agendamento",
      });
      await enviarTexto(
        telefone,
        formatar(config.mensagens.confirmacaoAgendamento, {
          data: texto,
        })
      );
      await notificarAdvogado({
        nome: telefone,
        tipoCaso: `Solicitação de agendamento para: ${texto}`,
        classificacao: "AGENDAMENTO",
      });
      store.resetEstado(telefone);
      await enviarTexto(telefone, config.mensagens.encerrarMenu);
      return;
    }

    default:
      store.resetEstado(telefone);
      await enviarTexto(telefone, config.mensagens.boasVindas);
  }
}

async function tratarMenu(telefone, opcao) {
  switch (opcao) {
    case "1":
      store.setEstado(telefone, { etapa: "aguardando_nome", dados: {} });
      await enviarTexto(telefone, config.mensagens.pedirNome);
      break;

    case "2":
      store.setEstado(telefone, {
        etapa: "aguardando_data_agendamento",
        dados: {},
      });
      await enviarTexto(telefone, config.mensagens.pedirDataAgendamento);
      break;

    case "3":
      await enviarTexto(telefone, config.faq.horario);
      await enviarTexto(telefone, config.mensagens.encerrarMenu);
      break;

    case "4":
      await enviarTexto(telefone, config.faq.endereco);
      await enviarTexto(telefone, config.mensagens.encerrarMenu);
      break;

    case "5":
      await enviarTexto(telefone, config.faq.areas);
      await enviarTexto(telefone, config.mensagens.encerrarMenu);
      break;

    case "6":
      store.resetEstado(telefone);
      await enviarTexto(telefone, config.mensagens.direcionarHumano);
      await notificarAdvogado({
        nome: telefone,
        tipoCaso: "Solicitou atendimento humano diretamente pelo bot",
        classificacao: "ATENDIMENTO_HUMANO",
      });
      break;

    default:
      await enviarTexto(telefone, config.mensagens.menuInvalido);
  }
}

async function notificarAdvogado(dados) {
  const numeroAdvogado = process.env.ADVOGADO_WHATSAPP;
  if (!numeroAdvogado) return;

  const linhas = [
    "📩 *Novo contato no bot do WhatsApp*",
    dados.nome ? `Nome: ${dados.nome}` : null,
    dados.tipoCaso ? `Assunto: ${dados.tipoCaso}` : null,
    dados.valorCausaTexto ? `Valor informado: ${dados.valorCausaTexto}` : null,
    dados.classificacao ? `Classificação: *${dados.classificacao}*` : null,
  ].filter(Boolean);

  await enviarTexto(numeroAdvogado, linhas.join("\n"));
}

module.exports = { processarMensagem };
