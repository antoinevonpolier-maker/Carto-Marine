import { create } from 'zustand';
import type { GraphNode, InventoryItem, ViewId, WorkbookData } from '../types/data';
import type { AppFilters, FilterValues } from '../utils/filters';
import type { FilterKey } from '../constants/filters';

interface AppState {
  data: WorkbookData | null;
  loading: boolean;
  error: string | null;
  activeView: ViewId;
  filters: AppFilters;
  selectedNode: GraphNode | null;
  selectedItem: InventoryItem | null;
  expandedNodeIds: Set<string>;
  graphMaxDepth: number;
  darkMode: boolean;
  setData: (data: WorkbookData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveView: (view: ViewId) => void;
  setSearch: (search: string) => void;
  setFilterValues: (key: FilterKey, values: string[]) => void;
  resetFilters: () => void;
  setSelectedNode: (node: GraphNode | null) => void;
  setSelectedItem: (item: InventoryItem | null) => void;
  toggleExpandedNode: (id: string) => void;
  setExpandedNodeIds: (ids: string[]) => void;
  expandAllVisible: (ids: string[]) => void;
  collapseToTop: (ids: string[]) => void;
  setGraphMaxDepth: (depth: number) => void;
  toggleDarkMode: () => void;
  zoomInCounter: number;
  zoomOutCounter: number;
  triggerZoomIn: () => void;
  triggerZoomOut: () => void;
}

const emptyFilters: AppFilters = {
  search: '',
  values: {},
};

export const useAppStore = create<AppState>((set) => ({
  data: null,
  loading: true,
  error: null,
  activeView: 'dashboard',
  filters: emptyFilters,
  selectedNode: null,
  selectedItem: null,
  expandedNodeIds: new Set<string>(),
  graphMaxDepth: 7,
  darkMode: false,
  setData: (data) => set({ data, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setActiveView: (activeView) => set({ activeView }),
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  setFilterValues: (key, values) =>
    set((state) => {
      const nextValues: FilterValues = { ...state.filters.values, [key]: values };
      if (values.length === 0) delete nextValues[key];
      return { filters: { ...state.filters, values: nextValues } };
    }),
  resetFilters: () => set({ filters: emptyFilters }),
  setSelectedNode: (selectedNode) => set({ selectedNode, selectedItem: selectedNode?.item ?? null }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
  toggleExpandedNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodeIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { expandedNodeIds: next };
    }),
  setExpandedNodeIds: (ids) => set({ expandedNodeIds: new Set(ids) }),
  expandAllVisible: (ids) => set({ expandedNodeIds: new Set(ids) }),
  collapseToTop: (ids) => set({ expandedNodeIds: new Set(ids) }),
  setGraphMaxDepth: (graphMaxDepth) => set({ graphMaxDepth }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  zoomInCounter: 0,
  zoomOutCounter: 0,
  triggerZoomIn: () => set((state) => ({ zoomInCounter: state.zoomInCounter + 1 })),
  triggerZoomOut: () => set((state) => ({ zoomOutCounter: state.zoomOutCounter + 1 })),
}));
