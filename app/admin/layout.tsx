import Link from "next/link";
import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <aside className="glass-panel" style={{ width: '250px', margin: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>Luna Admin</h2>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Dashboard</Link>
          <Link href="/admin/media" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Mídias</Link>
          <Link href="/admin/centers" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Centrais</Link>
          <Link href="/admin/calls" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Chamadas</Link>
          <Link href="/admin/mcp" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Servidor MCP</Link>
          <Link href="/docs" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>📄 API Docs</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '1rem', paddingLeft: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
