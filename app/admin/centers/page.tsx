"use client";
import { useState, useEffect } from "react";

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [mediaId, setMediaId] = useState("");
  
  const [enforceUniqueExternalId, setEnforceUniqueExternalId] = useState(false);
  const [allowRetryIfNotCompleted, setAllowRetryIfNotCompleted] = useState(false);

  const loadData = async () => {
    const resCenters = await fetch("/api/admin/centers");
    setCenters(await resCenters.json());
    
    const resMedias = await fetch("/api/admin/media");
    setMedias(await resMedias.json());
  };

  useEffect(() => { loadData(); }, []);

  const handleEditClick = (center: any) => {
    setEditingId(center.id);
    setName(center.name);
    setDisplayName(center.displayName);
    setAvatar(center.avatar || "");
    setWebhookUrl(center.webhookUrl || "");
    setMediaId(center.mediaId);
    setEnforceUniqueExternalId(center.enforceUniqueExternalId);
    setAllowRetryIfNotCompleted(center.allowRetryIfNotCompleted);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDisplayName("");
    setAvatar("");
    setWebhookUrl("");
    setMediaId("");
    setEnforceUniqueExternalId(false);
    setAllowRetryIfNotCompleted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { 
      name, 
      displayName, 
      avatar, 
      webhookUrl, 
      mediaId,
      enforceUniqueExternalId,
      allowRetryIfNotCompleted
    };

    if (editingId) {
      await fetch(`/api/admin/centers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    handleCancelEdit();
    loadData();
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Centrais de Chamada</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? "Editar Central" : "Criar Central"}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome Interno da Central</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Central Vendas" required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome Exibido ao Usuário</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ex: Ana Silva" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>URL do Avatar (Foto de perfil)</label>
              <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>URL do Webhook</label>
              <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Mídia Vinculada</label>
            <select value={mediaId} onChange={e => setMediaId(e.target.value)} required>
              <option value="">Selecione uma mídia...</option>
              {medias.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={enforceUniqueExternalId} 
                onChange={e => setEnforceUniqueExternalId(e.target.checked)} 
              />
              Gerar apenas UMA chamada por Identificador Único (externalId)
            </label>

            {enforceUniqueExternalId && (
              <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Exceção da Regra (O que fazer com o bloqueio):</label>
                <select 
                  value={allowRetryIfNotCompleted ? "RETRY_ALLOWED" : "BLOCK_ALL"}
                  onChange={e => setAllowRetryIfNotCompleted(e.target.value === "RETRY_ALLOWED")}
                >
                  <option value="BLOCK_ALL">Bloquear em todos os cenários (Nenhuma exceção)</option>
                  <option value="RETRY_ALLOWED">Bloquear exceto se não concluiu (Permitir nova chamada se anterior foi rejeitada/expirada)</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading || !mediaId}>
              {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Central"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary" disabled={loading}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Centrais Cadastradas</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 0' }}>Nome</th>
              <th style={{ padding: '1rem 0' }}>Exibição</th>
              <th style={{ padding: '1rem 0' }}>Mídia</th>
              <th style={{ padding: '1rem 0' }}>Webhook</th>
              <th style={{ padding: '1rem 0' }}>Regra Unicidade</th>
              <th style={{ padding: '1rem 0' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {centers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 0' }}>{c.name}</td>
                <td style={{ padding: '1rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.avatar && <img src={c.avatar} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
                    {c.displayName}
                  </div>
                </td>
                <td style={{ padding: '1rem 0' }}>{c.media?.name}</td>
                <td style={{ padding: '1rem 0' }}>{c.webhookUrl ? "Configurado" : "Não configurado"}</td>
                <td style={{ padding: '1rem 0' }}>
                  {c.enforceUniqueExternalId ? (
                    <span style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                      Ativada ({c.allowRetryIfNotCompleted ? "c/ Exceção" : "Total"})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Desativada</span>
                  )}
                </td>
                <td style={{ padding: '1rem 0' }}>
                  <button onClick={() => handleEditClick(c)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
