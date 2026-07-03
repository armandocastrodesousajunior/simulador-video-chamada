"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Token inválido");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Luna Admin</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Acesso restrito</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Master Token</label>
            <input 
              type="password" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Insira o token de acesso" 
              required
            />
          </div>

          {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
