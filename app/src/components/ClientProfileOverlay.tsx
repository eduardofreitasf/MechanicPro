import { useState, useEffect } from "react";
import { X, History, User, CarFront, Wrench, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { serviceOrderService } from "../services/serviceOrderService";
import { vehicleService } from "../services/vehicleService";
import { ServiceOrder, Vehicle, Client } from "../db";

interface ClientProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export function ClientProfileOverlay({ isOpen, onClose, client }: ClientProfileOverlayProps) {
  const [history, setHistory] = useState<ServiceOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && client) {
      setLoading(true);
      Promise.all([
        vehicleService.getVehiclesByClient(client.id),
        serviceOrderService.getClientHistory(client.id)
      ])
        .then(([vRes, hRes]) => {
          setVehicles(vRes);
          setHistory(hRes);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, client]);

  if (!isOpen || !client) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} color="var(--primary)" />
            <div>
              <h2 style={{ margin: 0 }}>Perfil do Cliente</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {client.name} {client.phone ? `• ${client.phone}` : ''}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: '5px' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>A carregar perfil...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Vehicles Section */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '12px', color: 'var(--text)' }}>
                  <CarFront size={18} color="#10b981" /> Veículos Registados
                </h3>
                {vehicles.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Nenhum veículo registado.</p>
                  </div>
                ) : (
                  <div className="grid-2-col" style={{ gap: '12px' }}>
                    {vehicles.map(v => (
                      <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', background: 'white' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{v.plate}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.brand} {v.model} {v.year ? `(${v.year})` : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service History Section */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginBottom: '12px', color: 'var(--text)' }}>
                  <History size={18} color="var(--primary)" /> Histórico de Serviços
                </h3>
                
                {history.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Sem histórico de serviços.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {history.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => navigate(`/services/${order.id}`)}
                        style={{ 
                          border: '1px solid var(--border)', 
                          borderRadius: '12px', 
                          padding: '16px 20px', 
                          background: 'white', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s, border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '10px', 
                            background: 'white', 
                            border: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                          }}>
                            <Wrench size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {new Date(order.created_at).toLocaleDateString('pt-PT')}
                              <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', color: '#475569' }}>
                                {order.vehicle_plate}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {order.mileage.toLocaleString()} km
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{order.total_price.toFixed(2)}€</div>
                          <ChevronRight size={20} color="var(--text-muted)" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
