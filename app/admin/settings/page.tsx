"use client";
import { useEffect, useState } from "react";
import { Copy, Check, Power, Shield, Settings2, RefreshCw, Cpu, Globe } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("mcp");

  return (
    <div style={{ maxWidth: "1000px" }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Configurações</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Gerencie as preferências globais do Simulate Call e integrações avançadas.
      </p>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        borderBottom: '1px solid var(--border)', 
        marginBottom: '2rem' 
      }}>
        <button 
          onClick={() => setActiveTab("general")}
          style={{
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === "general" ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === "general" ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === "general" ? 600 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Globe size={18} />
          Geral
        </button>
        <button 
          onClick={() => setActiveTab("mcp")}
          style={{
            padding: '1rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === "mcp" ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === "mcp" ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === "mcp" ? 600 : 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Cpu size={18} />
          Servidor MCP
        </button>
      </div>

      {activeTab === "general" && <GeneralSettingsTab />}

      {activeTab === "mcp" && <McpSettingsTab />}
    </div>
  );
}

function GeneralSettingsTab() {
  const [info, setInfo] = useState<{ expirationDays: number; cutoffDate: string; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const loadInfo = () => {
    fetch("/api/admin/cleanup")
      .then(res => res.json())
      .then(data => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleManualCleanup = async () => {
    if (!confirm("Deseja executar a limpeza de logs e chamadas expiradas agora?")) return;
    setCleaning(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/cleanup", { method: "POST" });
      const data = await res.json();
      setResult(data);
      loadInfo();
    } catch (e) {
      alert("Erro ao executar limpeza");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Card Retenção de Logs */}
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Política de Limpeza e Retenção de Logs</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.5 }}>
              Para evitar o acúmulo infinito de dados no banco, os eventos de chamadas (acessos, inícios, abandonos) e chamadas antigas perdem a validade após o período configurado.
            </p>
          </div>

          <button 
            onClick={handleManualCleanup} 
            disabled={cleaning}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: cleaning ? 0.7 : 1 }}
          >
            <RefreshCw size={16} className={cleaning ? "animate-spin" : ""} />
            {cleaning ? "Limpando..." : "Executar Limpeza Agora"}
          </button>
        </div>

        {/* Estatísticas e Parâmetros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Tempo de Expiração</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {loading ? "..." : info?.expirationDays ?? 7}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>dias</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
              Configurado via <code style={{ color: '#a5b4fc' }}>LOG_EXPIRATION_DAYS</code> no <code style={{ color: '#a5b4fc' }}>.env</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Data Limite de Corte</span>
            <div style={{ marginTop: '0.4rem', fontSize: '1rem', fontWeight: 600 }}>
              {loading ? "..." : info?.cutoffDate ? new Date(info.cutoffDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Calculando..."}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
              Registros anteriores a esta data são expurgados.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Limpeza Automática</span>
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--success)' }}>Ativa</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.4rem 0 0 0' }}>
              Execução periódica passiva em background.
            </p>
          </div>
        </div>

        {/* Feedback da Limpeza Manual */}
        {result && (
          <div style={{ 
            background: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '0.5rem', 
            padding: '1rem',
            fontSize: '0.9rem',
            color: result.success ? '#86efac' : '#fca5a5'
          }}>
            {result.success ? (
              <span>
                ✅ Limpeza concluída com sucesso! <strong>{result.deletedEvents}</strong> eventos de log e <strong>{result.deletedCalls}</strong> chamadas expiradas foram removidos.
              </span>
            ) : (
              <span>❌ Erro ao executar limpeza: {result.error}</span>
            )}
          </div>
        )}

        {/* Informações para Cron Job Externo */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border)', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>💡 Dica: Agendamento via Cron Externo</p>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            Se você utiliza EasyCron, Cron-Job.org ou GitHub Actions, pode disparar a limpeza diária fazendo uma requisição GET para:<br />
            <code style={{ color: '#38bdf8', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginTop: '0.3rem' }}>
              {typeof window !== 'undefined' ? window.location.origin : ""}/api/admin/cleanup?run=true
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

function McpSettingsTab() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/mcp")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleSave = async (updates: any) => {
    setSaving(true);
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    await fetch("/api/admin/mcp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    
    setSaving(false);
  };

  const copyEndpoint = () => {
    const endpoint = window.location.origin + "/mcp";
    navigator.clipboard.writeText(endpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const restartServer = async () => {
    await handleSave({ enabled: false });
    setTimeout(() => {
      handleSave({ enabled: true });
    }, 1000);
  };

  if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Carregando configurações do MCP...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Servidor MCP
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Gerencie as integrações via Model Context Protocol</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '2rem', 
            fontSize: '0.875rem', 
            fontWeight: '600',
            backgroundColor: settings.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: settings.enabled ? '#22c55e' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: settings.enabled ? '#22c55e' : '#ef4444' }} />
            {settings.enabled ? "Online" : "Offline"}
          </span>
          <button onClick={restartServer} className="btn" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }} disabled={saving}>
            <RefreshCw size={16} /> Reiniciar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Painel Principal */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Power size={18} /> Controle Geral
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{settings.enabled ? "Ligado" : "Desligado"}</span>
              <input 
                type="checkbox" 
                checked={settings.enabled} 
                onChange={(e) => handleSave({ enabled: e.target.checked })}
                style={{ width: 40, height: 20, accentColor: 'var(--primary)' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Endpoint do Servidor (SSE)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={typeof window !== 'undefined' ? window.location.origin + "/mcp" : ""} 
                readOnly 
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-primary)' }}
              />
              <button className="btn btn-secondary" onClick={copyEndpoint} style={{ width: '45px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
            <div>
              <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Shield size={18} /> Autenticação Exigida
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: 0 }}>
                O cliente MCP deverá enviar o header `Authorization: Bearer [ADMIN_TOKEN]`.
              </p>
            </div>
            <label style={{ cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={settings.requireAuth} 
                onChange={(e) => handleSave({ requireAuth: e.target.checked })}
                style={{ width: 40, height: 20, accentColor: 'var(--primary)' }}
              />
            </label>
          </div>
        </div>

        {/* Ferramentas Disponíveis */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Ferramentas Habilitadas</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Selecione quais capacidades a Inteligência Artificial poderá acessar.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {[
              { id: 'toolCreateCall', name: 'create_call', desc: 'Permite ao modelo criar uma nova videochamada enviando o ID da central e opcionalmente o ID externo (lead).' },
              { id: 'toolGetCall', name: 'get_call', desc: 'Permite consultar os dados em tempo real de uma videochamada específica pelo seu token único.' },
              { id: 'toolListExternal', name: 'list_external_calls', desc: 'Retorna o histórico completo das chamadas vinculadas a um ID do CRM (External ID), ordenadas das mais recentes.' }
            ].map(tool => (
              <div key={tool.id} style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{tool.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>{tool.desc}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings[tool.id]} 
                  onChange={(e) => handleSave({ [tool.id]: e.target.checked })}
                  style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: '0.25rem' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
