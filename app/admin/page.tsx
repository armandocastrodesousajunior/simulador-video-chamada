import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const centers = await prisma.callCenter.count();
  const totalCalls = await prisma.call.count();
  const completedCalls = await prisma.call.count({ where: { status: "COMPLETED" } });
  const abandonedCalls = await prisma.call.count({ where: { status: "ABANDONED" } });

  const completionRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total de Centrais</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{centers}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Total de Chamadas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalCalls}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Concluídas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{completedCalls}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Abandonadas</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>{abandonedCalls}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Taxa de Conclusão</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>{completionRate}%</p>
        </div>
      </div>
    </div>
  );
}
