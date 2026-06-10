import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Car, Edit } from "lucide-react";
import { vehicleService } from "../services/vehicleService";
import { Vehicle } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";
import { VehicleModal } from "../components/VehicleModal";

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState(() => sessionStorage.getItem("vehicles_search") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const vList = await vehicleService.getVehicles(search);
      setVehicles(vList);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
    }
  };

  useEffect(() => {
    loadData();
    sessionStorage.setItem("vehicles_search", search);
  }, [search]);

  const openCreateModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await vehicleService.deleteVehicle(deleteId);
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error("Erro ao eliminar veículo", err);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Veículos</h1>
        <div className="header-actions">
          <div className="input-group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Procurar por matrícula, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={openCreateModal}>
            <Plus size={18} />
            Registar Veículo
          </button>
        </div>
      </header>

      <div className="card">
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Proprietário</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td style={{ fontWeight: 700, color: "var(--primary)" }}>{v.plate}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.brand} {v.model}</div>
                </td>
                <td>{v.year || <span style={{ color: "var(--text-muted)" }}>-</span>}</td>
                <td>{v.client_name}</td>
                <td className="actions-cell">
                  <button
                    className="btn edit"
                    onClick={() => openEditModal(v)}
                    title="Editar Veículo"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => setDeleteId(v.id)}
                    title="Eliminar Veículo"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {vehicles.length === 0 && (
          <div className="empty-state">
            <Car size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>Nenhum veículo encontrado. Adicione um para começar.</p>
          </div>
        )}
      </div>

      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadData} 
        vehicle={editingVehicle} 
      />

       <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Veículo"
        message="Tem a certeza que deseja eliminar este veículo? Todas as ordens de serviço associadas serão mantidas, mas a referência ao veículo será perdida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
