"use client";
import { useState, useEffect } from "react";

export default function MediaPage() {
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("LOCAL");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const loadMedias = async () => {
    const res = await fetch("/api/admin/media");
    const data = await res.json();
    setMedias(data);
  };

  useEffect(() => { loadMedias(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

    setName("");
    setUrl("");
    setDuration("");
    setFile(null);
    loadMedias();
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Mídias</h1>
      
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Adicionar Mídia</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Nome da Mídia</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="LOCAL">Upload Local</option>
                <option value="URL">URL Externa</option>
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label>Duração do Vídeo (Segundos)</label>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ex: 16" required />
          </div>

          {type === "URL" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>URL do Vídeo</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} required />
            </div>
          )}

          {type === "LOCAL" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>Arquivo de Vídeo</label>
              <input type="file" accept="video/*" onChange={e => setFile(e.target.files?.[0] || null)} required />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
            {loading ? "Salvando..." : "Salvar Mídia"}
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Mídias Cadastradas</h2>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem 0' }}>Nome</th>
              <th style={{ padding: '1rem 0' }}>Tipo</th>
              <th style={{ padding: '1rem 0' }}>Duração</th>
              <th style={{ padding: '1rem 0' }}>URL</th>
              <th style={{ padding: '1rem 0' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {medias.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem 0' }}>{m.name}</td>
                <td style={{ padding: '1rem 0' }}>{m.type}</td>
                <td style={{ padding: '1rem 0' }}>{m.duration ? `${m.duration}s` : '-'}</td>
                <td style={{ padding: '1rem 0', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.url}</td>
                <td style={{ padding: '1rem 0' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
