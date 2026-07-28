// Dados e textos do escritório — edite aqui sem precisar tocar na lógica do bot

module.exports = {
  nomeEscritorio: "Guilherme Xavier Advocacia",
  oab: "OAB/PR 128.882",
  cidade: "Castro, PR",
  horarioAtendimento: "Segunda a sexta, das 8h às 18h",
  endereco: "Rua Coronel Olegário de Macedo, 410, Lacustre, Castro - PR",

  areasAtuacao: [
    "Recuperação Judicial",
    "Alongamento de Crédito Rural",
    "Gestão de Passivo Bancário",
    "Execução Fiscal",
  ],

  faq: {
    horario: "Nosso horário de atendimento é: Segunda a sexta, das 8h às 18h.",
    endereco: "Estamos localizados na Rua Coronel Olegário de Macedo, 410, Lacustre, Castro - PR.",
    areas:
      "Atuamos principalmente em:\n• Recuperação Judicial\n• Alongamento de Crédito Rural\n• Gestão de Passivo Bancário\n• Execução Fiscal",
  },

  mensagens: {
    boasVindas:
      "Olá! 👋 Você está falando com o atendimento virtual da *Guilherme Xavier Advocacia* (OAB/PR 128.882).\n\nComo posso te ajudar hoje?\n\n1️⃣ Falar sobre meu caso\n2️⃣ Agendar uma consulta\n3️⃣ Horário de atendimento\n4️⃣ Endereço\n5️⃣ Áreas de atuação\n6️⃣ Falar com um atendente humano",
    menuInvalido:
      "Não entendi sua resposta 🙏 Digite o número de uma das opções abaixo:\n\n1️⃣ Falar sobre meu caso\n2️⃣ Agendar uma consulta\n3️⃣ Horário de atendimento\n4️⃣ Endereço\n5️⃣ Áreas de atuação\n6️⃣ Falar com um atendente humano",
    pedirNome: "Perfeito! Para começar, qual é o seu nome completo?",
    pedirTipoCaso:
      "Obrigado, {nome}! Qual é o assunto do seu caso? (ex: recuperação judicial, dívida rural, execução fiscal, passivo bancário, outro)",
    pedirValorCausa:
      "Entendido. Para direcionarmos seu atendimento com prioridade correta, poderia informar o valor aproximado envolvido no caso (valor da dívida ou da causa)? Pode ser uma estimativa.",
    confirmacaoLead:
      "Obrigado pelas informações, {nome}! ✅\n\nJá registramos seu caso e um de nossos advogados vai te retornar em breve.",
    pedirDataAgendamento:
      "Vamos agendar sua consulta! Qual dia e horário seriam melhores para você? (ex: quinta-feira às 14h)",
    confirmacaoAgendamento:
      "Recebemos sua solicitação de agendamento para: {data}.\n\nUm de nossos advogados vai confirmar a disponibilidade e retornar em breve. 📅",
    direcionarHumano:
      "Sem problemas! Já avisamos um advogado do escritório, que vai te responder por aqui em breve. 🙋",
    encerrarMenu:
      "Posso te ajudar com mais alguma coisa? Digite *menu* para ver as opções novamente.",
  },
};
