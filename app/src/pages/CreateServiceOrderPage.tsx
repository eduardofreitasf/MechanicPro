import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, PlusCircle, History } from "lucide-react";
import { useServiceOrderStore } from "../store/useServiceOrderStore";
import { serviceOrderService } from "../services/serviceOrderService";
import { clientService } from "../services/clientService";
import { vehicleService } from "../services/vehicleService";
import { ServiceOperation, Client, Vehicle } from "../db";
import { VehicleHistoryOverlay } from "../components/VehicleHistoryOverlay";
import { ClientModal } from "../components/ClientModal";
import { VehicleModal } from "../components/VehicleModal";

export function CreateServiceOrderPage() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [mileage, setMileage] = useState("");
  const [hours, setHours] = useState("1");
  const [hourlyRate, setHourlyRate] = useState("20");
  const [hideLaborInPdf, setHideLaborInPdf] = useState(false);
  const [observations, setObservations] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [operations, setOperations] = useState<ServiceOperation[]>(
    Array(10).fill(null).map(() => ({ description: "", price: 0, hide_price_in_pdf: false }))
  );

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const handleClientCreated = async () => {
    try {
      const updatedClients = await clientService.getClients();
      setClients(updatedClients);
      if (updatedClients.length > 0) {
        const newestClient = updatedClients.reduce((max, c) => c.id > max.id ? c : max, updatedClients[0]);
        setSelectedClientId(newestClient.id.toString());
        setSelectedVehicleId("");
      }
    } catch (err) {
      console.error("Erro ao recarregar clientes após criação", err);
    }
  };

  const handleVehicleCreated = async () => {
    if (!selectedClientId) return;
    try {
      const updatedVehicles = await vehicleService.getVehiclesByClient(parseInt(selectedClientId));
      setVehicles(updatedVehicles);
      if (updatedVehicles.length > 0) {
        const newestVehicle = updatedVehicles.reduce((max, v) => v.id > max.id ? v : max, updatedVehicles[0]);
        setSelectedVehicleId(newestVehicle.id.toString());
      }
    } catch (err) {
      console.error("Erro ao recarregar veículos após criação", err);
    }
  };

  const { id } = useParams();

  useEffect(() => {
    clientService.getClients().then(setClients);
  }, []);

  useEffect(() => {
    if (id) {
      serviceOrderService.getServiceOrderById(parseInt(id)).then(order => {
        if (order) {
          if (order.client_id) {
            setSelectedClientId(order.client_id.toString());
            // Fetch vehicles of the client
            vehicleService.getVehiclesByClient(order.client_id).then(vList => {
              setVehicles(vList);
              setSelectedVehicleId(order.vehicle_id.toString());
            });
          }
          setMileage(order.mileage.toString());
          setHours(order.hours.toString());
          setHourlyRate(order.hourly_rate.toString());
          setHideLaborInPdf(!!order.hide_labor_in_pdf);
          setObservations(order.observations || "");
          setDate(order.created_at.split('T')[0]);

          const populatedOps = Array(10).fill(null).map((_, idx) => {
            if (order.operations && order.operations[idx]) {
              return {
                description: order.operations[idx].description,
                price: order.operations[idx].price,
                hide_price_in_pdf: !!order.operations[idx].hide_price_in_pdf
              };
            }
            return { description: "", price: 0, hide_price_in_pdf: false };
          });

          if (order.operations && order.operations.length > 10) {
            for (let i = 10; i < order.operations.length; i++) {
              populatedOps.push({
                description: order.operations[i].description,
                price: order.operations[i].price,
                hide_price_in_pdf: !!order.operations[i].hide_price_in_pdf
              });
            }
          }
          setOperations(populatedOps);
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (selectedClientId) {
      vehicleService.getVehiclesByClient(parseInt(selectedClientId)).then(setVehicles);
    } else {
      setVehicles([]);
    }
  }, [selectedClientId]);

  const handleOperationChange = (index: number, field: keyof ServiceOperation, value: string | number | boolean) => {
    const newOps = [...operations];
    newOps[index] = { ...newOps[index], [field]: value };
    setOperations(newOps);
  };

  const calculateTotal = () => {
    const opsTotal = operations.reduce((sum, op) => sum + (Number(op.price) || 0), 0);
    const labourTotal = (Number(hours) || 0) * (Number(hourlyRate) || 0);
    return opsTotal + labourTotal;
  };

  const handleSave = async (isDraft: boolean) => {
    if (!selectedVehicleId || !mileage || !hours || !hourlyRate || !date) {
        setError("Por favor, preencha todos os campos obrigatórios (Cliente, Veículo, Quilometragem, Mão de obra, Data).");
        window.scrollTo(0, 0);
        return;
    }
    
    const validOps = operations.filter(op => op.description.trim() !== "");

    try {
      if (id) {
        await serviceOrderService.updateServiceOrder(
          parseInt(id),
          parseInt(selectedVehicleId),
          parseInt(mileage),
          parseFloat(hours),
          parseFloat(hourlyRate),
          observations,
          hideLaborInPdf,
          validOps,
          date,
          isDraft
        );
      } else {
        await serviceOrderService.createServiceOrder(
          parseInt(selectedVehicleId),
          parseInt(mileage),
          parseFloat(hours),
          parseFloat(hourlyRate),
          observations,
          hideLaborInPdf,
          validOps,
          date,
          isDraft
        );
      }
      useServiceOrderStore.getState().setActiveTab(isDraft ? "draft" : "finalized");
      navigate("/services");
    } catch (err: any) {
      setError(err.message || "Erro ao guardar ordem de serviço");
      window.scrollTo(0, 0);
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === parseInt(selectedVehicleId));

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-title-group">
          <button className="btn-secondary" onClick={() => navigate("/services")} style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1>{id ? "Editar Rascunho" : "Nova Ordem de Serviço"}</h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-secondary" onClick={() => handleSave(true)}>
          <Save size={18} />
          Guardar Rascunho
        </button>
        <button className="btn" onClick={() => handleSave(false)}>
          <Save size={18} />
          Finalizar Ordem
        </button>
        </div>
      </header>

      {error && (
        <div style={{ color: 'var(--danger)', background: '#fee2e2', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div className="form-stack">
        {/* Main Info Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>Informações Gerais</h3>
          <div className="grid-form-fields" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Cliente
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  + Criar Novo
                </button>
              </label>
              <select className="form-input" style={{ width: '100%' }} required value={selectedClientId} onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedVehicleId("");
              }}>
                <option value="">Selecionar Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Veículo</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {selectedClientId && (
                    <button 
                      type="button" 
                      onClick={() => setIsVehicleModalOpen(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      + Criar Novo
                    </button>
                  )}
                  {selectedVehicleId && (
                    <button 
                      type="button" 
                      onClick={() => setIsHistoryOpen(true)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <History size={14} /> Ver Histórico
                    </button>
                  )}
                </div>
              </label>
              <select className="form-input" style={{ width: '100%' }} required disabled={!selectedClientId} value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)}>
                <option value="">Selecionar Veículo</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} ({v.brand} {v.model})</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid-form-fields-sm">
            <div className="form-group">
              <label>Data</label>
              <input type="date" className="form-input" style={{ width: '100%' }} required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Quilometragem (km)</label>
              <input type="number" className="form-input" style={{ width: '100%' }} required value={mileage} onChange={(e) => setMileage(e.target.value)} />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Mão de Obra
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'normal', cursor: 'pointer', margin: 0 }}>
                  <input type="checkbox" checked={hideLaborInPdf} onChange={(e) => setHideLaborInPdf(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: 'pointer' }} title="Ocultar custo no PDF" />
                  Esconder
                </label>
              </label>
              <input type="number" step="0.5" className="form-input" style={{ width: '100%' }} required value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Preço Hora (€)</label>
              <input type="number" className="form-input" style={{ width: '100%' }} required value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Operations Table */}
        <div className="card">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Operações e Peças</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preencha a descrição e o preço para cada item.</span>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setOperations([...operations, { description: "", price: 0, hide_price_in_pdf: false }])}
              >
                <PlusCircle size={14} /> Adicionar Linha
              </button>
            </div>
          </div>
          <div className="table-scroll">
            <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  <th>Descrição</th>
                  <th style={{ width: '150px' }}>Preço (€)</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Ocultar</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{index + 1}</td>
                    <td>
                      <input 
                        className="form-input" 
                        style={{ border: 'none', background: 'transparent', padding: '8px', width: '100%', outline: 'none' }}
                        placeholder="Descrição da operação..." 
                        value={op.description}
                        onChange={(e) => handleOperationChange(index, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        className="form-input" 
                        style={{ border: 'none', background: 'transparent', padding: '8px', width: '100%', outline: 'none' }}
                        placeholder="0.00" 
                        value={op.price || ""}
                        onChange={(e) => handleOperationChange(index, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!op.hide_price_in_pdf}
                        onChange={(e) => handleOperationChange(index, 'hide_price_in_pdf', e.target.checked)}
                        title="Ocultar preço no PDF"
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Observations and Total */}
        <div className="grid-main-side">
          <div className="card" style={{ padding: '24px' }}>
            <div className="form-group">
              <label>Observações</label>
              <textarea 
                className="form-input" 
                style={{ width: '100%', minHeight: '120px' }}
                rows={5} 
                placeholder="Notas adicionais sobre este serviço..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Resumo da Ordem</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operações:</span>
                <span style={{ fontWeight: 500 }}>{operations.reduce((sum, op) => sum + (op.price || 0), 0).toFixed(2)}€</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mão de Obra ({hours}h):</span>
                <span style={{ fontWeight: 500 }}>{(parseFloat(hours) * parseFloat(hourlyRate)).toFixed(2)}€</span>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.5rem' }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary)' }}>{calculateTotal().toFixed(2)}€</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
              <button className="btn" style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '1rem' }} onClick={() => handleSave(false)}>
                <Save size={20} />
                Finalizar Ordem
              </button>
              <button className="btn-secondary" style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '1rem' }} onClick={() => handleSave(true)}>
                <Save size={20} />
                Guardar Rascunho
              </button>
            </div>
          </div>
        </div>
      </div>

      <VehicleHistoryOverlay 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        vehicleId={parseInt(selectedVehicleId)} 
        vehiclePlate={selectedVehicle?.plate || ""}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={handleClientCreated}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSuccess={handleVehicleCreated}
        defaultClientId={selectedClientId ? parseInt(selectedClientId) : null}
      />
    </div>
  );
}

