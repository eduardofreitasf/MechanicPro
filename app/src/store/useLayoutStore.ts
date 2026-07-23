import { create } from 'zustand';

interface LayoutState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
