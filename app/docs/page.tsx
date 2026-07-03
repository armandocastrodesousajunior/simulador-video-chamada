"use client";

import { useState, useEffect } from "react";

const STATUSES = [
  {
    name: "CREATED",
    color: "#7b8fa3",
    bg: "rgba(123,143,163,0.12)",
    border: "rgba(123,143,163,0.3)",
    dot: "#7b8fa3",
    label: "Criado",
    desc: "Link gerado pelo Admin ou API. Lead ainda não acessou.",
    watchTime: false,
  },
  {
    name: "ACCESSED",
    color: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.3)",
    dot: "#eab308",
    label: "Acessado",
    desc: "Lead clicou no link. Tela de chamada carregou. Aguardando ação.",
    watchTime: false,
  },
  {
    name: "STARTED",
    color: "#4a80ff",
    bg: "rgba(74,128,255,0.1)",
    border: "rgba(74,128,255,0.3)",
    dot: "#4a80ff",
    label: "Iniciado",
    desc: "Lead clicou em Aceitar. Vídeo começou a reproduzir. Cronômetro ativo.",
    watchTime: true,
  },
  {
    name: "COMPLETED",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.3)",
    dot: "#22c55e",
    label: "Completo",
    desc: "Vídeo chegou ao final. Lead assistiu 100% da simulação.",
    watchTime: true,
  },
  {
    name: "REJECTED",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.3)",
    dot: "#f97316",
    label: "Recusado",
    desc: "Lead clicou em Recusar antes de atender. watchTime = 0s, watchPercentage = 0%.",
    watchTime: false,
  },
  {
    name: "ABANDONED",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    dot: "#ef4444",
    label: "Abandonado",
    desc: "Lead atendeu, mas encerrou a chamada ou fechou o navegador antes do vídeo acabar.",
    watchTime: true,
  },
];

const WEBHOOK_EVENTS = [
  { event: "call.created", trigger: "Link de videochamada gerado", status: "CREATED" },
  { event: "call.accessed", trigger: "Lead abriu a página de chamada no navegador", status: "ACCESSED" },
  { event: "call.started", trigger: "Lead clicou em Aceitar / atendeu a ligação", status: "STARTED" },
  { event: "call.completed", trigger: "Vídeo chegou ao fim — lead assistiu 100%", status: "COMPLETED" },
  { event: "call.rejected", trigger: "Lead recusou a chamada antes de atender", status: "REJECTED" },
  { event: "call.abandoned", trigger: "Lead desligou ou fechou o navegador no meio do vídeo", status: "ABANDONED" },
];

const ROUTES = [
  {
    id: "list-calls",
    method: "GET",
    path: "/api/admin/calls",
    auth: true,
    title: "Listar Todas as Chamadas",
    description: "Retorna o histórico completo de todas as chamadas geradas, incluindo status, tempo assistido e porcentagem de retenção.",
    response: `[
  {
    "id": "b47bf15e-...",
    "token": "uuid-do-token",
    "externalId": "lead_123",
    "status": "COMPLETED",
    "watchTime": 28,
    "watchPercentage": 100,
    "startedAt": "2026-07-03T12:00:00.000Z",
    "endedAt": "2026-07-03T12:00:28.000Z",
    "createdAt": "2026-07-03T11:59:50.000Z",
    "callCenter": {
      "name": "Central Vendas",
      "media": { "duration": 28 }
    }
  }
]`,
  },
  {
    id: "create-call",
    method: "POST",
    path: "/api/admin/calls",
    auth: true,
    title: "Criar Nova Chamada (Gerar Link)",
    description: "Gera um novo link de videochamada para um lead. Retorna o token que será usado na URL da chamada. Dispara o webhook call.created.",
    body: `{
  "callCenterId": "uuid-da-central",
  "externalId": "id-do-lead-no-seu-crm"
}`,
    response: `{
  "id": "uuid-da-chamada",
  "token": "token-para-o-link",
  "externalId": "id-do-lead-no-seu-crm",
  "status": "CREATED",
  "watchTime": 0,
  "createdAt": "2026-07-03T12:00:00.000Z",
  "callCenterId": "uuid-da-central"
}`,
    notes: [
      "O link de acesso para o lead será: {BASE_URL}/call/{token}",
      "externalId é opcional mas recomendado para rastrear o lead no seu CRM.",
    ],
  },
  {
    id: "get-call",
    method: "GET",
    path: "/api/calls/[token]",
    auth: false,
    title: "Consultar Status de uma Chamada (Pública)",
    description: "Retorna as informações completas de uma chamada pelo token, incluindo status atual, tempo assistido e porcentagem de retenção. Não requer autenticação.",
    response: `{
  "id": "uuid-da-chamada",
  "status": "ABANDONED",
  "watchTime": 14,
  "watchPercentage": 50,
  "callCenter": {
    "name": "Central de Vendas",
    "displayName": "Amanda Silva",
    "avatar": "https://..."
  },
  "media": {
    "type": "URL",
    "url": "https://meubucket.com/video.mp4",
    "duration": 28
  }
}`,
    notes: [
      "Use este endpoint para consultar o status de uma chamada no seu CRM após o lead acessar o link.",
      "Se a chamada não existir, retorna 404.",
    ],
  },
  {
    id: "update-call",
    method: "PATCH",
    path: "/api/calls/[token]",
    auth: false,
    title: "Atualizar Status de uma Chamada (Interno)",
    description: "Atualiza o status de uma chamada. Usada internamente pelo front-end da simulação. Dispara o webhook correspondente ao novo status.",
    body: `{
  "status": "ABANDONED",
  "watchTime": 14,
  "mediaDuration": 28
}`,
    response: `{
  "success": true
}`,
    notes: [
      "Endpoint usado internamente pela página de simulação. Não é necessário chamar manualmente.",
      "Ao receber status COMPLETED ou ABANDONED, o campo endedAt é preenchido automaticamente.",
      "mediaDuration é enviado automaticamente pelo navegador do lead — você não precisa configurar isso.",
    ],
  },
  {
    id: "list-centers",
    method: "GET",
    path: "/api/admin/centers",
    auth: true,
    title: "Listar Centrais de Chamada",
    description: "Retorna todas as centrais cadastradas, com seus dados de configuração, avatar e mídia vinculada.",
    response: `[
  {
    "id": "uuid",
    "name": "Central Vendas",
    "displayName": "Amanda Silva",
    "avatar": "https://...",
    "webhookUrl": "https://hooks.zapier.com/...",
    "mediaId": "uuid-da-midia",
    "createdAt": "2026-07-03T12:00:00.000Z"
  }
]`,
  },
  {
    id: "create-center",
    method: "POST",
    path: "/api/admin/centers",
    auth: true,
    title: "Criar Central de Chamada",
    description: "Cria uma nova central de chamada com as configurações de display, mídia e webhook.",
    body: `{
  "name": "Central Vendas",
  "displayName": "Amanda Silva",
  "avatar": "https://...",
  "webhookUrl": "https://hooks.zapier.com/...",
  "mediaId": "uuid-da-midia"
}`,
    response: `{
  "id": "uuid-da-central",
  "name": "Central Vendas",
  "displayName": "Amanda Silva",
  "createdAt": "2026-07-03T12:00:00.000Z"
}`,
  },
  {
    id: "list-media",
    method: "GET",
    path: "/api/admin/media",
    auth: true,
    title: "Listar Mídias",
    description: "Retorna todas as mídias de vídeo cadastradas no sistema.",
    response: `[
  {
    "id": "uuid",
    "name": "Vídeo de Vendas",
    "type": "URL",
    "url": "https://meubucket.com/video.mp4",
    "duration": 28,
    "createdAt": "2026-07-03T12:00:00.000Z"
  }
]`,
  },
  {
    id: "create-media",
    method: "POST",
    path: "/api/admin/media",
    auth: true,
    title: "Cadastrar Mídia",
    description: "Cadastra uma nova mídia. Suporta upload de arquivo local (multipart/form-data) ou URL externa.",
    body: `# Para URL externa:
{
  "name": "Vídeo de Vendas",
  "type": "URL",
  "url": "https://meubucket.com/video.mp4",
  "duration": 28
}

# Para upload local (multipart/form-data):
name=Vídeo de Vendas
type=LOCAL
file=<arquivo-de-video>
duration=28`,
    response: `{
  "id": "uuid-da-midia",
  "name": "Vídeo de Vendas",
  "type": "URL",
  "url": "https://...",
  "duration": 28,
  "createdAt": "2026-07-03T12:00:00.000Z"
}`,
    notes: [
      "O campo duration é obrigatório e deve ser informado em segundos.",
      "Para tipo LOCAL, o arquivo é salvo em /public/uploads/ e a URL relativa é gerada automaticamente.",
    ],
  },
];

const METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  GET: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  POST: { bg: "rgba(74,128,255,0.15)", color: "#4a80ff" },
  PATCH: { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
  DELETE: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} style={{
      position: "absolute", top: 10, right: 10,
      background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 6, padding: "4px 10px",
      color: copied ? "#22c55e" : "#7b8fa3",
      fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
      transition: "all 0.2s",
    }}>
      {copied ? "✓ Copiado" : "Copiar"}
    </button>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <CopyButton text={code} />
      <pre style={{
        background: "#080b10",
        borderRadius: 10,
        padding: "16px 16px 16px 16px",
        overflowX: "auto",
        fontSize: "0.8rem",
        lineHeight: 1.7,
        color: "#c9d1d9",
        margin: 0,
        border: "1px solid rgba(255,255,255,0.07)",
        paddingRight: 80,
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function RouteCard({ route, baseUrl }: { route: typeof ROUTES[number]; baseUrl: string }) {
  const [open, setOpen] = useState(false);
  const mc = METHOD_COLORS[route.method] || METHOD_COLORS.GET;

  const buildCurl = () => {
    const url = `${baseUrl}${route.path.replace("[token]", "{TOKEN}")}`;
    let curl = `curl -X ${route.method} "${url}"`;
    if (route.auth) curl += ` \\\n  -H "Authorization: Basic {BASE64_CREDENTIALS}"`;
    if (route.body && !route.body.startsWith("#")) {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${route.body.split("\n")[0] === "{" ? route.body : ""}'`;
    }
    return curl;
  };

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 12,
      background: "rgba(255,255,255,0.015)",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14,
          padding: "16px 20px", background: "none", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          ...mc, borderRadius: 6, padding: "3px 10px",
          fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em",
          flexShrink: 0,
        }}>
          {route.method}
        </span>
        <code style={{ color: "#c9d1d9", fontSize: "0.85rem", flex: 1 }}>{route.path}</code>
        {route.auth && (
          <span style={{
            fontSize: "0.7rem", color: "#eab308",
            background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)",
            borderRadius: 5, padding: "2px 8px", flexShrink: 0,
          }}>🔒 Auth</span>
        )}
        <span style={{ color: "#7b8fa3", fontSize: "0.9rem" }}>{open ? "▲" : "▼"}</span>
        <span style={{ color: "#fff", fontWeight: 500, fontSize: "0.9rem", marginLeft: 4 }}>{route.title}</span>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ color: "#7b8fa3", margin: 0, lineHeight: 1.6, fontSize: "0.9rem" }}>{route.description}</p>

          {route.notes && (
            <div style={{
              background: "rgba(74,128,255,0.08)", borderLeft: "3px solid #4a80ff",
              borderRadius: "0 8px 8px 0", padding: "10px 14px",
            }}>
              {route.notes.map((n, i) => (
                <p key={i} style={{ margin: "2px 0", color: "#c9d1d9", fontSize: "0.82rem" }}>💡 {n}</p>
              ))}
            </div>
          )}

          {route.body && (
            <div>
              <p style={{ color: "#7b8fa3", fontSize: "0.78rem", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Request Body</p>
              <CodeBlock code={route.body} />
            </div>
          )}

          {route.response && (
            <div>
              <p style={{ color: "#7b8fa3", fontSize: "0.78rem", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Response (200)</p>
              <CodeBlock code={route.response} />
            </div>
          )}

          <div>
            <p style={{ color: "#7b8fa3", fontSize: "0.78rem", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>cURL</p>
            <CodeBlock code={buildCurl()} lang="bash" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const navItems = [
    { id: "overview", label: "Visão Geral" },
    { id: "statuses", label: "Estados da Chamada" },
    { id: "api-reference", label: "API Reference" },
    { id: "webhooks", label: "Webhooks" },
    { id: "payload", label: "Parâmetros de Retorno" },
  ];

  const webhookExample = `{
  "callId": "b47bf15e-...",
  "externalId": "lead_123",
  "event": "call.abandoned",
  "timestamp": "2026-07-03T12:00:14.000Z",
  "payload": {
    "watchTime": 14,
    "watchPercentage": 50
  }
}`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070a0f",
      color: "#c9d1d9",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 40px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "rgba(7,10,15,0.85)",
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #4a80ff, #b062ff)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}>📞</div>
          <div>
            <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>VideoCall API</span>
            <span style={{
              marginLeft: 10, fontSize: "0.7rem", color: "#4a80ff",
              background: "rgba(74,128,255,0.1)", border: "1px solid rgba(74,128,255,0.3)",
              borderRadius: 20, padding: "2px 8px", fontWeight: 600,
            }}>v1.0</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.75rem", color: "#7b8fa3" }}>Base URL:</span>
          <code style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6, padding: "3px 10px", fontSize: "0.78rem", color: "#4a80ff",
          }}>{baseUrl || "http://localhost:2376"}</code>
        </div>
      </header>

      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto" }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0, padding: "32px 20px",
          position: "sticky", top: 60, height: "calc(100vh - 60px)",
          overflowY: "auto",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  background: activeSection === item.id ? "rgba(74,128,255,0.12)" : "none",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  color: activeSection === item.id ? "#4a80ff" : "#7b8fa3",
                  fontWeight: activeSection === item.id ? 600 : 400,
                  fontSize: "0.875rem",
                  borderLeft: activeSection === item.id ? "2px solid #4a80ff" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20 }}>
            <a href="/admin" style={{
              display: "block", padding: "8px 12px",
              color: "#7b8fa3", textDecoration: "none", fontSize: "0.82rem",
              borderRadius: 8,
            }}>← Painel Admin</a>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "40px 40px 80px", minWidth: 0 }}>

          {/* OVERVIEW */}
          {activeSection === "overview" && (
            <section>
              <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                Documentação da API
              </h1>
              <p style={{ color: "#7b8fa3", fontSize: "1rem", lineHeight: 1.7, margin: "0 0 40px" }}>
                Plataforma de simulação de videochamadas com rastreamento completo do ciclo de vida do lead —
                desde o acesso ao link até a conclusão ou abandono. Integre via Webhook ou consulte via REST API.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 40 }}>
                {[
                  { icon: "📡", title: "Webhooks em Tempo Real", desc: "Notificações instantâneas em cada evento do lead." },
                  { icon: "📊", title: "Watch Time + Retenção", desc: "Saiba exatamente quantos segundos e qual % o lead assistiu." },
                  { icon: "🔒", title: "Sessão Única", desc: "Cada link só pode ser acessado uma vez por segurança." },
                  { icon: "📱", title: "Mobile First", desc: "Interface idêntica à videochamada nativa do Telegram." },
                ].map(card => (
                  <div key={card.title} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "20px",
                  }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{card.icon}</div>
                    <p style={{ color: "#fff", fontWeight: 600, margin: "0 0 4px", fontSize: "0.9rem" }}>{card.title}</p>
                    <p style={{ color: "#7b8fa3", margin: 0, fontSize: "0.8rem", lineHeight: 1.5 }}>{card.desc}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600, marginBottom: 12 }}>Fluxo Básico de Integração</h2>
              <div style={{ position: "relative" }}>
                {[
                  { step: "1", text: "Crie uma Central de Chamada no Admin com a URL do seu webhook e a mídia desejada." },
                  { step: "2", text: "Via API POST /api/admin/calls, gere um link para o lead com o externalId dele do seu CRM." },
                  { step: "3", text: "Envie o link /call/{token} para o lead (ex: pelo Telegram, WhatsApp, SMS)." },
                  { step: "4", text: "Receba os eventos em tempo real no seu webhook e acione automações." },
                ].map(item => (
                  <div key={item.step} style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #4a80ff, #b062ff)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                    }}>{item.step}</div>
                    <p style={{ color: "#c9d1d9", margin: "4px 0 0", lineHeight: 1.6, fontSize: "0.9rem" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STATUSES */}
          {activeSection === "statuses" && (
            <section>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Estados da Chamada</h1>
              <p style={{ color: "#7b8fa3", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 32px" }}>
                Cada videochamada passa por um ciclo de vida bem definido. O campo <code style={{ color: "#4a80ff" }}>status</code> reflete o estado atual e é atualizado em tempo real.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {STATUSES.map(s => (
                  <div key={s.name} style={{
                    background: s.bg, border: `1px solid ${s.border}`,
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "flex-start", gap: 16,
                  }}>
                    <code style={{
                      background: "rgba(0,0,0,0.3)", borderRadius: 6,
                      padding: "3px 10px", color: s.color, fontWeight: 700,
                      fontSize: "0.82rem", flexShrink: 0, letterSpacing: "0.04em",
                    }}>{s.name}</code>
                    <div>
                      <p style={{ color: "#fff", fontWeight: 600, margin: "0 0 3px", fontSize: "0.9rem" }}>{s.label}</p>
                      <p style={{ color: "#7b8fa3", margin: 0, fontSize: "0.84rem", lineHeight: 1.5 }}>{s.desc}</p>
                    </div>
                    <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                      {s.watchTime ? (
                        <span style={{ fontSize: "0.72rem", color: "#22c55e", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 5, padding: "2px 8px" }}>⏱ watchTime ativo</span>
                      ) : (
                        <span style={{ fontSize: "0.72rem", color: "#7b8fa3", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 5, padding: "2px 8px" }}>watchTime = 0</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* API REFERENCE */}
          {activeSection === "api-reference" && (
            <section>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>API Reference</h1>
              <p style={{ color: "#7b8fa3", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 8px" }}>
                Clique em cada rota para expandir os detalhes, exemplos de request/response e o cURL pronto para copiar.
              </p>
              <div style={{
                background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: 8, padding: "10px 16px", marginBottom: 28,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span>🔒</span>
                <span style={{ color: "#eab308", fontSize: "0.84rem" }}>
                  Rotas marcadas com <strong>Auth</strong> requerem credenciais de administrador (Basic Auth ou sessão autenticada).
                </span>
              </div>

              <h2 style={{ color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Chamadas</h2>
              {ROUTES.filter(r => r.path.includes("calls")).map(route => (
                <RouteCard key={route.id} route={route} baseUrl={baseUrl} />
              ))}

              <h2 style={{ color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, marginTop: 28 }}>Centrais</h2>
              {ROUTES.filter(r => r.path.includes("centers")).map(route => (
                <RouteCard key={route.id} route={route} baseUrl={baseUrl} />
              ))}

              <h2 style={{ color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, marginTop: 28 }}>Mídias</h2>
              {ROUTES.filter(r => r.path.includes("media")).map(route => (
                <RouteCard key={route.id} route={route} baseUrl={baseUrl} />
              ))}
            </section>
          )}

          {/* WEBHOOKS */}
          {activeSection === "webhooks" && (
            <section>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Webhooks</h1>
              <p style={{ color: "#7b8fa3", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 32px" }}>
                Sempre que um evento ocorre no ciclo de vida de uma chamada, um <code style={{ color: "#4a80ff" }}>POST</code> é disparado automaticamente
                para a URL de webhook configurada na Central de Chamada. O disparo é assíncrono e não bloqueia a experiência do lead.
              </p>

              <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: 12 }}>Eventos Disponíveis</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                {WEBHOOK_EVENTS.map(e => (
                  <div key={e.event} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "12px 16px",
                  }}>
                    <code style={{
                      color: "#4a80ff", background: "rgba(74,128,255,0.1)",
                      border: "1px solid rgba(74,128,255,0.2)",
                      borderRadius: 6, padding: "3px 10px", fontSize: "0.8rem",
                      flexShrink: 0, fontWeight: 600,
                    }}>{e.event}</code>
                    <span style={{ color: "#c9d1d9", fontSize: "0.85rem" }}>{e.trigger}</span>
                    <code style={{
                      marginLeft: "auto", fontSize: "0.72rem", flexShrink: 0,
                      color: STATUSES.find(s => s.name === e.status)?.color || "#7b8fa3",
                      background: STATUSES.find(s => s.name === e.status)?.bg || "rgba(255,255,255,0.04)",
                      border: `1px solid ${STATUSES.find(s => s.name === e.status)?.border || "rgba(255,255,255,0.08)"}`,
                      borderRadius: 5, padding: "2px 8px",
                    }}>{e.status}</code>
                  </div>
                ))}
              </div>

              <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: 12 }}>Exemplo de Payload Recebido</h2>
              <CodeBlock code={webhookExample} />

              <div style={{
                marginTop: 20, background: "rgba(74,128,255,0.08)", borderLeft: "3px solid #4a80ff",
                borderRadius: "0 8px 8px 0", padding: "14px 18px",
              }}>
                <p style={{ color: "#fff", fontWeight: 600, margin: "0 0 6px", fontSize: "0.9rem" }}>💡 Dicas de Integração</p>
                <ul style={{ color: "#c9d1d9", margin: 0, paddingLeft: 20, fontSize: "0.84rem", lineHeight: 1.8 }}>
                  <li>Use <code style={{ color: "#4a80ff" }}>externalId</code> para mapear o evento ao lead no seu CRM automaticamente.</li>
                  <li>Configure automações no Zapier, Make ou n8n para acionar e-mails, etiquetas ou follow-ups baseados no evento <code style={{ color: "#4a80ff" }}>call.completed</code>.</li>
                  <li>Use <code style={{ color: "#4a80ff" }}>watchPercentage ≥ 80</code> como critério para identificar "leads quentes".</li>
                  <li>Falhas no webhook não afetam a experiência do lead — o sistema tenta uma vez e falha silenciosamente.</li>
                </ul>
              </div>
            </section>
          )}

          {/* PAYLOAD */}
          {activeSection === "payload" && (
            <section>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Parâmetros de Retorno</h1>
              <p style={{ color: "#7b8fa3", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 32px" }}>
                Referência completa de todos os campos retornados pela API e enviados nos payloads de Webhook.
              </p>

              {[
                {
                  title: "Objeto Raiz da Chamada (Call)",
                  fields: [
                    { name: "id", type: "string (UUID)", desc: "Identificador único interno da chamada." },
                    { name: "token", type: "string (UUID)", desc: "Token único usado na URL do lead: /call/{token}." },
                    { name: "externalId", type: "string | null", desc: "ID do lead no seu sistema externo (CRM, etc.)." },
                    { name: "status", type: "string (enum)", desc: "Estado atual da chamada. Ver seção 'Estados da Chamada'." },
                    { name: "watchTime", type: "number (segundos)", desc: "Quantidade de segundos que o lead passou com o vídeo ativo. Zero se não atendeu." },
                    { name: "watchPercentage", type: "number (0–100)", desc: "Porcentagem da mídia assistida. Calculada como (watchTime / mediaDuration) × 100. Zero se não atendeu ou duração desconhecida." },
                    { name: "startedAt", type: "ISO DateTime | null", desc: "Timestamp exato de quando o lead clicou em Aceitar." },
                    { name: "endedAt", type: "ISO DateTime | null", desc: "Timestamp exato de quando a chamada foi encerrada (concluída, abandonada ou recusada)." },
                    { name: "createdAt", type: "ISO DateTime", desc: "Timestamp de criação do link." },
                  ],
                },
                {
                  title: "Objeto callCenter (Central de Chamada)",
                  fields: [
                    { name: "name", type: "string", desc: "Nome interno da central (ex: 'Central Vendas Q3')." },
                    { name: "displayName", type: "string", desc: "Nome exibido na tela do lead durante a simulação (ex: 'Amanda Silva')." },
                    { name: "avatar", type: "string (URL) | null", desc: "URL da foto de perfil exibida na videochamada." },
                  ],
                },
                {
                  title: "Objeto media (Mídia)",
                  fields: [
                    { name: "url", type: "string (URL)", desc: "URL do arquivo de vídeo reproduzido durante a simulação." },
                    { name: "type", type: "URL | LOCAL", desc: "Indica se a mídia é uma URL externa ou arquivo armazenado localmente no servidor." },
                    { name: "duration", type: "number (segundos) | null", desc: "Duração real da mídia em segundos. Auto-detectada e salva no primeiro acesso do lead, ou informada manualmente no cadastro da mídia." },
                  ],
                },
                {
                  title: "Objeto payload (dentro do Webhook)",
                  fields: [
                    { name: "watchTime", type: "number (segundos)", desc: "Tempo assistido pelo lead em segundos no momento do evento." },
                    { name: "watchPercentage", type: "number (0–100)", desc: "Porcentagem de retenção calculada automaticamente no servidor no momento do evento." },
                  ],
                },
              ].map(section => (
                <div key={section.title} style={{ marginBottom: 32 }}>
                  <h2 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: 12 }}>{section.title}</h2>
                  <div style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, overflow: "hidden",
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Campo</th>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tipo</th>
                          <th style={{ padding: "10px 16px", textAlign: "left", color: "#7b8fa3", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.fields.map((field, i) => (
                          <tr key={field.name} style={{ borderBottom: i < section.fields.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <code style={{ color: "#4a80ff", fontSize: "0.82rem" }}>{field.name}</code>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{
                                color: "#eab308", background: "rgba(234,179,8,0.08)",
                                border: "1px solid rgba(234,179,8,0.15)",
                                borderRadius: 5, padding: "2px 8px", fontSize: "0.75rem",
                              }}>{field.type}</span>
                            </td>
                            <td style={{ padding: "12px 16px", color: "#7b8fa3", fontSize: "0.84rem", lineHeight: 1.5 }}>{field.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
