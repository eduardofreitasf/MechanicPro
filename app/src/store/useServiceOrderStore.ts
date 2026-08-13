import { create } from "zustand";
import { ServiceOrder, ServiceOperation } from "../db";
import { serviceOrderService } from "../services/serviceOrderService";

interface ServiceOrderState {
  serviceOrders: ServiceOrder[];
  search: string;
  sortOrder: "ASC" | "DESC";
  activeTab: "finalized" | "draft";
  loading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  setSortOrder: (sortOrder: "ASC" | "DESC") => void;
  setActiveTab: (tab: "finalized" | "draft") => void;
  fetchServiceOrders: () => Promise<void>;
  createServiceOrder: (
    vehicleId: number,
    mileage: number,
    hours: number,
    hourlyRate: number,
    observations: string | null,
    hideLaborInPdf: boolean,
    operations: ServiceOperation[],
    date: string,
    isDraft?: boolean
  ) => Promise<void>;
  updateServiceOrder: (
    id: number,
    vehicleId: number,
    mileage: number,
    hours: number,
    hourlyRate: number,
    observations: string | null,
    hideLaborInPdf: boolean,
    operations: ServiceOperation[],
    date: string,
    isDraft: boolean
  ) => Promise<void>;
  deleteServiceOrder: (id: number) => Promise<void>;
}

export const useServiceOrderStore = create<ServiceOrderState>((set, get) => ({
  serviceOrders: [],
  search: sessionStorage.getItem("services_search") || "",
  sortOrder: (sessionStorage.getItem("services_sortOrder") as "ASC" | "DESC") || "DESC",
  activeTab: "finalized",
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

  setActiveTab: (activeTab) => {
    set({ activeTab });
    get().fetchServiceOrders();
  },
  
  fetchServiceOrders: async () => {
    set({ loading: true, error: null });
    try {
      const isDraft = get().activeTab === "draft";
      const data = await serviceOrderService.getServiceOrders(get().search, get().sortOrder, isDraft);
      set({ serviceOrders: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro ao carregar ordens de serviço", loading: false });
    }
  },
  
  createServiceOrder: async (vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date, isDraft = false) => {
    set({ loading: true, error: null });
    try {
      await serviceOrderService.createServiceOrder(vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date, isDraft);
      await get().fetchServiceOrders();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateServiceOrder: async (id, vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date, isDraft) => {
    set({ loading: true, error: null });
    try {
      await serviceOrderService.updateServiceOrder(id, vehicleId, mileage, hours, hourlyRate, observations, hideLaborInPdf, operations, date, isDraft);
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
