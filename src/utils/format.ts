import type { CellValue } from '../types/data';

export const EMPTY_VALUE = 'Non renseigné';

export function cleanValue(value: CellValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toLocaleDateString('fr-FR');
  return String(value).trim();
}

export function displayValue(value: CellValue, fallback = EMPTY_VALUE): string {
  const cleaned = cleanValue(value);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function toNumber(value: CellValue): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('fr-FR').format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 }).format(value);
}

export function uniq<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function cx(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function truncate(value: string, max = 80): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}
