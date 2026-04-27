import { AlertTriangle, ExternalLink, Search, Ship, X } from 'lucide-react';
import { useMemo } from 'react';
import { STATUS_COLORS } from '../../constants/palette';
import { useAppStore } from '../../store/useAppStore';
import type { ExclusionItem, InventoryItem, SourceItem, WorkbookData } from '../../types/data';
import { cx, displayValue, isHttpUrl, normalizeForSearch } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GlobalSearchResultsProps {
  data: WorkbookData;
}

function sourceUrlForExclusion(exclusion: ExclusionItem, sources: SourceItem[]): string {
  const text = normalizeForSearch([exclusion.nom, exclusion.code, exclusion.raison, exclusion.commentaire].join(' '));

  const directMatch = sources.find((source) => {
    const sourceText = normalizeForSearch([source.source, source.utilisationRemarques, source.url].join(' '));
    return (
      (exclusion.nom && sourceText.includes(normalizeForSearch(exclusion.nom.replace('/ désarmé', '').trim()))) ||
      (exclusion.code && sourceText.includes(normalizeForSearch(exclusion.code))) ||
      (text.includes('indochine') && sourceText.includes('indochine')) ||
      (text.includes('retire') && sourceText.includes('retrait'))
    );
  });

  const fallback = sources.find((source) => isHttpUrl(source.url) && normalizeForSearch(source.type).includes('institutionnel')) ?? sources.find((source) => isHttpUrl(source.url));
  return directMatch?.url || fallback?.url || '';
}

function inventoryMatches(item: InventoryItem, query: string): boolean {
  return item.searchText.includes(query);
}

function exclusionMatches(exclusion: ExclusionItem, query: string): boolean {
  return normalizeForSearch([exclusion.nom, exclusion.code, exclusion.raison, exclusion.commentaire, exclusion.ligneSource].join(' ')).includes(query);
}

function InventoryResult({ item }: { item: InventoryItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Ship className="h-4 w-4 text-navy-700 dark:text-blue-300" />
            <h3 className="font-bold text-slate-950 dark:text-white">{item.nomBatiment || item.libellePieuvre || item.id}</h3>
            {item.codeCoque && <Badge>{item.codeCoque}</Badge>}
            <Badge className={cx(STATUS_COLORS[item.statutCartographie] ?? 'bg-slate-100 text-slate-700 ring-slate-200')}>{item.statutCartographie || 'Statut non renseigné'}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {displayValue(item.segmentCartographie)} · {displayValue(item.horizonProgramme)} · {displayValue(item.fonction)} · {displayValue(item.typeBatiment)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Source : {displayValue(item.fiabiliteSource)} {item.observations ? `· ${item.observations}` : ''}
          </p>
        </div>
        {isHttpUrl(item.sourcePrincipale) && (
          <a href={item.sourcePrincipale} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-navy-50 px-3 py-2 text-sm font-bold text-navy-700 hover:bg-navy-100 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700">
            Source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function ExclusionResult({ exclusion, sourceUrl }: { exclusion: ExclusionItem; sourceUrl: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900 dark:bg-amber-950/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            <h3 className="font-bold text-slate-950 dark:text-white">{exclusion.nom || exclusion.code || 'Élément exclu'}</h3>
            {exclusion.code && <Badge>{exclusion.code}</Badge>}
            <Badge className="bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:ring-amber-700">Retiré / exclu</Badge>
          </div>
          <p className="mt-2 text-sm font-semibold text-amber-900 dark:text-amber-100">Raison : {displayValue(exclusion.raison)}</p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">{displayValue(exclusion.commentaire)}</p>
        </div>
        {isHttpUrl(sourceUrl) && (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-slate-900 dark:text-amber-200 dark:ring-amber-800 dark:hover:bg-slate-800">
            Source <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export function GlobalSearchResults({ data }: GlobalSearchResultsProps) {
  const search = useAppStore((state) => state.filters.search);
  const setSearch = useAppStore((state) => state.setSearch);
  const query = normalizeForSearch(search.trim());

  const results = useMemo(() => {
    if (query.length < 2) return { inventory: [] as InventoryItem[], exclusions: [] as ExclusionItem[] };
    return {
      inventory: data.inventory.filter((item) => inventoryMatches(item, query)).slice(0, 8),
      exclusions: data.exclusions.filter((exclusion) => exclusionMatches(exclusion, query)).slice(0, 8),
    };
  }, [data.exclusions, data.inventory, query]);

  if (query.length < 2) return null;

  const total = results.inventory.length + results.exclusions.length;

  return (
    <div className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:px-8 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Search className="h-4 w-4" />
          <span>
            {total > 0 ? `${total} résultat${total > 1 ? 's' : ''} affiché${total > 1 ? 's' : ''}` : 'Aucun résultat'} pour <strong className="text-slate-950 dark:text-white">{search}</strong>
          </span>
        </div>
        <Button variant="ghost" onClick={() => setSearch('')}>
          <X className="h-4 w-4" /> Fermer
        </Button>
      </div>

      {results.exclusions.length > 0 && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Certains résultats sont volontairement absents de la cartographie principale car ils sont retirés du service, désarmés, doublonnés ou hors périmètre. Ils restent affichés ici avec la raison et une source cliquable.
        </div>
      )}

      <div className="grid gap-3 xl:grid-cols-2">
        {results.inventory.map((item) => <InventoryResult key={item.id} item={item} />)}
        {results.exclusions.map((exclusion) => (
          <ExclusionResult key={`${exclusion.ligneSource}-${exclusion.code}-${exclusion.nom}`} exclusion={exclusion} sourceUrl={sourceUrlForExclusion(exclusion, data.sources)} />
        ))}
      </div>
    </div>
  );
}
