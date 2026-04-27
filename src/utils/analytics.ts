import type { InventoryItem, WorkbookData } from '../types/data';
import { uniq } from './format';

export function countBy<T extends string>(items: InventoryItem[], accessor: (item: InventoryItem) => T): Record<T, number> {
  return items.reduce((acc, item) => {
    const key = accessor(item) || ('Non renseigné' as T);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

export function topEntries(record: Record<string, number>, limit = 8): Array<[string, number]> {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr'))
    .slice(0, limit);
}

export function computeKpis(data: WorkbookData, filteredItems: InventoryItem[] = data.inventory) {
  const inventory = filteredItems;
  return {
    total: inventory.length,
    marineNationale: inventory.filter((item) => item.segmentCartographie === 'Marine nationale').length,
    export: inventory.filter((item) => item.segmentCartographie === 'Marines étrangères / export').length,
    enService: inventory.filter((item) => item.horizonProgramme === 'En service').length,
    transition: inventory.filter((item) => item.horizonProgramme === 'Transition').length,
    futurs: inventory.filter((item) => item.horizonProgramme === 'Futur').length,
    aVerifier: inventory.filter((item) => item.horizonProgramme === 'À vérifier').length,
    opportunites: uniq(inventory.map((item) => item.opportuniteMarche).filter(Boolean)).length,
    sources: data.sources.length,
    corrections: data.corrections.length,
    exclusions: data.exclusions.length,
  };
}

export function getSyntheseKpis(data: WorkbookData) {
  return data.synthese.filter((item) => item.indicateur && item.valeur !== '').slice(0, 8);
}
