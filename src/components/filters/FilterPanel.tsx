import { RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useMemo } from 'react';
import { FILTER_DEFINITIONS, type FilterKey } from '../../constants/filters';
import { useAppStore } from '../../store/useAppStore';
import type { InventoryItem } from '../../types/data';
import { countActiveFilters, getFilterOptions } from '../../utils/filters';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface FilterPanelProps {
  items: InventoryItem[];
}

function MultiFilter({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (values: string[]) => void }) {
  function toggle(value: string) {
    if (selected.includes(value)) onChange(selected.filter((item) => item !== value));
    else onChange([...selected, value]);
  }

  return (
    <details className="group rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{selected.length || 'Tous'}</span>
      </summary>
      <div className="max-h-56 overflow-auto border-t border-slate-100 p-2 dark:border-slate-800">
        {options.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-400">Aucune valeur</p>
        ) : (
          options.map((option) => (
            <label key={option} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="mt-0.5 rounded border-slate-300 text-navy-700 focus:ring-navy-600"
              />
              <span>{option}</span>
            </label>
          ))
        )}
      </div>
    </details>
  );
}

export function FilterPanel({ items }: FilterPanelProps) {
  const filters = useAppStore((state) => state.filters);
  const setFilterValues = useAppStore((state) => state.setFilterValues);
  const resetFilters = useAppStore((state) => state.resetFilters);
  const options = useMemo(() => getFilterOptions(items), [items]);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-navy-700 dark:text-blue-300" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">Filtres</h2>
        </div>
        <Button variant="ghost" onClick={resetFilters} disabled={activeFilterCount === 0}>
          <RotateCcw className="h-4 w-4" /> Réinitialiser
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {FILTER_DEFINITIONS.map((definition) => (
          <MultiFilter
            key={definition.key}
            label={definition.label}
            options={options[definition.key] ?? []}
            selected={filters.values[definition.key] ?? []}
            onChange={(values) => setFilterValues(definition.key as FilterKey, values)}
          />
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters.values).flatMap(([key, values]) =>
            (values ?? []).map((value) => (
              <button
                key={`${key}-${value}`}
                onClick={() => setFilterValues(key as FilterKey, (filters.values[key as FilterKey] ?? []).filter((item) => item !== value))}
                className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800 ring-1 ring-navy-100 dark:bg-slate-800 dark:text-blue-200 dark:ring-slate-700"
              >
                {value}
                <X className="h-3 w-3" />
              </button>
            )),
          )}
        </div>
      )}
    </Card>
  );
}
