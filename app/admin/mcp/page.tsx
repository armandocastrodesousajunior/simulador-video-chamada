"use client";
import { useEffect, useState } from "react";
import { Copy, Check, Power, Shield, Settings2, RefreshCw } from "lucide-react";

export default function McpSettingsPage() {
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
    // Para um app stateless, "reiniciar" significa desativar e reativar.
    await handleSave({ enabled: false });
    setTimeout(() => {
      handleSave({ enabled: true });
    }, 1000);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings2 size={32} style={{ color: 'var(--primary)' }}/>
            Servidor MCP
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure a integração de Inteligência Artificial via Model Context Protocol</p>
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
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Power size={20} /> Controle Geral
            </h2>
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
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
              />
              <button className="btn" onClick={copyEndpoint} style={{ width: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {copied ? <Check size={18} color="#22c55e" /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} /> Autenticação Exigida
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Se ativo, o cliente MCP deverá enviar o header `Authorization: Bearer [ADMIN_TOKEN]`.
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
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Ferramentas Habilitadas</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Selecione quais capacidades a Inteligência Artificial poderá usar através deste servidor MCP.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Tool 1 */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>create_call</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Permite ao modelo criar uma nova videochamada enviando o ID da central e opcionalmente o ID externo (lead).</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.toolCreateCall} 
                onChange={(e) => handleSave({ toolCreateCall: e.target.checked })}
                style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: '0.25rem' }}
              />
            </div>

            {/* Tool 2 */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>get_call</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Permite consultar os dados em tempo real de uma videochamada específica pelo seu token único.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.toolGetCall} 
                onChange={(e) => handleSave({ toolGetCall: e.target.checked })}
                style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: '0.25rem' }}
              />
            </div>

            {/* Tool 3 */}
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>list_external_calls</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Retorna o histórico completo das chamadas vinculadas a um ID do CRM (External ID), ordenadas das mais recentes.</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.toolListExternal} 
                onChange={(e) => handleSave({ toolListExternal: e.target.checked })}
                style={{ width: 20, height: 20, accentColor: 'var(--primary)', marginTop: '0.25rem' }}
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
