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
  
  const [pixelId, setPixelId] = useState("");
  const [pixelEvents, setPixelEvents] = useState<Record<string, string>>({
    CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: ""
  });
  
  const [tikTokPixelId, setTikTokPixelId] = useState("");
  const [tikTokEvents, setTikTokEvents] = useState<Record<string, string>>({
    CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: ""
  });
  
  const [googlePixelId, setGooglePixelId] = useState("");
  const [googleEvents, setGoogleEvents] = useState<Record<string, string>>({
    CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: ""
  });
  
  // Accordion state
  const [expandedTracker, setExpandedTracker] = useState<"META" | "TIKTOK" | "GOOGLE" | null>(null);

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
      setTikTokPixelId(center.tikTokPixelId || "");
      setGooglePixelId(center.googlePixelId || "");
      
      let events = { CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" };
      if (center.pixelEvents) {
        try { const parsed = JSON.parse(center.pixelEvents); events = { ...events, ...parsed }; } catch (e) {}
      }
      setPixelEvents(events);
      
      let ttEvents = { CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" };
      if (center.tikTokEvents) {
        try { const parsed = JSON.parse(center.tikTokEvents); ttEvents = { ...ttEvents, ...parsed }; } catch (e) {}
      }
      setTikTokEvents(ttEvents);
      
      let gEvents = { CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" };
      if (center.googleEvents) {
        try { const parsed = JSON.parse(center.googleEvents); gEvents = { ...gEvents, ...parsed }; } catch (e) {}
      }
      setGoogleEvents(gEvents);
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
      setPixelEvents({ CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" });
      setTikTokPixelId("");
      setTikTokEvents({ CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" });
      setGooglePixelId("");
      setGoogleEvents({ CREATED: "", ACCESSED: "", STARTED: "", COMPLETED: "", REJECTED: "", ABANDONED: "" });
      setExpandedTracker(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handlePixelEventChange = (status: string, value: string) => { setPixelEvents(prev => ({ ...prev, [status]: value })); };
  const handleTikTokEventChange = (status: string, value: string) => { setTikTokEvents(prev => ({ ...prev, [status]: value })); };
  const handleGoogleEventChange = (status: string, value: string) => { setGoogleEvents(prev => ({ ...prev, [status]: value })); };

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
      pixelEvents: JSON.stringify(pixelEvents),
      tikTokPixelId,
      tikTokEvents: JSON.stringify(tikTokEvents),
      googlePixelId,
      googleEvents: JSON.stringify(googleEvents)
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

                {/* Seção Rastreamento (Accordions) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Rastreamento e Conversões</h3>
                  
                  {/* Meta Pixel */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedTracker(expandedTracker === 'META' ? null : 'META')}
                      style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: expandedTracker === 'META' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: pixelId ? 'var(--primary)' : 'inherit' }}>Meta (Facebook) Pixel</span>
                        {pixelId && <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 800 }}>ATIVO</span>}
                      </div>
                      <span style={{ fontSize: '1.2rem', transform: expandedTracker === 'META' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {expandedTracker === 'META' && (
                      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label>Pixel ID</label>
                          <input value={pixelId} onChange={e => setPixelId(e.target.value)} placeholder="Ex: 123456789012345" style={{ borderColor: 'var(--primary)' }} />
                        </div>
                        {pixelId && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Acessada</label><input value={pixelEvents.ACCESSED} onChange={e => handlePixelEventChange('ACCESSED', e.target.value)} placeholder="Ex: ViewContent" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Iniciada</label><input value={pixelEvents.STARTED} onChange={e => handlePixelEventChange('STARTED', e.target.value)} placeholder="Ex: InitiateCheckout" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Completada</label><input value={pixelEvents.COMPLETED} onChange={e => handlePixelEventChange('COMPLETED', e.target.value)} placeholder="Ex: Purchase" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Abandonada</label><input value={pixelEvents.ABANDONED} onChange={e => handlePixelEventChange('ABANDONED', e.target.value)} placeholder="Opcional" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Rejeitada</label><input value={pixelEvents.REJECTED} onChange={e => handlePixelEventChange('REJECTED', e.target.value)} placeholder="Opcional" /></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* TikTok Pixel */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedTracker(expandedTracker === 'TIKTOK' ? null : 'TIKTOK')}
                      style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: expandedTracker === 'TIKTOK' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: tikTokPixelId ? '#25F4EE' : 'inherit' }}>TikTok Pixel</span>
                        {tikTokPixelId && <span style={{ fontSize: '0.7rem', backgroundColor: '#25F4EE', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 800 }}>ATIVO</span>}
                      </div>
                      <span style={{ fontSize: '1.2rem', transform: expandedTracker === 'TIKTOK' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {expandedTracker === 'TIKTOK' && (
                      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label>Pixel ID</label>
                          <input value={tikTokPixelId} onChange={e => setTikTokPixelId(e.target.value)} placeholder="Ex: D9AC5URC77U10..." style={{ borderColor: '#25F4EE' }} />
                        </div>
                        {tikTokPixelId && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Acessada</label><input value={tikTokEvents.ACCESSED} onChange={e => handleTikTokEventChange('ACCESSED', e.target.value)} placeholder="Ex: ViewContent" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Iniciada</label><input value={tikTokEvents.STARTED} onChange={e => handleTikTokEventChange('STARTED', e.target.value)} placeholder="Ex: InitiateCheckout" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Completada</label><input value={tikTokEvents.COMPLETED} onChange={e => handleTikTokEventChange('COMPLETED', e.target.value)} placeholder="Ex: PlaceAnOrder" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Abandonada</label><input value={tikTokEvents.ABANDONED} onChange={e => handleTikTokEventChange('ABANDONED', e.target.value)} placeholder="Opcional" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Rejeitada</label><input value={tikTokEvents.REJECTED} onChange={e => handleTikTokEventChange('REJECTED', e.target.value)} placeholder="Opcional" /></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Google Tag */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                    <div 
                      onClick={() => setExpandedTracker(expandedTracker === 'GOOGLE' ? null : 'GOOGLE')}
                      style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: expandedTracker === 'GOOGLE' ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: googlePixelId ? '#4285F4' : 'inherit' }}>Google Tag (Ads/Analytics)</span>
                        {googlePixelId && <span style={{ fontSize: '0.7rem', backgroundColor: '#4285F4', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 800 }}>ATIVO</span>}
                      </div>
                      <span style={{ fontSize: '1.2rem', transform: expandedTracker === 'GOOGLE' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                    {expandedTracker === 'GOOGLE' && (
                      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <label>Measurement ID / Conversion ID</label>
                          <input value={googlePixelId} onChange={e => setGooglePixelId(e.target.value)} placeholder="Ex: G-XXXXXXXX ou AW-XXXXXXXX" style={{ borderColor: '#4285F4' }} />
                        </div>
                        {googlePixelId && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Acessada</label><input value={googleEvents.ACCESSED} onChange={e => handleGoogleEventChange('ACCESSED', e.target.value)} placeholder="Ex: page_view" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Iniciada</label><input value={googleEvents.STARTED} onChange={e => handleGoogleEventChange('STARTED', e.target.value)} placeholder="Ex: begin_checkout" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Completada</label><input value={googleEvents.COMPLETED} onChange={e => handleGoogleEventChange('COMPLETED', e.target.value)} placeholder="Ex: purchase" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Abandonada</label><input value={googleEvents.ABANDONED} onChange={e => handleGoogleEventChange('ABANDONED', e.target.value)} placeholder="Opcional" /></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}><label style={{ fontSize: '0.8rem' }}>Rejeitada</label><input value={googleEvents.REJECTED} onChange={e => handleGoogleEventChange('REJECTED', e.target.value)} placeholder="Opcional" /></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
