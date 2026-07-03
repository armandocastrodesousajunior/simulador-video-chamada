"use client";
import { useState, useEffect } from "react";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [callCenterId, setCallCenterId] = useState("");
  const [externalId, setExternalId] = useState("");

  const loadData = async () => {
    setLoading(true);
    const resCalls = await fetch("/api/admin/calls");
    setCalls(await resCalls.json());

    const resCenters = await fetch("/api/admin/centers");
    setCenters(await resCenters.json());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callCenterId) return;
    setCreating(true);

    try {
      await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callCenterId, externalId }),
      });
      
      setCallCenterId("");
      setExternalId("");
      loadData();
    } catch (error) {
      console.error("Error creating call", error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "COMPLETED": return "var(--success)";
      case "ABANDONED": return "var(--danger)";
      case "REJECTED": return "#f97316"; // Laranja para recusado
      case "STARTED": return "var(--primary)";
      case "ACCESSED": return "#eab308";
      default: return "var(--text-secondary)";
    }
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/call/${token}`;
    navigator.clipboard.writeText(url);
    alert("Link copiado com sucesso!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Gerenciamento de Chamadas</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Gerar Nova Chamada</h2>
        <form onSubmit={handleCreateCall} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Central de Chamada</label>
              <select value={callCenterId} onChange={e => setCallCenterId(e.target.value)} required>
                <option value="">Selecione uma central...</option>
                {centers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.displayName})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>ID Externo do Cliente (Opcional)</label>
              <input 
                value={externalId} 
                onChange={e => setExternalId(e.target.value)} 
                placeholder="Ex: cliente_123" 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={creating || !callCenterId} style={{ alignSelf: 'flex-start' }}>
            {creating ? "Gerando..." : "Gerar Link de Chamada"}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Histórico de Chamadas</h2>
        {loading && calls.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Carregando chamadas...</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0' }}>ID</th>
                <th style={{ padding: '1rem 0' }}>Central</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Criação</th>
                <th style={{ padding: '1rem 0' }}>Tempo Assistido</th>
                <th style={{ padding: '1rem 0' }}>% Assistido</th>
                <th style={{ padding: '1rem 0' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontFamily: 'monospace', fontSize: '0.875rem' }}>{c.id.split('-')[0]}</td>
                  <td style={{ padding: '1rem 0' }}>{c.callCenter?.name}</td>
                  <td style={{ padding: '1rem 0', color: getStatusColor(c.status), fontWeight: 600 }}>{c.status}</td>
                  <td style={{ padding: '1rem 0' }}>{new Date(c.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {c.status === "REJECTED" || !c.watchTime ? "0s" : 
                      c.callCenter?.media?.duration 
                        ? `${c.watchTime}s de ${c.callCenter.media.duration}s` 
                        : `${c.watchTime}s`
                    }
                  </td>
                  <td style={{ padding: '1rem 0', fontWeight: 600, color: c.watchPercentage >= 80 ? 'var(--success)' : 'inherit' }}>
                    {c.status === "REJECTED" || !c.watchTime ? "0%" : `${c.watchPercentage || 0}%`}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <button onClick={() => copyLink(c.token)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      🔗 Copiar Link
                    </button>
                  </td>
                </tr>
              ))}
              {calls.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma chamada gerada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
