import type { DataSectionName } from '../types/data';

export const DEFAULT_DATA_URL = `${import.meta.env.BASE_URL}data/marine-data.json`;

export const REQUIRED_SECTIONS: DataSectionName[] = [
  'synthesis',
  'inventory',
  'mapView',
  'relations',
  'exclusions',
  'corrections',
  'sources',
  'guide',
];

export const HIERARCHY_FIELDS = [
  { key: 'centre', label: 'Centre' },
  { key: 'segmentCartographie', label: 'Segment cartographie' },
  { key: 'horizonProgramme', label: 'Horizon programme' },
  { key: 'fonction', label: 'Fonction' },
  { key: 'categorie', label: 'Catégorie' },
  { key: 'typeBatiment', label: 'Type de bâtiment' },
  { key: 'nomBatiment', label: 'Nom du bâtiment' },
] as const;
