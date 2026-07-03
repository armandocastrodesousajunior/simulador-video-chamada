"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, X, Video as VideoIcon } from "lucide-react";

export default function MediaPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [filteredMedias, setFilteredMedias] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("LOCAL");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadMedias = async () => {
    const res = await fetch("/api/admin/media");
    const data = await res.json();
    setMedias(data);
    setFilteredMedias(data);
  };

  useEffect(() => { loadMedias(); }, []);

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredMedias(medias.filter(m => 
      m.name.toLowerCase().includes(lower) || m.url.toLowerCase().includes(lower)
    ));
  }, [search, medias]);

  // Extrair duração automaticamente do vídeo (URL ou Arquivo Local)
  const extractDuration = (src: string) => {
    const video = document.createElement("video");
    video.src = src;
    video.onloadedmetadata = () => {
      setDuration(Math.round(video.duration).toString());
    };
  };

  useEffect(() => {
    if (type === "URL" && url && !editingId) {
      extractDuration(url);
    }
  }, [url, type, editingId]);

  useEffect(() => {
    if (type === "LOCAL" && file && !editingId) {
      const objectUrl = URL.createObjectURL(file);
      extractDuration(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file, type, editingId]);

  const openModal = (media?: any) => {
    if (media) {
      setEditingId(media.id);
      setName(media.name);
      setType(media.type);
      setUrl(media.url);
      setDuration(media.duration ? String(media.duration) : "");
      setFile(null);
    } else {
      setEditingId(null);
      setName("");
      setType("LOCAL");
      setUrl("");
      setDuration("");
      setFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editingId) {
      // Editar
      await fetch(`/api/admin/media/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, url, duration })
      });
    } else {
      // Criar
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      if (type === "URL") formData.append("url", url);
      if (type === "LOCAL" && file) formData.append("file", file);
      if (duration) formData.append("duration", duration);

      await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });
    }

    closeModal();
    loadMedias();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta mídia?")) {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        loadMedias();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Cabeçalho e Pesquisa */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mídias</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Gerencie os vídeos utilizados nas suas chamadas falsas.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar mídia..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', backgroundColor: 'var(--bg-surface-solid)' }}
            />
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={18} /> Adicionar
          </button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {filteredMedias.map(m => (
          <div key={m.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Preview do Vídeo */}
            <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
              <video 
                src={m.url} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                controls
                preload="metadata"
              />
            </div>
            
            {/* Informações */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <VideoIcon size={18} style={{ color: 'var(--primary)' }}/> {m.name}
                </h3>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  {m.type}
                </span>
              </div>
              
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Duração: {m.duration ? `${m.duration}s` : 'Desconhecida'}
              </div>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => openModal(m)} className="btn btn-secondary" style={{ flex: 1 }}>
                  <Edit size={16} /> Editar
                </button>
                <button onClick={() => handleDelete(m.id)} className="btn btn-danger" style={{ padding: '0.75rem' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredMedias.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhuma mídia encontrada.
          </div>
        )}
      </div>

      {/* Modal de Adicionar/Editar */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'var(--bg-surface-solid)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{editingId ? "Editar Mídia" : "Adicionar Mídia"}</h2>
              <button onClick={closeModal} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Nome da Mídia</label>
                  <input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                {!editingId && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Tipo</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                      <option value="LOCAL">Upload Local</option>
                      <option value="URL">URL Externa</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Duração do Vídeo (Segundos)</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  placeholder="Calculado automaticamente..." 
                  required 
                  readOnly 
                  style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                />
              </div>

              {(type === "URL" || editingId) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>URL do Vídeo</label>
                  <input type="url" value={url} onChange={e => setUrl(e.target.value)} required />
                </div>
              )}

              {type === "LOCAL" && !editingId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label>Arquivo de Vídeo</label>
                  <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar Mídia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
