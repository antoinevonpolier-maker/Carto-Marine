import { REQUIRED_SECTIONS } from '../constants/sheets';
import type {
  CorrectionItem,
  ExclusionItem,
  GuideItem,
  InventoryItem,
  RawRow,
  RelationLink,
  DataSectionName,
  SourceItem,
  SyntheseItem,
  WorkbookData,
} from '../types/data';
import { cleanValue, normalizeForSearch, toNumber } from './format';

function get(row: RawRow, key: string): string {
  return cleanValue(row[key]);
}

function getNumber(row: RawRow, key: string): number | null {
  return toNumber(row[key]);
}

export function normalizeInventoryRow(row: RawRow, index: number): InventoryItem | null {
  const id = get(row, 'ID') || `ROW-${index + 1}`;
  const nomBatiment = get(row, 'Nom du bâtiment');
  const centre = get(row, 'Centre') || 'Marché naval / opportunités';

  // On conserve uniquement les lignes réellement exploitables de l'inventaire.
  if (!id && !nomBatiment) return null;

  const item: InventoryItem = {
    id,
    centre,
    segmentCartographie: get(row, 'Segment cartographie'),
    paysMarine: get(row, 'Pays / marine'),
    poleAnalyse: get(row, 'Pôle d’analyse'),
    horizonProgramme: get(row, 'Horizon programme'),
    statutCartographie: get(row, 'Statut cartographie'),
    opportuniteMarche: get(row, 'Opportunité marché'),
    fonction: get(row, 'Fonction'),
    categorie: get(row, 'Catégorie'),
    typeBatiment: get(row, 'Type de bâtiment'),
    classe: get(row, 'Classe'),
    codeCoque: get(row, 'Code coque'),
    nomBatiment,
    libellePieuvre: get(row, 'Libellé pieuvre'),
    portRattachement: get(row, 'Port de rattachement'),
    zone: get(row, 'Zone'),
    tonnageT: getNumber(row, 'Tonnage t'),
    tonnageTexte: get(row, 'Tonnage texte'),
    anneeMES: get(row, 'Année MES'),
    miseEnServiceDate: get(row, 'Mise en service / date'),
    statut2026: get(row, 'Statut 2026'),
    perimetre: get(row, 'Périmètre'),
    compter69Officiels: get(row, 'À compter dans les 69 officiels ?'),
    constructeur: get(row, 'Constructeur'),
    portConstructeur: get(row, 'Port constructeur'),
    motoriste: get(row, 'Motoriste'),
    propulsion: get(row, 'Propulsion'),
    puissanceCV: get(row, 'Puissance CV'),
    mainteneur: get(row, 'Mainteneur'),
    contratSsfDga: get(row, 'Contrat SSF/DGA'),
    lancementRenouvellement: get(row, 'Lancement renouvellement'),
    sourcePrincipale: get(row, 'Source principale'),
    fiabiliteSource: get(row, 'Fiabilité source'),
    observations: get(row, 'Observations'),
    origineLigneSource: get(row, 'Origine / ligne source'),
    raw: row,
    searchText: '',
  };

  item.searchText = normalizeForSearch(
    [
      item.id,
      item.centre,
      item.segmentCartographie,
      item.paysMarine,
      item.poleAnalyse,
      item.horizonProgramme,
      item.statutCartographie,
      item.opportuniteMarche,
      item.fonction,
      item.categorie,
      item.typeBatiment,
      item.classe,
      item.codeCoque,
      item.nomBatiment,
      item.libellePieuvre,
      item.portRattachement,
      item.zone,
      item.statut2026,
      item.perimetre,
      item.constructeur,
      item.mainteneur,
      item.sourcePrincipale,
      item.fiabiliteSource,
      item.observations,
    ].join(' '),
  );

  return item;
}

export function normalizeRelation(row: RawRow): RelationLink | null {
  const parent = get(row, 'Parent');
  const enfant = get(row, 'Enfant');
  if (!parent || !enfant) return null;
  return {
    parent,
    enfant,
    niveauParent: get(row, 'Niveau parent'),
    niveauEnfant: get(row, 'Niveau enfant'),
    typeLien: get(row, 'Type de lien'),
    nbBatiments: getNumber(row, 'Nb bâtiments'),
    statutsConcernes: get(row, 'Statuts concernés'),
    exemples: get(row, 'Exemples'),
    raw: row,
  };
}

export function normalizeSynthese(row: RawRow): SyntheseItem | null {
  const indicateur = get(row, 'Indicateur');
  const bloc = get(row, 'Bloc');
  if (!indicateur && !bloc) return null;

  return {
    indicateur,
    valeur: typeof row.Valeur === 'number' || typeof row.Valeur === 'string' ? row.Valeur : cleanValue(row.Valeur),
    remarque: get(row, 'Remarque'),
    bloc,
    segmentCartographie: get(row, 'Segment cartographie'),
    horizonProgramme: get(row, 'Horizon programme'),
    nb: getNumber(row, 'Nb'),
    raw: row,
  };
}

export function normalizeExclusion(row: RawRow): ExclusionItem | null {
  const raison = get(row, 'Raison');
  const nom = get(row, 'Nom');
  const code = get(row, 'Code');
  if (!raison && !nom && !code) return null;
  return {
    ligneSource: get(row, 'Ligne source'),
    code,
    nom,
    raison,
    commentaire: get(row, 'Commentaire'),
    raw: row,
  };
}

export function normalizeCorrection(row: RawRow): CorrectionItem | null {
  const element = get(row, 'Élément');
  const typeCorrection = get(row, 'Type de correction');
  if (!typeCorrection && !element) return null;
  return {
    typeCorrection,
    element,
    avantProbleme: get(row, 'Avant / problème'),
    apresCorrection: get(row, 'Après / correction'),
    sourceRemarque: get(row, 'Source / remarque'),
    raw: row,
  };
}

export function normalizeSource(row: RawRow): SourceItem | null {
  const source = get(row, 'Source');
  const url = get(row, 'URL');
  if (!source && !url) return null;
  return {
    source,
    url,
    type: get(row, 'Type'),
    dateConsultation: get(row, 'Date de consultation'),
    utilisationRemarques: get(row, 'Utilisation / remarques'),
    raw: row,
  };
}

export function normalizeGuide(row: RawRow): GuideItem | null {
  const element = get(row, 'Élément');
  const detail = get(row, 'Détail');
  if (!element && !detail) return null;
  return { element, detail, raw: row };
}

export function normalizeWorkbook(sections: Partial<Record<DataSectionName, RawRow[]>>): WorkbookData {
  const completeSections = REQUIRED_SECTIONS.reduce<Record<DataSectionName, RawRow[]>>((acc, sectionName) => {
    acc[sectionName] = sections[sectionName] ?? [];
    return acc;
  }, {} as Record<DataSectionName, RawRow[]>);

  const missingSections = REQUIRED_SECTIONS.filter((sectionName) => !(sectionName in sections));

  return {
    sections: completeSections,
    inventory: completeSections.inventory.map(normalizeInventoryRow).filter(Boolean) as InventoryItem[],
    vueCartographie: completeSections.mapView,
    relations: completeSections.relations.map(normalizeRelation).filter(Boolean) as RelationLink[],
    synthese: completeSections.synthesis.map(normalizeSynthese).filter(Boolean) as SyntheseItem[],
    exclusions: completeSections.exclusions.map(normalizeExclusion).filter(Boolean) as ExclusionItem[],
    corrections: completeSections.corrections.map(normalizeCorrection).filter(Boolean) as CorrectionItem[],
    sources: completeSections.sources.map(normalizeSource).filter(Boolean) as SourceItem[],
    guide: completeSections.guide.map(normalizeGuide).filter(Boolean) as GuideItem[],
    meta: {
      loadedAt: new Date().toISOString(),
      sectionRowCounts: REQUIRED_SECTIONS.reduce<Record<DataSectionName, number>>((acc, sectionName) => {
        acc[sectionName] = completeSections[sectionName].length;
        return acc;
      }, {} as Record<DataSectionName, number>),
      missingSections,
    },
  };
}
