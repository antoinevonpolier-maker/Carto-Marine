import { DEFAULT_DATA_URL, REQUIRED_SECTIONS } from '../constants/sheets';
import type { DataSectionName, RawRow, WorkbookData } from '../types/data';
import { normalizeWorkbook } from '../utils/normalize';

interface StaticDataPayload {
  sections?: Partial<Record<DataSectionName, RawRow[]>>;
}

export class DataLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataLoadError';
  }
}

export async function loadDataFromUrl(url = DEFAULT_DATA_URL): Promise<WorkbookData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new DataLoadError(`Impossible de charger les données : ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as StaticDataPayload;
  const sections = payload.sections ?? {};
  const missingRequired = REQUIRED_SECTIONS.filter((sectionName) => !Array.isArray(sections[sectionName]));

  if (missingRequired.length > 0) {
    throw new DataLoadError(`Données incomplètes : ${missingRequired.join(', ')}`);
  }

  return normalizeWorkbook(sections);
}
