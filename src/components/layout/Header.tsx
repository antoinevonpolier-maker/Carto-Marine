import { Moon, Search, Sun } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ViewId } from '../../types/data';
import { countActiveFilters } from '../../utils/filters';
import { Button } from '../ui/Button';

const labels: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  cartographie: 'Cartographie principale',
  tableau: 'Vue analytique / tableau',
  opportunites: 'Vue opportunités',
  qualite: 'Sources et qualité des données',
};

export function Header() {
  const activeView = useAppStore((state) => state.activeView);
  const filters = useAppStore((state) => state.filters);
  const setSearch = useAppStore((state) => state.setSearch);
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const activeFilters = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-navy-600 dark:text-blue-300">Analyse marché naval</p>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{labels[activeView]}</h2>
        </div>
        <div className="flex flex-1 flex-col gap-2 lg:max-w-3xl lg:flex-row lg:items-center lg:justify-end">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher navire, classe, port, opportunité…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none ring-navy-200 transition placeholder:text-slate-400 focus:ring-4 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:ring-blue-900"
            />
          </div>
          <span className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
            {activeFilters} filtre{activeFilters > 1 ? 's' : ''} actif{activeFilters > 1 ? 's' : ''}
          </span>
          <Button variant="ghost" onClick={toggleDarkMode} aria-label="Basculer le mode sombre">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
