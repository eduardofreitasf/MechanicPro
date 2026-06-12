import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Users, Edit } from "lucide-react";
import { useClientStore } from "../store/useClientStore";
import { Client } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";
import { ClientModal } from "../components/ClientModal";
import { ClientProfileOverlay } from "../components/ClientProfileOverlay";

export function ClientsPage() {
  const { clients, search, setSearch, fetchClients, deleteClient } = useClientStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [profileClient, setProfileClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openCreateModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteClient(deleteId);
      setDeleteId(null);
    } catch (err) {
      console.error("Erro ao eliminar cliente", err);
    }
  };

  return (
    <>
      <header className="header">
        <h1>Clientes</h1>
        <div className="header-actions">
          <div className="input-group">
            <Search className="input-icon" size={18} />
            <input
              type="text"
              className="input"
              placeholder="Procurar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn" onClick={openCreateModal}>
            <Plus size={18} />
            Registar Cliente
          </button>
        </div>
      </header>

      <div className="card">
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th className="actions-cell">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr 
                key={client.id} 
                style={{ cursor: "pointer" }} 
                onClick={() => setProfileClient(client)}
                className="hoverable-row"
              >
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.phone || <span style={{ color: "var(--text-muted)" }}>Nenhum</span>}</td>
                <td className="actions-cell">
                  <button
                    className="btn edit"
                    onClick={(e) => { e.stopPropagation(); openEditModal(client); }}
                    title="Editar Cliente"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(client.id); }}
                    title="Eliminar Cliente"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {clients.length === 0 && (
          <div className="empty-state">
            <Users size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
            <p>Nenhum cliente encontrado. Adicione um para começar.</p>
          </div>
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchClients} 
        client={editingClient} 
      />

      <ClientProfileOverlay
        isOpen={profileClient !== null}
        onClose={() => setProfileClient(null)}
        client={profileClient}
      />

       <ConfirmModal 
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message="Tem a certeza que deseja eliminar este cliente? Todos os veículos e ordens de serviço associados serão mantidos, mas a referência ao cliente será perdida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
