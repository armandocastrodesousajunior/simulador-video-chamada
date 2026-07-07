"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Network } from "lucide-react";

export default function CentersPage() {
  const [centers, setCenters] = useState<any[]>([]);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [mediaId, setMediaId] = useState("");
  const [enforceUniqueExternalId, setEnforceUniqueExternalId] = useState(false);
  const [allowRetryIfNotCompleted, setAllowRetryIfNotCompleted] = useState(false);
  const [requireEndCallConfirmation, setRequireEndCallConfirmation] = useState(true);
  
  // Pixel states
  const [pixelId, setPixelId] = useState("");
  const [pixelEvents, setPixelEvents] = useState<Record<string, string>>({
    CREATED: "",
    ACCESSED: "",
    STARTED: "",
    COMPLETED: "",
    REJECTED: "",
    ABANDONED: ""
  });

  const loadData = async () => {
    const resCenters = await fetch("/api/admin/centers");
    setCenters(await resCenters.json());
    
    const resMedias = await fetch("/api/admin/media");
    setMedias(await resMedias.json());
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (center?: any) => {
    if (center) {
      setEditingId(center.id);
      setName(center.name);
      setDisplayName(center.displayName);
      setAvatar(center.avatar || "");
      setWebhookUrl(center.webhookUrl || "");
      setMediaId(center.mediaId);
      setEnforceUniqueExternalId(center.enforceUniqueExternalId);
      setAllowRetryIfNotCompleted(center.allowRetryIfNotCompleted);
      setRequireEndCallConfirmation(center.requireEndCallConfirmation ?? true);
      setPixelId(center.pixelId || "");
      
      let events = {
        CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: ""
      };
      if (center.pixelEvents) {
        try {
          const parsed = JSON.parse(center.pixelEvents);
          events = { ...events, ...parsed };
        } catch (e) {}
      }
      setPixelEvents(events);
    } else {
      setEditingId(null);
      setName("");
      setDisplayName("");
      setAvatar("");
      setWebhookUrl("");
      setMediaId("");
      setEnforceUniqueExternalId(false);
      setAllowRetryIfNotCompleted(false);
      setRequireEndCallConfirmation(true);
      setPixelId("");
      setPixelEvents({
        CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: ""
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handlePixelEventChange = (status: string, value: string) => {
    setPixelEvents(prev => ({ ...prev, [status]: value }));
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
      allowRetryIfNotCompleted,
      requireEndCallConfirmation,
      pixelId,
      pixelEvents: JSON.stringify(pixelEvents)
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

    closeModal();
    loadData();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta central?")) {
      const res = await fetch(`/api/admin/centers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        loadData();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>Centrais</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie os atores/personas e suas regras de vídeo.</p>
        </div>
        
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={18} /> Nova Central
        </button>
      </div>

      {/* Grid de Centrais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {centers.map(c => (
          <div key={c.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--bg-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {c.avatar ? <img src={c.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Network size={24} color="var(--text-muted)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</h3>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(c.id); alert('ID copiado: ' + c.id); }}
                    className="btn btn-secondary" 
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    title="Copiar ID da Central"
                  >
                    Copiar ID
                  </button>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Exibição: {c.displayName}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', padding: '1rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Mídia:</span>
                <span>{c.media?.name || "Nenhuma"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Webhook:</span>
                <span>{c.webhookUrl ? "Configurado" : "Não"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pixel da Meta:</span>
                <span style={{ color: c.pixelId ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {c.pixelId ? "Ativo" : "Desativado"}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unicidade:</span>
                <span style={{ color: c.enforceUniqueExternalId ? 'var(--success)' : 'var(--text-secondary)' }}>
                  {c.enforceUniqueExternalId ? (c.allowRetryIfNotCompleted ? "Com Exceção" : "Bloqueio Total") : "Desativado"}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button onClick={() => openModal(c)} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }}>
                <Edit size={16} /> Editar
              </button>
              <button onClick={() => handleDelete(c.id)} className="btn btn-danger" style={{ padding: '0.5rem 1rem' }}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {centers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma central cadastrada.
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', backgroundColor: 'var(--bg-surface-solid)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingId ? "Editar Central" : "Criar Nova Central"}</h2>
              <button onClick={closeModal} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <div style={{ overflowY: 'auto', padding: '2rem' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Nome Interno</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Central Vendas" required />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Nome Exibido</label>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ex: Ana Silva" required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Avatar (URL da foto)</label>
                    <input type="url" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Webhook URL (Opcional)</label>
                    <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Mídia Vinculada</label>
                  <select value={mediaId} onChange={e => setMediaId(e.target.value)} required style={{ backgroundColor: 'var(--bg-base)' }}>
                    <option value="">Selecione uma mídia...</option>
                    {medias.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={enforceUniqueExternalId} 
                      onChange={e => setEnforceUniqueExternalId(e.target.checked)} 
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                    />
                    Bloquear chamadas duplicadas por Lead (External ID)
                  </label>

                  {enforceUniqueExternalId && (
                    <div style={{ marginLeft: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ color: 'var(--text-secondary)' }}>Exceção da Regra:</label>
                      <select 
                        value={allowRetryIfNotCompleted ? "RETRY_ALLOWED" : "BLOCK_ALL"}
                        onChange={e => setAllowRetryIfNotCompleted(e.target.value === "RETRY_ALLOWED")}
                        style={{ backgroundColor: 'var(--bg-base)' }}
                      >
                        <option value="BLOCK_ALL">Bloquear sempre (Nenhuma exceção)</option>
                        <option value="RETRY_ALLOWED">Permitir nova chamada se a anterior foi rejeitada/expirada</option>
                      </select>
                    </div>
                  )}
                  
                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={requireEndCallConfirmation} 
                      onChange={e => setRequireEndCallConfirmation(e.target.checked)} 
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                    />
                    Requerer confirmação ao desligar (Modal de 3s)
                  </label>
                </div>

                {/* Seção Meta Pixel */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--primary)', padding: '1.5rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>Integração Meta Pixel (Opcional)</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Pixel ID</label>
                    <input 
                      value={pixelId} 
                      onChange={e => setPixelId(e.target.value)} 
                      placeholder="Ex: 123456789012345" 
                      style={{ borderColor: 'var(--primary)' }}
                    />
                  </div>

                  {pixelId && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Configure abaixo os eventos do Facebook que devem ser disparados em cada status da chamada (deixe em branco se não quiser rastrear aquele status). 
                        Ex: <b>ViewContent, InitiateCheckout, Purchase</b>.
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Acessada (ACCESSED)</label>
                          <input value={pixelEvents.ACCESSED} onChange={e => handlePixelEventChange('ACCESSED', e.target.value)} placeholder="Ex: ViewContent" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Iniciada (STARTED)</label>
                          <input value={pixelEvents.STARTED} onChange={e => handlePixelEventChange('STARTED', e.target.value)} placeholder="Ex: InitiateCheckout" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Completada (COMPLETED)</label>
                          <input value={pixelEvents.COMPLETED} onChange={e => handlePixelEventChange('COMPLETED', e.target.value)} placeholder="Ex: Purchase" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Abandonada (ABANDONED)</label>
                          <input value={pixelEvents.ABANDONED} onChange={e => handlePixelEventChange('ABANDONED', e.target.value)} placeholder="Deixar vazio..." />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.8rem' }}>Rejeitada (REJECTED)</label>
                          <input value={pixelEvents.REJECTED} onChange={e => handlePixelEventChange('REJECTED', e.target.value)} placeholder="Deixar vazio..." />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={loading || !mediaId}>
                    {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Criar Central"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
