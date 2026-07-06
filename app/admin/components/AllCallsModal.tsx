"use client";
import { useState, useEffect } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AllCallsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

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
    if (isOpen) {
      loadCalls();
    }
  }, [isOpen, page, debouncedSearch]);

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
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-secondary" 
        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
      >
        Ver Todas as Chamadas ({total > 0 ? total : "..."})
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '1000px', backgroundColor: 'var(--bg-surface-solid)', 
            height: '85vh', display: 'flex', flexDirection: 'column' 
          }}>
            {/* Modal Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Todas as Chamadas</h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mostrando {calls.length} de {total} resultados</p>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={24} /></button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por ID Externo, ID da Chamada ou Nome da Central..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '2.5rem', backgroundColor: 'var(--bg-base)' }}
                />
              </div>
            </div>

            {/* Table Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem' }}>
              {loading && calls.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Buscando...</div>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '1rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-solid)', zIndex: 10 }}>ID Externo</th>
                      <th style={{ padding: '1rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-solid)', zIndex: 10 }}>Central</th>
                      <th style={{ padding: '1rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-solid)', zIndex: 10 }}>Status</th>
                      <th style={{ padding: '1rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-solid)', zIndex: 10 }}>Criação</th>
                      <th style={{ padding: '1rem 0', position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface-solid)', zIndex: 10 }}>Ação</th>
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
                        <td style={{ padding: '1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: ptBR })}
                        </td>
                        <td style={{ padding: '1rem 0' }}>
                          <button onClick={() => copyLink(c.token)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                            Copiar Link
                          </button>
                        </td>
                      </tr>
                    ))}
                    {calls.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma chamada encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          </div>
        </div>
      )}
    </>
  );
}
