export const DATA_SECTIONS = [
  'synthesis',
  'inventory',
  'mapView',
  'relations',
  'exclusions',
  'corrections',
  'sources',
  'guide',
] as const;

export type DataSectionName = (typeof DATA_SECTIONS)[number];
export type CellValue = string | number | boolean | Date | null | undefined;
export type RawRow = Record<string, CellValue>;

export type Horizon = 'En service' | 'Transition' | 'Futur' | 'À vérifier' | string;
export type Segment = 'Marine nationale' | 'Marines étrangères / export' | string;

export interface InventoryItem {
  id: string;
  centre: string;
  segmentCartographie: string;
  paysMarine: string;
  poleAnalyse: string;
  horizonProgramme: string;
  statutCartographie: string;
  opportuniteMarche: string;
  fonction: string;
  categorie: string;
  typeBatiment: string;
  classe: string;
  codeCoque: string;
  nomBatiment: string;
  libellePieuvre: string;
  portRattachement: string;
  zone: string;
  tonnageT: number | null;
  tonnageTexte: string;
  anneeMES: string;
  miseEnServiceDate: string;
  statut2026: string;
  perimetre: string;
  compter69Officiels: string;
  constructeur: string;
  portConstructeur: string;
  motoriste: string;
  propulsion: string;
  puissanceCV: string;
  mainteneur: string;
  contratSsfDga: string;
  lancementRenouvellement: string;
  sourcePrincipale: string;
  fiabiliteSource: string;
  observations: string;
  origineLigneSource: string;
  searchText: string;
  raw: RawRow;
}

export interface RelationLink {
  parent: string;
  enfant: string;
  niveauParent: string;
  niveauEnfant: string;
  typeLien: string;
  nbBatiments: number | null;
  statutsConcernes: string;
  exemples: string;
  raw: RawRow;
}

export interface SyntheseItem {
  indicateur: string;
  valeur: string | number;
  remarque: string;
  bloc?: string;
  segmentCartographie?: string;
  horizonProgramme?: string;
  nb?: number | null;
  raw: RawRow;
}

export interface ExclusionItem {
  ligneSource: string;
  code: string;
  nom: string;
  raison: string;
  commentaire: string;
  raw: RawRow;
}

export interface CorrectionItem {
  typeCorrection: string;
  element: string;
  avantProbleme: string;
  apresCorrection: string;
  sourceRemarque: string;
  raw: RawRow;
}

export interface SourceItem {
  source: string;
  url: string;
  type: string;
  dateConsultation: string;
  utilisationRemarques: string;
  raw: RawRow;
}

export interface GuideItem {
  element: string;
  detail: string;
  raw: RawRow;
}

export interface WorkbookData {
  sections: Record<DataSectionName, RawRow[]>;
  inventory: InventoryItem[];
  vueCartographie: RawRow[];
  relations: RelationLink[];
  synthese: SyntheseItem[];
  exclusions: ExclusionItem[];
  corrections: CorrectionItem[];
  sources: SourceItem[];
  guide: GuideItem[];
  meta: {
    loadedAt: string;
    sectionRowCounts: Record<DataSectionName, number>;
    missingSections: DataSectionName[];
  };
}

export interface GraphNode {
  id: string;
  label: string;
  level: string;
  depth: number;
  count: number;
  path: string[];
  colorKey: string;
  hasChildren: boolean;
  parentId?: string;
  item?: InventoryItem;
  relation?: RelationLink;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  count?: number | null;
  relation?: RelationLink;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type ViewId = 'dashboard' | 'cartographie' | 'tableau' | 'opportunites' | 'qualite';
