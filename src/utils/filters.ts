import { FILTER_DEFINITIONS, type FilterKey } from '../constants/filters';
import type { InventoryItem } from '../types/data';
import { normalizeForSearch, uniq } from './format';

export type FilterValues = Partial<Record<FilterKey, string[]>>;

export interface AppFilters {
  search: string;
  values: FilterValues;
}

export function getFilterOptions(items: InventoryItem[]): Record<FilterKey, string[]> {
  return FILTER_DEFINITIONS.reduce((acc, definition) => {
    const values = items
      .map(definition.accessor)
      .map((value) => value.trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'fr'));
    acc[definition.key] = uniq(values);
    return acc;
  }, {} as Record<FilterKey, string[]>);
}

export function matchesFilters(item: InventoryItem, filters: AppFilters): boolean {
  const query = normalizeForSearch(filters.search.trim());
  if (query && !item.searchText.includes(query)) return false;

  return FILTER_DEFINITIONS.every((definition) => {
    const selectedValues = filters.values[definition.key] ?? [];
    if (selectedValues.length === 0) return true;
    return selectedValues.includes(definition.accessor(item));
  });
}

export function filterInventory(items: InventoryItem[], filters: AppFilters): InventoryItem[] {
  return items.filter((item) => matchesFilters(item, filters));
}

export function countActiveFilters(filters: AppFilters): number {
  return Object.values(filters.values).reduce((total, values) => total + (values?.length ?? 0), 0) + (filters.search ? 1 : 0);
}
