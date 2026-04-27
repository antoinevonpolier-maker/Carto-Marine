import { Database, GitBranch, Home, ShieldCheck, Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ViewId } from '../../types/data';
import { cx } from '../../utils/format';

const navItems: Array<{ id: ViewId; label: string; icon: typeof Home }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'cartographie', label: 'Cartographie', icon: GitBranch },
  { id: 'tableau', label: 'Tableau analytique', icon: Database },
  { id: 'opportunites', label: 'Opportunités', icon: Target },
  { id: 'qualite', label: 'Sources & qualité', icon: ShieldCheck },
];

export function Sidebar() {
  const activeView = useAppStore((state) => state.activeView);
  const setActiveView = useAppStore((state) => state.setActiveView);

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 p-4 backdrop-blur xl:block dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-full flex-col">
        <div className="rounded-2xl bg-navy-950 p-5 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">Naval market map</p>
          <h1 className="mt-2 text-xl font-bold leading-tight">Marché naval / opportunités</h1>
          <p className="mt-3 text-sm leading-5 text-slate-300">Cartographie relationnelle orientée analyse stratégique, maintenance, programmes futurs et export.</p>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition',
                  active
                    ? 'bg-navy-50 text-navy-800 ring-1 ring-navy-100 dark:bg-slate-800 dark:text-white dark:ring-slate-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          Les exclusions ne sont pas injectées dans la cartographie principale, mais restent consultables via la recherche et la vue qualité.
        </div>
      </div>
    </aside>
  );
}
