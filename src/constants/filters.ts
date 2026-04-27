import type { InventoryItem } from '../types/data';

export type FilterKey =
  | 'segmentCartographie'
  | 'horizonProgramme'
  | 'fonction'
  | 'categorie'
  | 'typeBatiment'
  | 'paysMarine'
  | 'opportuniteMarche'
  | 'portRattachement'
  | 'zone'
  | 'statutCartographie'
  | 'fiabiliteSource';

export interface FilterDefinition {
  key: FilterKey;
  label: string;
  accessor: (item: InventoryItem) => string;
}

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  { key: 'segmentCartographie', label: 'Segment cartographie', accessor: (item) => item.segmentCartographie },
  { key: 'horizonProgramme', label: 'Horizon programme', accessor: (item) => item.horizonProgramme },
  { key: 'fonction', label: 'Fonction', accessor: (item) => item.fonction },
  { key: 'categorie', label: 'Catégorie', accessor: (item) => item.categorie },
  { key: 'typeBatiment', label: 'Type de bâtiment', accessor: (item) => item.typeBatiment },
  { key: 'paysMarine', label: 'Pays / marine', accessor: (item) => item.paysMarine },
  { key: 'opportuniteMarche', label: 'Opportunité marché', accessor: (item) => item.opportuniteMarche },
  { key: 'portRattachement', label: 'Port de rattachement', accessor: (item) => item.portRattachement },
  { key: 'zone', label: 'Zone', accessor: (item) => item.zone },
  { key: 'statutCartographie', label: 'Statut cartographie', accessor: (item) => item.statutCartographie },
  { key: 'fiabiliteSource', label: 'Fiabilité source', accessor: (item) => item.fiabiliteSource },
];
