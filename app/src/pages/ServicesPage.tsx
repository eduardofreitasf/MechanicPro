import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Trash2, Wrench, ArrowUpDown } from "lucide-react";
import { serviceOrderService } from "../services/serviceOrderService";
import { ServiceOrder } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";

export function ServicesPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [search, setSearch] = useState(() => sessionStorage.getItem("services_search") || "");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    () => (sessionStorage.getItem("services_sortOrder") as "ASC" | "DESC") || "DESC"
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      const result = await serviceOrderService.getServiceOrders(search, sortOrder);
      setOrders(result);
    } catch (err) {
      console.error("Erro ao carregar ordens de serviço", err);
    }
  };

  useEffect(() => {
    loadOrders();
    sessionStorage.setItem("services_search", search);
    sessionStorage.setItem("services_sortOrder", sortOrder);
  }, [search, sortOrder]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await serviceOrderService.deleteServiceOrder(deleteId);
      setDeleteId(null);
      loadOrders();
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
            <p>Nenhuma ordem de serviço encontrada. Crie uma para começar.</p>
          </div>
        )}
      </div>
      <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Ordem de Serviço"
        message="Tem a certeza que deseja eliminar esta ordem de serviço? Esta ação não pode ser revertida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
