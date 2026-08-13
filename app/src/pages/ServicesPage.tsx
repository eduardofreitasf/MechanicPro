import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Trash2, Wrench, ArrowUpDown } from "lucide-react";
import { useServiceOrderStore } from "../store/useServiceOrderStore";
import { ConfirmModal } from "../components/ConfirmModal";

export function ServicesPage() {
  const navigate = useNavigate();
  const { 
    serviceOrders: orders, 
    search, 
    sortOrder, 
    activeTab,
    setSearch, 
    setSortOrder, 
    setActiveTab,
    fetchServiceOrders, 
    deleteServiceOrder 
  } = useServiceOrderStore();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchServiceOrders();
  }, [fetchServiceOrders]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteServiceOrder(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Erro ao eliminar ordem", err);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Serviços</h1>
        <div className="header-actions">
          <div className="input-group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Procurar por matrícula, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <ArrowUpDown className="input-icon" size={18} />
            <select 
              className="input select-compact"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
            >
              <option value="DESC">Mais Recente</option>
              <option value="ASC">Mais Antigo</option>
            </select>
          </div>

          <button className="btn" onClick={() => navigate("/services/new")}>
            <Plus size={18} />
            Registar Serviço
          </button>
        </div>
      </header>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "finalized" ? "active" : ""}`}
          onClick={() => setActiveTab("finalized")}
        >
          Serviços
        </button>
        <button
          className={`tab-btn ${activeTab === "draft" ? "active" : ""}`}
          onClick={() => setActiveTab("draft")}
        >
          Rascunhos
        </button>
      </div>

      <div className="card">
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Veículo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => navigate(`/services/${order.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>{new Date(order.created_at).toLocaleDateString('pt-PT')}</td>
                <td style={{ fontWeight: 700 }}>{order.vehicle_plate}</td>
                <td>{order.client_name}</td>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>
                  {order.total_price.toFixed(2)}€
                </td>
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn danger"
                    onClick={() => setDeleteId(order.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {orders.length === 0 && (
          <div className="empty-state">
            <Wrench size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>
              {activeTab === "draft" 
                ? "Nenhum rascunho encontrado."
                : "Nenhuma ordem de serviço encontrada. Crie uma para começar."}
            </p>
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={activeTab === "draft" ? "Eliminar Rascunho" : "Eliminar Ordem de Serviço"}
        message={activeTab === "draft" 
          ? "Tem a certeza que deseja eliminar este rascunho? Esta ação não pode ser revertida."
          : "Tem a certeza que deseja eliminar esta ordem de serviço? Esta ação não pode ser revertida."}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
