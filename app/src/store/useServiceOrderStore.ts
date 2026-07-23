import { create } from "zustand";
import { ServiceOrder, ServiceOperation } from "../db";
import { serviceOrderService } from "../services/serviceOrderService";

interface ServiceOrderState {
  serviceOrders: ServiceOrder[];
  search: string;
  sortOrder: "ASC" | "DESC";
  loading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  setSortOrder: (sortOrder: "ASC" | "DESC") => void;
  fetchServiceOrders: () => Promise<void>;
  createServiceOrder: (
    vehicleId: number,
    mileage: number,
    hours: number,
    hourlyRate: number,
    observations: string | null,
    hideLaborInPdf: boolean,
    operations: ServiceOperation[],
    date: string
  ) => Promise<void>;
  deleteServiceOrder: (id: number) => Promise<void>;
}

export const useServiceOrderStore = create<ServiceOrderState>((set, get) => ({
  serviceOrders: [],
  search: sessionStorage.getItem("services_search") || "",
  sortOrder: (sessionStorage.getItem("services_sortOrder") as "ASC" | "DESC") || "DESC",
  loading: false,
  error: null,
  
  setSearch: (search) => {
    set({ search });
    sessionStorage.setItem("services_search", search);
    get().fetchServiceOrders();
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
    sessionStorage.setItem("services_sortOrder", sortOrder);
    get().fetchServiceOrders();
  },
  
  fetchServiceOrders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await serviceOrderService.getServiceOrders(get().search, get().sortOrder);
      set({ serviceOrders: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro ao carregar ordens de serviço", loading: false });
    }
  },
  
  createServiceOrder: async (vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date) => {
    set({ loading: true, error: null });
    try {
      await serviceOrderService.createServiceOrder(vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date);
      await get().fetchServiceOrders();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  deleteServiceOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      await serviceOrderService.deleteServiceOrder(id);
      await get().fetchServiceOrders();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
