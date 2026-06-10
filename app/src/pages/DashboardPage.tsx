import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Car, Wrench, Plus, Activity, BarChart3, UserCheck, CarFront } from "lucide-react";
import { dashboardService, DashboardStats } from "../services/dashboardService";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { ClientModal } from "../components/ClientModal";
import { VehicleModal } from "../components/VehicleModal";

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const loadStats = () => {
    setLoading(true);
    dashboardService.getStats().then(res => {
      setStats(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return <div className="main-content">Carregando estatísticas...</div>;
  }

  const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="page-stack">
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Estatísticas e visão geral da oficina.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-success" onClick={() => setIsClientModalOpen(true)}>
            <Plus size={18} />
            Registar Cliente
          </button>
          <button className="btn btn-slate" onClick={() => setIsVehicleModalOpen(true)}>
            <Plus size={18} />
            Registar Veículo
          </button>
          <button className="btn" onClick={() => navigate("/services/new")}>
            <Plus size={18} />
            Registar Serviço
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid-stats">
        <StatCard 
          title="Serviços" 
          value={stats.servicesCount} 
          icon={<Wrench size={22} />} 
          color="#f59e0b" 
        />
        <StatCard 
          title="Clientes" 
          value={stats.clientsCount} 
          icon={<Users size={22} />} 
          color="#10b981" 
        />
        <StatCard 
          title="Veículos" 
          value={stats.vehiclesCount} 
          icon={<Car size={22} />} 
          color="#64748b" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid-charts">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Activity size={20} color="var(--primary)" /> Receita por Mês
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `${value}€`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <BarChart3 size={20} color="#10b981" /> Serviços por Marca
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.brandsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="brand" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontWeight: 600, fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {stats.brandsData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Lists Section */}
      <div className="grid-lists">
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Clientes Frequentes</h3>
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                <th style={{ padding: '10px 24px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nome</th>
                <th style={{ padding: '10px 24px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Serviços</th>
              </tr>
            </thead>
            <tbody>
              {stats.topClients.map((client, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 24px', fontWeight: 600 }}>{client.name}</td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{client.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CarFront size={18} color="#10b981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Veículos Frequentes</h3>
          </div>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                <th style={{ padding: '10px 24px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Veículo</th>
                <th style={{ padding: '10px 24px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Serviços</th>
              </tr>
            </thead>
            <tbody>
              {stats.topVehicles.map((v, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 24px' }}>
                    <div style={{ fontWeight: 700 }}>{v.plate}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.brand} {v.model}</div>
                  </td>
                  <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Serviços Recentes</h3>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => navigate("/services")}>
            Ver Todos
          </button>
        </div>
        <div className="table-scroll">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f8fafc' }}>
              <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Veículo</th>
              <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cliente</th>
              <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Data</th>
              <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentServices.map((service) => (
              <tr key={service.id} style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/services/${service.id}`)}>
                <td style={{ padding: '16px 24px', fontWeight: 700 }}>{service.plate}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{service.client}</td>
                <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{new Date(service.date).toLocaleDateString('pt-PT')}</td>
                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                  {service.total.toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onSuccess={loadStats} 
      />
      <VehicleModal 
        isOpen={isVehicleModalOpen} 
        onClose={() => setIsVehicleModalOpen(false)} 
        onSuccess={loadStats} 
      />
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        borderRadius: '12px', 
        backgroundColor: `${color}15`, 
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );
}
