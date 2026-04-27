import { Anchor, Database, FileCheck2, GitBranch, Globe2, Info, Shield, Ship, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { InventoryItem, WorkbookData } from '../../types/data';
import { countBy, computeKpis, getSyntheseKpis, topEntries } from '../../utils/analytics';
import { filterInventory } from '../../utils/filters';
import { formatNumber } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';
import { KpiCard } from './KpiCard';

interface DashboardProps {
  data: WorkbookData;
}

type InsightId = 'total' | 'marine' | 'export' | 'pipeline' | 'service' | 'opportunites' | 'sources' | 'exclusions';

interface Insight {
  id: InsightId;
  title: string;
  description: string;
  items: InventoryItem[];
  action?: () => void;
}

function BarList({ entries, total, onClick }: { entries: Array<[string, number]>; total: number; onClick?: (label: string) => void }) {
  return (
    <div className="space-y-3">
      {entries.map(([label, value]) => (
        <button key={label} type="button" onClick={() => onClick?.(label)} className="block w-full rounded-xl p-1 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/70">
          <div className="mb-1 flex items-center justify-between gap-4 text-xs">
            <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">{formatNumber(value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-navy-700 dark:bg-blue-400" style={{ width: `${Math.max(3, (value / Math.max(total, 1)) * 100)}%` }} />
          </div>
        </button>
      ))}
    </div>
  );
}

function InsightPanel({ insight }: { insight: Insight }) {
  const samples = insight.items.slice(0, 6);
  return (
    <Card className="border-navy-100 bg-navy-50/40 dark:border-blue-900 dark:bg-blue-950/20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">{insight.title}</h3>
          </div>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">{insight.description}</p>
        </div>
        {insight.action && <Button onClick={insight.action}>Explorer</Button>}
      </div>

      {samples.length > 0 && (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {samples.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="font-bold text-slate-950 dark:text-white">{item.nomBatiment || item.libellePieuvre || item.id}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.horizonProgramme} · {item.fonction}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.codeCoque && <Badge>{item.codeCoque}</Badge>}
                {item.opportuniteMarche && <Badge>{item.opportuniteMarche}</Badge>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function Dashboard({ data }: DashboardProps) {
  const filters = useAppStore((state) => state.filters);
  const setFilterValues = useAppStore((state) => state.setFilterValues);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const filteredInventory = useMemo(() => filterInventory(data.inventory, filters), [data.inventory, filters]);
  const kpis = useMemo(() => computeKpis(data, filteredInventory), [data, filteredInventory]);
  const synthese = useMemo(() => getSyntheseKpis(data), [data]);
  const byHorizon = useMemo(() => topEntries(countBy(filteredInventory, (item) => item.horizonProgramme)), [filteredInventory]);
  const byFunction = useMemo(() => topEntries(countBy(filteredInventory, (item) => item.fonction)), [filteredInventory]);
  const byOpportunity = useMemo(() => topEntries(countBy(filteredInventory, (item) => item.opportuniteMarche), 6), [filteredInventory]);
  const [selectedInsight, setSelectedInsight] = useState<InsightId>('pipeline');

  const insights: Record<InsightId, Insight> = {
    total: {
      id: 'total',
      title: 'Périmètre global analysé',
      description: 'Toutes les lignes actuellement visibles après recherche et filtres. Ce total sert de base aux répartitions par horizon, fonction, opportunité et segment.',
      items: filteredInventory,
      action: () => setActiveView('tableau'),
    },
    marine: {
      id: 'marine',
      title: 'Marine nationale',
      description: 'Périmètre français : bâtiments en service, en transition, à vérifier ou futurs. Utile pour repérer les besoins MCO, modernisation, soutien logistique, formation et renouvellement.',
      items: filteredInventory.filter((item) => item.segmentCartographie === 'Marine nationale'),
      action: () => {
        setFilterValues('segmentCartographie', ['Marine nationale']);
        setActiveView('cartographie');
      },
    },
    export: {
      id: 'export',
      title: 'Marines étrangères / export',
      description: 'Périmètre benchmark et export. Ces lignes aident à comparer les classes, les usages et les opportunités possibles hors Marine nationale.',
      items: filteredInventory.filter((item) => item.segmentCartographie === 'Marines étrangères / export'),
      action: () => {
        setFilterValues('segmentCartographie', ['Marines étrangères / export']);
        setActiveView('cartographie');
      },
    },
    pipeline: {
      id: 'pipeline',
      title: 'Futurs + transition',
      description: 'Les horizons Futur et Transition indiquent les besoins à venir : construction, équipement, soutien initial, essais, modernisation, renouvellement et maintien en condition opérationnelle.',
      items: filteredInventory.filter((item) => ['Futur', 'Transition'].includes(item.horizonProgramme)),
      action: () => setActiveView('opportunites'),
    },
    service: {
      id: 'service',
      title: 'En service',
      description: 'Les bâtiments en service représentent surtout les besoins récurrents : MCO, maintenance, modernisation, formation, soutien logistique, servitude et prestations externalisées.',
      items: filteredInventory.filter((item) => item.horizonProgramme === 'En service'),
      action: () => {
        setFilterValues('horizonProgramme', ['En service']);
        setActiveView('cartographie');
      },
    },
    opportunites: {
      id: 'opportunites',
      title: 'Familles d’opportunités marché',
      description: 'Nombre de familles d’opportunités présentes dans le périmètre filtré. Cliquez sur la vue opportunités pour lire les priorités par horizon et par segment.',
      items: filteredInventory,
      action: () => setActiveView('opportunites'),
    },
    sources: {
      id: 'sources',
      title: 'Sources documentées',
      description: 'Les sources sont centralisées dans la vue qualité afin de rendre l’analyse traçable. Les liens cliquables sont disponibles dans les détails et dans la recherche.',
      items: filteredInventory.filter((item) => item.sourcePrincipale),
      action: () => setActiveView('qualite'),
    },
    exclusions: {
      id: 'exclusions',
      title: 'Exclusions contrôlées',
      description: 'Les navires retirés, désarmés, doublonnés ou hors périmètre ne polluent pas la cartographie principale. Ils restent retrouvables par la recherche avec leur raison d’exclusion et une source.',
      items: [],
      action: () => setActiveView('qualite'),
    },
  };

  function applyQuickFilter(kind: 'horizonProgramme' | 'fonction' | 'opportuniteMarche', value: string) {
    setFilterValues(kind, [value]);
    setActiveView(kind === 'opportuniteMarche' ? 'opportunites' : 'cartographie');
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Vue d'ensemble"
        title="Cartographie stratégique du marché naval"
        description="Les indicateurs sont recalculés selon la recherche et les filtres actifs. Cliquez sur une carte KPI ou une barre de répartition pour obtenir des précisions et explorer le périmètre correspondant."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard active={selectedInsight === 'total'} onClick={() => setSelectedInsight('total')} label="Lignes analysées" value={formatNumber(kpis.total)} detail="Périmètre filtré" icon={<Database className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'marine'} onClick={() => setSelectedInsight('marine')} label="Marine nationale" value={formatNumber(kpis.marineNationale)} detail="Segment France" icon={<Ship className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'export'} onClick={() => setSelectedInsight('export')} label="Export / benchmark" value={formatNumber(kpis.export)} detail="Marines étrangères" icon={<Globe2 className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'pipeline'} onClick={() => setSelectedInsight('pipeline')} label="Futurs + transition" value={formatNumber(kpis.futurs + kpis.transition)} detail="Programmes à suivre" icon={<Target className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'service'} onClick={() => setSelectedInsight('service')} label="En service" value={formatNumber(kpis.enService)} detail="Besoins récurrents" icon={<Anchor className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'opportunites'} onClick={() => setSelectedInsight('opportunites')} label="Opportunités" value={formatNumber(kpis.opportunites)} detail="Familles de marché" icon={<GitBranch className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'sources'} onClick={() => setSelectedInsight('sources')} label="Sources" value={formatNumber(kpis.sources)} detail="Traçabilité" icon={<FileCheck2 className="h-5 w-5" />} />
        <KpiCard active={selectedInsight === 'exclusions'} onClick={() => setSelectedInsight('exclusions')} label="Exclusions" value={formatNumber(kpis.exclusions)} detail="Retirés, doublons, hors périmètre" icon={<Shield className="h-5 w-5" />} />
      </div>

      <div className="mt-6">
        <InsightPanel insight={insights[selectedInsight]} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Répartition par horizon</h3>
          <div className="mt-4">
            <BarList entries={byHorizon} total={filteredInventory.length} onClick={(label) => applyQuickFilter('horizonProgramme', label)} />
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fonctions principales</h3>
          <div className="mt-4">
            <BarList entries={byFunction} total={filteredInventory.length} onClick={(label) => applyQuickFilter('fonction', label)} />
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Opportunités dominantes</h3>
          <div className="mt-4">
            <BarList entries={byOpportunity} total={filteredInventory.length} onClick={(label) => applyQuickFilter('opportuniteMarche', label)} />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Chiffres clés de synthèse</h3>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {synthese.map((item) => (
                  <tr key={item.indicateur} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{item.indicateur}</td>
                    <td className="px-4 py-3 text-right font-bold text-navy-800 dark:text-blue-300">{String(item.valeur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-bold text-slate-950 dark:text-white">Qualité et traçabilité</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sources</p>
              <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(data.sources.length)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Corrections</p>
              <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(data.corrections.length)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Exclusions</p>
              <p className="mt-1 text-xl font-bold text-slate-950 dark:text-white">{formatNumber(data.exclusions.length)}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">Les éléments exclus restent hors cartographie principale pour préserver la lisibilité, mais ils apparaissent dans la recherche globale avec leur raison et leur source.</p>
        </Card>
      </div>
    </div>
  );
}
