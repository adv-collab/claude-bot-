# Bot de Atendimento WhatsApp — Guilherme Xavier Advocacia

Chatbot de atendimento via WhatsApp usando Z-API. Funcionalidades:
- Menu inicial com opções
- Respostas de FAQ (horário, endereço, áreas de atuação)
- Coleta de dados do lead (nome, tipo de caso, valor da causa)
- Classificação automática: **IMPORTANTE** (≥ R$1M, configurável) ou **NÃO PRIORITÁRIO**
- Agendamento de consulta (coleta preferência de data/hora)
- Notificação automática pra você a cada novo lead
- Todos os leads salvos em `data/leads.json` e disponíveis em `/leads`

---

## Passo 1 — Criar conta na Z-API

1. Acesse **https://www.z-api.io** e crie uma conta.
2. Crie uma instância e conecte seu WhatsApp escaneando o QR Code (igual ao WhatsApp Web).
3. No painel da instância, copie:
   - **Instance ID**
   - **Token**
   - **Client-Token** (se seu plano exigir, geralmente aparece em "Segurança")
4. Custo aproximado: **R$69/mês** no plano de entrada (confirme o valor atual no site, pode ter mudado).

## Passo 2 — Configurar o projeto

```bash
cp .env.example .env
```

Edite o `.env` com:
- `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` (da Z-API)
- `ADVOGADO_WHATSAPP`: seu número, no formato `55DDDNUMERO` (ex: `5542999999999`) — é pra onde o bot manda o aviso de cada novo lead
- `VALOR_CORTE_IMPORTANTE`: valor de corte pra classificar como IMPORTANTE (padrão R$1.000.000)

Edite também o `config.js` e preencha o **endereço real do escritório** (está como placeholder).

## Passo 3 — Configurar o Google Sheets (armazenamento dos leads)

Assim como no fluxo do Typebot, os leads são gravados direto numa planilha do Google Sheets. Isso resolve o problema de perder dados quando o servidor reinicia no plano gratuito do Render.

1. Crie uma planilha nova no Google Sheets (pode ficar em branco — a aba "Leads" e o cabeçalho são criados automaticamente pelo bot).
2. Copie o **ID da planilha** da URL: `https://docs.google.com/spreadsheets/d/ESTE-TRECHO-AQUI/edit` → cole em `GOOGLE_SHEET_ID`.
3. Acesse o **Google Cloud Console** (https://console.cloud.google.com):
   - Crie um projeto (ou use um existente).
   - Ative a **Google Sheets API** (menu "APIs e Serviços" → "Ativar APIs e Serviços").
   - Vá em "Credenciais" → "Criar Credenciais" → **Conta de serviço** (Service Account).
   - Dentro da conta de serviço criada, vá em "Chaves" → "Adicionar chave" → **Criar chave JSON**. Um arquivo `.json` será baixado.
4. No arquivo `.json` baixado, copie:
   - `client_email` → cole em `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → cole em `GOOGLE_PRIVATE_KEY` (mantenha entre aspas, com os `\n` literais como estão no arquivo)
5. **Compartilhe a planilha** do Google Sheets com o e-mail da conta de serviço (o mesmo `client_email`), dando permissão de **Editor** — sem esse passo o bot não conseguirá escrever na planilha.

Se essas três variáveis (`GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) não forem preenchidas, o bot continua funcionando normalmente e salva os leads só no arquivo local `data/leads.json` (que se perde a cada reinício no plano free do Render).

## Passo 4 — Rodar localmente (teste)

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000`.

## Passo 5 — Publicar no Render.com

Já deixei o arquivo `render.yaml` pronto no projeto — o Render lê ele automaticamente ("Blueprint") e configura o serviço sem você precisar preencher cada campo manualmente.

1. **Suba este projeto para um repositório no GitHub** (crie um repo novo e faça push de todos os arquivos, exceto `node_modules` e `.env` — já incluí um `.gitignore`).
2. Acesse **https://dashboard.render.com** → **New** → **Blueprint**.
3. Conecte seu repositório do GitHub. O Render vai detectar o `render.yaml` automaticamente.
4. Ele vai pedir pra você preencher as variáveis marcadas como secretas:
   - `ZAPI_INSTANCE_ID`
   - `ZAPI_TOKEN`
   - `ZAPI_CLIENT_TOKEN`
   - `ADVOGADO_WHATSAPP`
5. Clique em **Apply** — o Render faz o build e o deploy automaticamente.
6. Ao terminar, copie a URL pública gerada (ex: `https://gx-whatsapp-bot.onrender.com`).

### ⚠️ Sobre o plano gratuito

O `render.yaml` está configurado com `plan: free` pra você testar sem custo. Duas limitações importantes:

- **O servidor "dorme" após ~15 min sem uso** e demora alguns segundos pra responder na primeira mensagem depois disso (cold start). Pra atendimento comercial sério, considere trocar `plan: free` por `plan: starter` (~US$7/mês) no `render.yaml`.
- **O disco persistente (`data/leads.json`) só funciona em planos pagos.** No plano free, os leads coletados são perdidos a cada novo deploy ou reinício do servidor. Se for ficar no free por enquanto, exporte os leads periodicamente pelo endpoint `/leads`, ou me avise que posso adaptar o bot pra salvar direto numa planilha do Google Sheets (como você já fez no fluxo do Typebot).

## Passo 6 — Configurar o Webhook na Z-API

No painel da Z-API → sua instância → **Webhooks**:
- Campo "Ao receber" (on-receive): `https://SUA-URL-PUBLICA/webhook`

Pronto — a partir daqui, toda mensagem recebida no WhatsApp conectado passa pelo bot automaticamente.

## Consultar os leads coletados

Acesse `https://SUA-URL-PUBLICA/leads` no navegador (ou baixe o `data/leads.json` do servidor) para ver todos os contatos e classificações.

## Personalizar textos e fluxo

- Textos e FAQ: `config.js`
- Regras de conversa (menu, perguntas, ordem): `bot.js`
- Interpretação de valores em texto livre ("1,5 milhão" etc.): `parseValor.js`

## Observação sobre o payload da Z-API

O formato exato do JSON recebido no webhook pode variar um pouco conforme a versão da API. Se o bot não estiver reconhecendo as mensagens, acesse o painel da Z-API, veja um payload de exemplo em "Webhooks" e ajuste as linhas correspondentes em `server.js` (função que lê `body.phone` e `body.text.message`).
