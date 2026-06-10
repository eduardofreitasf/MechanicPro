import { useEffect, useState } from "react";
import { Search, Plus, Trash2, Users, Edit } from "lucide-react";
import { clientService } from "../services/clientService";
import { Client } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";
import { ClientModal } from "../components/ClientModal";

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState(() => sessionStorage.getItem("clients_search") || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadClients = async () => {
    try {
      const result = await clientService.getClients(search);
      setClients(result);
    } catch (err) {
      console.error("Erro ao carregar clientes", err);
    }
  };

  useEffect(() => {
    loadClients();
    sessionStorage.setItem("clients_search", search);
  }, [search]);

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
      await clientService.deleteClient(deleteId);
      setDeleteId(null);
      loadClients();
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
              <tr key={client.id}>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.phone || <span style={{ color: "var(--text-muted)" }}>Nenhum</span>}</td>
                <td className="actions-cell">
                  <button
                    className="btn edit"
                    onClick={() => openEditModal(client)}
                    title="Editar Cliente"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => setDeleteId(client.id)}
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
        onSuccess={loadClients} 
        client={editingClient} 
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
