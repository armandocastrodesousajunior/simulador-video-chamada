"use client";
import { useState, useEffect } from "react";
import { X, Search, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CallsPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search and Pagination states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [callCenterId, setCallCenterId] = useState("");
  const [externalId, setExternalId] = useState("");

  // Load Centers for the dropdown
  useEffect(() => {
    fetch("/api/admin/centers")
      .then(res => res.json())
      .then(data => setCenters(data));
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Load paginated calls
  const loadCalls = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/calls/search?page=${page}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
      const data = await res.json();
      if (data.data) {
        setCalls(data.data);
        setTotalPages(data.meta.totalPages);
        setTotal(data.meta.total);
      }
    } catch (error) {
      console.error("Error loading calls", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, [page, debouncedSearch]);

  const handleCreateCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callCenterId) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callCenterId, externalId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao criar chamada");
      }
      
      setCallCenterId("");
      setExternalId("");
      setIsModalOpen(false);
      loadCalls();
    } catch (error) {
      console.error("Error creating call", error);
      alert("Erro interno ao criar chamada");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCall = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta chamada permanentemente?")) return;
    
    try {
      await fetch(`/api/admin/calls/${id}`, { method: "DELETE" });
      loadCalls();
    } catch (error) {
      console.error("Error deleting call", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "COMPLETED": return "var(--success)";
      case "ABANDONED": return "var(--danger)";
      case "REJECTED": return "#f97316";
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: 0 }}>Chamadas Geradas</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Gerencie o histórico de todas as chamadas criadas (Total: {total})</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} /> Nova Chamada
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por ID Externo, token ou nome da central..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '3.5rem', backgroundColor: 'var(--bg-base)', paddingRight: '1rem' }}
          />
        </div>
      </div>
      
      {/* Table Area */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem 0', minWidth: '120px' }}>ID Externo</th>
                <th style={{ padding: '1rem 0', minWidth: '150px' }}>Central</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
                <th style={{ padding: '1rem 0' }}>Tempo Assistido</th>
                <th style={{ padding: '1rem 0' }}>Criação</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem' }}>{c.externalId || <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                  <td style={{ padding: '1rem 0', fontWeight: 500 }}>{c.callCenter?.name}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ 
                      display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: 'rgba(255,255,255,0.05)', color: getStatusColor(c.status)
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem' }}>
                    {c.status === "REJECTED" || !c.watchTime ? "0s" : 
                      c.callCenter?.media?.duration 
                        ? `${c.watchTime}s de ${c.callCenter.media.duration}s` 
                        : `${c.watchTime}s`
                    }
                  </td>
                  <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ptBR })}
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => copyLink(c.token)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        🔗 Copiar
                      </button>
                      <button onClick={() => handleDeleteCall(c.id)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }} title="Deletar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {calls.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma chamada encontrada.</td>
                </tr>
              )}
              {loading && calls.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando chamadas...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {calls.length > 0 && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || loading}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Página {page} de {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              disabled={page >= totalPages || loading}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Próxima <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-surface-solid)', 
            padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Gerar Nova Chamada</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleCreateCall} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>Central de Chamada</label>
                <select value={callCenterId} onChange={e => setCallCenterId(e.target.value)} required style={{ backgroundColor: 'var(--bg-base)' }}>
                  <option value="">Selecione uma central...</option>
                  {centers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.displayName})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label>ID Externo do Cliente (Opcional)</label>
                <input 
                  value={externalId} 
                  onChange={e => setExternalId(e.target.value)} 
                  placeholder="Ex: cliente_123" 
                  style={{ backgroundColor: 'var(--bg-base)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating || !callCenterId}>
                  {creating ? "Gerando..." : "Gerar Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
