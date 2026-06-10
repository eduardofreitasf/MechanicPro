import { useState, useEffect } from "react";
import { X, History, ChevronDown, ChevronUp, Wrench } from "lucide-react";
import { serviceOrderService } from "../services/serviceOrderService";
import { ServiceOrder } from "../db";

interface VehicleHistoryOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehiclePlate: string;
}

export function VehicleHistoryOverlay({ isOpen, onClose, vehicleId, vehiclePlate }: VehicleHistoryOverlayProps) {
  const [history, setHistory] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && vehicleId) {
      setLoading(true);
      serviceOrderService.getVehicleHistory(vehicleId)
        .then(res => {
          setHistory(res);
          // Expand the most recent one by default if it exists
          if (res.length > 0) {
            setExpandedOrders([res[0].id]);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, vehicleId]);

  const toggleExpand = (orderId: number) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: '15px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={22} color="var(--primary)" />
            <div>
              <h2 style={{ margin: 0 }}>Histórico do Veículo</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>{vehiclePlate}</span>
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
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Carregando histórico...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: '60px 40px', textAlign: 'center' }}>
              <History size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Este veículo ainda não tem serviços registados.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map((order) => {
                const isExpanded = expandedOrders.includes(order.id);
                return (
                  <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div 
                      onClick={() => toggleExpand(order.id)}
                      style={{ 
                        padding: '16px 20px', 
                        background: isExpanded ? '#f8fafc' : 'white', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
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
                          <div style={{ fontWeight: 700 }}>{new Date(order.created_at).toLocaleDateString('pt-PT')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.mileage.toLocaleString()} km</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>{order.total_price.toFixed(2)}€</div>
                        {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid var(--border)' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Operações</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {order.operations?.map((op, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0' }}>
                                <span>{op.description}</span>
                                <span style={{ fontWeight: 500 }}>{op.price.toFixed(2)}€</span>
                              </div>
                            ))}
                            {(!order.operations || order.operations.length === 0) && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem operações detalhadas.</div>
                            )}
                          </div>
                        </div>
                        
                        {(order.hours > 0 || order.observations) && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                            <div className="grid-2-col">
                              {order.hours > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Mão de Obra</h4>
                                  <div style={{ fontSize: '0.9rem' }}>{order.hours}h x {order.hourly_rate.toFixed(2)}€</div>
                                </div>
                              )}
                              {order.observations && (
                                <div>
                                  <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>Notas</h4>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{order.observations}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
