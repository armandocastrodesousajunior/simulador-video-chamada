"use client";
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, LabelList
} from 'recharts';

interface DashboardChartsProps {
  funnelData: any[];
  statusData: any[];
  retentionData: any[];
}

const COLORS = ['#ffffff', '#a1a1aa', '#3f3f46', '#27272a'];
const STATUS_COLORS: Record<string, string> = {
  CREATED: '#a1a1aa',
  ACCESSED: '#60a5fa',
  STARTED: '#facc15',
  COMPLETED: '#22c55e',
  ABANDONED: '#f97316',
  REJECTED: '#ef4444',
  EXPIRED: '#71717a'
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Geradas (Sem Acesso)',
  ACCESSED: 'Acessadas',
  STARTED: 'Atendidas (Iniciadas)',
  COMPLETED: 'Concluídas',
  ABANDONED: 'Abandonadas',
  REJECTED: 'Recusadas',
  EXPIRED: 'Expiradas'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111111',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{STATUS_LABELS[label] || label || payload[0].name}</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Total: <span style={{ color: payload[0].payload?.fill || '#fff' }}>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ funnelData, statusData, retentionData }: DashboardChartsProps) {
  // Garantir que todos os status apareçam na lista, mesmo os que tem valor 0
  const allStatuses = ['CREATED', 'ACCESSED', 'STARTED', 'COMPLETED', 'ABANDONED', 'REJECTED', 'EXPIRED'];
  const fullStatusList = allStatuses.map(status => {
    const found = statusData.find(s => s.name === status);
    return { name: status, value: found ? found.value : 0 };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
      
      {/* Funil de Conversão */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Funil de Conversão</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Jornada dos leads, do link gerado até a conclusão do vídeo.
        </p>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              {/* Largura ajustada para 90 para que nomes não cortem */}
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} width={90} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={30}>
                <LabelList dataKey="value" position="right" fill="var(--text-secondary)" fontSize={14} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribuição de Status */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Distribuição de Todos os Estados</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Análise precisa do total absoluto de chamadas por status.
        </p>
        <div style={{ display: 'flex', gap: '1rem', height: '300px' }}>
          
          {/* Gráfico */}
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData.filter(d => d.value > 0)} // Só plota os maiores que zero
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista Detalhada */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {fullStatusList.map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: STATUS_COLORS[s.name] }}></div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{STATUS_LABELS[s.name]}</span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{s.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Retenção de Atenção */}
      <div className="glass-panel" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Retenção de Atenção (Chamadas Abandonadas)</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Em qual porcentagem do vídeo os leads costumam fechar a página.
        </p>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40}>
                <LabelList dataKey="value" position="top" fill="var(--text-primary)" fontSize={14} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
