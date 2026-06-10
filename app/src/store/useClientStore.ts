import { create } from "zustand";
import { Client } from "../db";
import { clientService } from "../services/clientService";

interface ClientState {
  clients: Client[];
  search: string;
  loading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  fetchClients: () => Promise<void>;
  createClient: (name: string, phone: string | null) => Promise<void>;
  updateClient: (id: number, name: string, phone: string | null) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  search: sessionStorage.getItem("clients_search") || "",
  loading: false,
  error: null,
  
  setSearch: (search) => {
    set({ search });
    sessionStorage.setItem("clients_search", search);
    get().fetchClients();
  },
  
  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await clientService.getClients(get().search);
      set({ clients: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro ao carregar clientes", loading: false });
    }
  },
  
  createClient: async (name, phone) => {
    set({ loading: true, error: null });
    try {
      await clientService.createClient(name, phone);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  updateClient: async (id, name, phone) => {
    set({ loading: true, error: null });
    try {
      await clientService.updateClient(id, name, phone);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await clientService.deleteClient(id);
      await get().fetchClients();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
