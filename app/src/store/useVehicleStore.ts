import { create } from "zustand";
import { Vehicle } from "../db";
import { vehicleService } from "../services/vehicleService";

interface VehicleState {
  vehicles: Vehicle[];
  search: string;
  loading: boolean;
  error: string | null;
  setSearch: (search: string) => void;
  fetchVehicles: () => Promise<void>;
  createVehicle: (clientId: number, plate: string, brand: string, model: string, year: number | null) => Promise<void>;
  updateVehicle: (id: number, clientId: number, plate: string, brand: string, model: string, year: number | null) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  search: sessionStorage.getItem("vehicles_search") || "",
  loading: false,
  error: null,
  
  setSearch: (search) => {
    set({ search });
    sessionStorage.setItem("vehicles_search", search);
    get().fetchVehicles();
  },
  
  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const data = await vehicleService.getVehicles(get().search);
      set({ vehicles: data, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Erro ao carregar veículos", loading: false });
    }
  },
  
  createVehicle: async (clientId, plate, brand, model, year) => {
    set({ loading: true, error: null });
    try {
      await vehicleService.createVehicle(clientId, plate, brand, model, year);
      await get().fetchVehicles();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  updateVehicle: async (id, clientId, plate, brand, model, year) => {
    set({ loading: true, error: null });
    try {
      await vehicleService.updateVehicle(id, clientId, plate, brand, model, year);
      await get().fetchVehicles();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      await vehicleService.deleteVehicle(id);
      await get().fetchVehicles();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
