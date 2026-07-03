import { prisma } from "@/lib/prisma";
import DashboardCharts from "./DashboardCharts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  const centers = await prisma.callCenter.count();
  const totalCalls = await prisma.call.count();
  
  // Status counts
  const statusGroups = await prisma.call.groupBy({
    by: ['status'],
    _count: { status: true }
  });

  const getStatusCount = (statusName: string) => {
    return statusGroups.find(g => g.status === statusName)?._count.status || 0;
  };

  const createdCount = getStatusCount("CREATED");
  const accessedCount = getStatusCount("ACCESSED");
  const startedCount = getStatusCount("STARTED");
  const completedCount = getStatusCount("COMPLETED");
  const abandonedCount = getStatusCount("ABANDONED");
  const rejectedCount = getStatusCount("REJECTED");
  const expiredCount = getStatusCount("EXPIRED");

  // Funnel logic
  const funnelGeradas = totalCalls;
  const funnelAcessadas = totalCalls - createdCount - expiredCount; // Se tem outro status, foi acessada
  const funnelAtendidas = startedCount + completedCount + abandonedCount;
  const funnelConcluidas = completedCount;

  const funnelData = [
    { name: "Geradas", value: funnelGeradas },
    { name: "Acessadas", value: funnelAcessadas },
    { name: "Atendidas", value: funnelAtendidas },
    { name: "Concluídas", value: funnelConcluidas }
  ];

  const statusData = statusGroups.map(g => ({
    name: g.status,
    value: g._count.status
  }));

  // Retention Logic (fetching abandoned calls with media duration)
  const abandonedCalls = await prisma.call.findMany({
    where: { status: "ABANDONED" },
    include: { callCenter: { include: { media: true } } }
  });

  let retentionBuckets = [0, 0, 0, 0]; // 0-25%, 26-50%, 51-75%, 76-99%
  abandonedCalls.forEach(call => {
    const duration = call.callCenter.media.duration;
    if (duration && duration > 0) {
      const percentage = (call.watchTime / duration) * 100;
      if (percentage <= 25) retentionBuckets[0]++;
      else if (percentage <= 50) retentionBuckets[1]++;
      else if (percentage <= 75) retentionBuckets[2]++;
      else retentionBuckets[3]++;
    } else {
      // Fallback if no duration: bucket by absolute watchTime
      if (call.watchTime <= 10) retentionBuckets[0]++;
      else if (call.watchTime <= 30) retentionBuckets[1]++;
      else if (call.watchTime <= 60) retentionBuckets[2]++;
      else retentionBuckets[3]++;
    }
  });

  const retentionData = [
    { name: "0-25%", value: retentionBuckets[0] },
    { name: "26-50%", value: retentionBuckets[1] },
    { name: "51-75%", value: retentionBuckets[2] },
    { name: "76-99%", value: retentionBuckets[3] }
  ];

  // Recent Calls
  const recentCalls = await prisma.call.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { callCenter: true }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analytics</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Acompanhe a performance das suas centrais e a conversão dos seus leads.
      </p>
      
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Links Gerados</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{totalCalls}</p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Taxa de Acesso</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#60a5fa' }}>
            {funnelGeradas > 0 ? Math.round((funnelAcessadas / funnelGeradas) * 100) : 0}%
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Taxa de Atendimento</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#facc15' }}>
            {funnelAcessadas > 0 ? Math.round((funnelAtendidas / funnelAcessadas) * 100) : 0}%
          </p>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Concluídas com Sucesso</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: '#22c55e' }}>
            {funnelAtendidas > 0 ? Math.round((funnelConcluidas / funnelAtendidas) * 100) : 0}%
          </p>
        </div>
      </div>

      <DashboardCharts 
        funnelData={funnelData} 
        statusData={statusData} 
        retentionData={retentionData} 
      />

      {/* Feed Recente */}
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Atividade Recente</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentCalls.map(call => (
            <div key={call.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div>
                <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>{call.callCenter.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  ID Externo: {call.externalId || 'N/A'} • {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}>
                  {call.status}
                </span>
                {call.watchTime > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                    Assistido: {call.watchTime}s
                  </p>
                )}
              </div>
            </div>
          ))}
          {recentCalls.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhuma chamada gerada ainda.</p>}
        </div>
      </div>
    </div>
  );
}
