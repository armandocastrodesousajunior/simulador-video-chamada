# Sistema de Videochamada Simulada

Plataforma de simulação de videochamadas responsiva e desenhada para dispositivos móveis, com interface idêntica a uma ligação nativa do Telegram. Criada para aquecimento de leads, disparos de marketing e alta conversão através de gatilhos visuais e rastreamento de retenção (watch time).

---

## 📞 Estados da Ligação (Call Status)

Cada simulação passa por um ciclo de vida rigoroso para garantir que o comportamento do lead seja 100% mapeável no painel administrativo e através de webhooks.

* **`CREATED`**: O link da videochamada foi gerado pelo painel Admin ou pela API, mas ainda não foi clicado.
* **`ACCESSED`**: O lead clicou no link e a tela (simulando que o celular está tocando) foi carregada. Fica aguardando ação.
* **`STARTED`**: O lead clicou no botão verde de **Aceitar/Vídeo**. O vídeo gravado começou a reproduzir e o cronômetro interno (watch time) iniciou.
* **`COMPLETED`**: O vídeo gravado terminou de rodar até o último segundo sem interrupções. O lead assistiu 100%.
* **`REJECTED`**: O lead clicou no botão vermelho de **Recusar** antes mesmo de atender. (Watch Time = 0s, Porcentagem = 0%).
* **`ABANDONED`**: O lead atendeu a ligação (`STARTED`), mas desligou clicando no botão vermelho, ou então fechou a aba do navegador no meio do vídeo. O tempo assistido exato é salvo.

*(Existe também o status `EXPIRED` a nível de banco de dados, disponível para implementação futura de regras de validade de link).*

---

## 📡 Webhooks

O sistema dispara alertas em tempo real via Webhook para a URL cadastrada na "Central de Chamada". O disparo é assíncrono (não bloqueia a UI).

### Eventos Disparados
* `call.created`: Disparado quando o link é gerado no painel.
* `call.accessed`: Disparado no exato momento que a página de chamada termina de carregar no navegador do lead.
* `call.started`: Disparado quando o lead atende a ligação.
* `call.completed`: Disparado quando o lead assiste o vídeo inteiro.
* `call.rejected`: Disparado quando o lead recusa a chamada na tela inicial.
* `call.abandoned`: Disparado quando o lead fecha o navegador ou desliga no meio do vídeo.

### Formato do Payload (JSON)
Sempre que o webhook for disparado, sua aplicação receberá um POST com a estrutura abaixo:

```json
{
  "callId": "uuid-da-chamada",
  "externalId": "id-do-cliente-no-seu-sistema", 
  "event": "call.completed", 
  "timestamp": "2026-07-03T12:00:00.000Z",
  "payload": {
    "watchTime": 28,
    "watchPercentage": 100
  }
}
```

#### Detalhes do `payload`:
- **`watchTime`**: O número exato de segundos que o lead passou assistindo o vídeo ativo. (Se `REJECTED`, sempre será 0).
- **`watchPercentage`**: A porcentagem (`0` a `100`) de conclusão com base na duração real do vídeo. O próprio navegador extrai o tamanho exato da mídia dinamicamente. Se a chamada for finalizada, será `100`.

---

## 🔌 API Pública (Consultar Status da Chamada)

Se você precisa consultar as informações da simulação antes, durante ou depois via API (ex: no seu CRM), você pode usar o endpoint público.

**`GET /api/calls/[token]`**

**Retorno (Exemplo para uma ligação já encerrada/abandonada):**
```json
{
  "id": "uuid-da-chamada",
  "status": "ABANDONED",
  "watchTime": 14,
  "watchPercentage": 50,
  "callCenter": {
    "name": "Central de Vendas 1",
    "displayName": "Amanda Silva",
    "avatar": "url-do-avatar.png"
  },
  "media": {
    "type": "URL",
    "url": "https://meubucket.com/video.mp4",
    "duration": 28
  }
}
```

> **Nota de Segurança:** Por padrão, a interface do projeto foi desenvolvida na política de **Sessão Única**. Se o status da ligação for `CLOSED`, `COMPLETED`, `REJECTED` ou `ABANDONED`, ao tentar abrir a página novamente o frontend bloqueará a visualização com uma tela de "Conexão Segura / Sessão Inválida", protegendo assim seu material de gravação de tela.

---

## 🛠️ Tecnologias e Configuração
- Next.js 16.2.9 (App Router)
- Prisma (SQLite)
- Servidor dev padrão: `http://localhost:2376` (porta customizada no package.json).
- O painel administrativo é acessado em `/admin` (protegido por Basic Auth/Middleware, dependendo da configuração no `proxy.ts`).
