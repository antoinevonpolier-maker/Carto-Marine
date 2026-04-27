import { ArrowRight, ExternalLink, Layers, Target, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { InventoryItem, WorkbookData } from '../../types/data';
import { countBy, topEntries } from '../../utils/analytics';
import { filterInventory } from '../../utils/filters';
import { cx, formatNumber, isHttpUrl } from '../../utils/format';
import { FilterPanel } from '../filters/FilterPanel';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';

interface OpportunitiesViewProps {
  data: WorkbookData;
}

interface OpportunityGroup {
  name: string;
  total: number;
  future: number;
  transition: number;
  enService: number;
  score: number;
  items: InventoryItem[];
  horizons: Record<string, number>;
  segments: Record<string, number>;
  functions: Record<string, number>;
}

const horizonOptions = ['Tous', 'En service', 'Transition', 'Futur'] as const;
type HorizonOption = (typeof horizonOptions)[number];

function classifyOpportunity(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('mco') || lower.includes('maintenance') || lower.includes('modernisation')) {
    return 'Lecture : potentiel récurrent de MCO, modernisation, rétrofit, prestations de maintenance, pièces et soutien technique.';
  }
  if (lower.includes('construction') || lower.includes('équipement') || lower.includes('equipement') || lower.includes('futur')) {
    return 'Lecture : potentiel amont sur conception, construction, équipement, intégration, soutien initial et montée en puissance.';
  }
  if (lower.includes('export') || lower.includes('benchmark')) {
    return 'Lecture : intérêt benchmark/export, comparaison de classes, références internationales et positionnement commercial.';
  }
  if (lower.includes('logistique') || lower.includes('servitude') || lower.includes('soutien')) {
    return 'Lecture : potentiel de soutien logistique, servitude portuaire, affrètement, services externalisés et disponibilité opérationnelle.';
  }
  if (lower.includes('formation') || lower.includes('instruction')) {
    return 'Lecture : potentiel formation, instruction, simulateurs, accompagnement utilisateur et transfert de compétences.';
  }
  if (lower.includes('sûreté') || lower.includes('surete') || lower.includes('maritime')) {
    return 'Lecture : potentiel sûreté maritime, surveillance, présence, patrouille, systèmes embarqués et maintien en condition.';
  }
  return 'Lecture : opportunité à qualifier selon l’horizon, le segment, la fonction et les bâtiments concernés.';
}

function buildOpportunityGroups(items: InventoryItem[]): OpportunityGroup[] {
  const map = new Map<string, InventoryItem[]>();
  for (const item of items) {
    const key = item.opportuniteMarche || 'Non renseigné';
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return [...map.entries()]
    .map(([name, groupItems]) => {
      const future = groupItems.filter((item) => item.horizonProgramme === 'Futur').length;
      const transition = groupItems.filter((item) => item.horizonProgramme === 'Transition').length;
      const enService = groupItems.filter((item) => item.horizonProgramme === 'En service').length;
      return {
        name,
        total: groupItems.length,
        future,
        transition,
        enService,
        score: future * 3 + transition * 2 + enService,
        items: groupItems,
        horizons: countBy(groupItems, (item) => item.horizonProgramme),
        segments: countBy(groupItems, (item) => item.segmentCartographie),
        functions: countBy(groupItems, (item) => item.fonction),
      };
    })
    .sort((a, b) => b.score - a.score || b.total - a.total || a.name.localeCompare(b.name, 'fr'));
}

function HorizonBar({ group }: { group: OpportunityGroup }) {
  const total = Math.max(group.total, 1);
  const segments = [
    { label: 'Service', value: group.enService, className: 'bg-emerald-500' },
    { label: 'Transition', value: group.transition, className: 'bg-amber-500' },
    { label: 'Futur', value: group.future, className: 'bg-blue-500' },
  ];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        {segments.map((segment) => segment.value > 0 && <div key={segment.label} className={segment.className} style={{ width: `${(segment.value / total) * 100}%` }} title={`${segment.label}: ${segment.value}`} />)}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        {segments.map((segment) => (
          <span key={segment.label}>{segment.label} {segment.value}</span>
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ group }: { group: OpportunityGroup }) {
  const setFilterValues = useAppStore((state) => state.setFilterValues);
  const setActiveView = useAppStore((state) => state.setActiveView);
  const sample = group.items.slice(0, 6);
  const priority = group.future + group.transition > 0 ? 'Priorité court/moyen terme' : 'Potentiel récurrent';

  function explore(view: 'cartographie' | 'tableau') {
    setFilterValues('opportuniteMarche', [group.name]);
    setActiveView(view);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cx(group.future + group.transition > 0 ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800' : '')}>{priority}</Badge>
            <Badge>Score {formatNumber(group.score)}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{group.name}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatNumber(group.total)} bâtiment{group.total > 1 ? 's' : ''} / opération{group.total > 1 ? 's' : ''}</p>
        </div>
        <div className="rounded-2xl bg-navy-50 p-3 text-navy-700 dark:bg-slate-800 dark:text-blue-300">
          <Target className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5">
        <HorizonBar group={group} />
      </div>

      <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-300">{classifyOpportunity(group.name)}</p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Segments</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topEntries(group.segments, 4).map(([label, count]) => <Badge key={label}>{label} · {count}</Badge>)}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fonctions</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topEntries(group.functions, 4).map(([label, count]) => <Badge key={label}>{label} · {count}</Badge>)}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Exemples liés</p>
        {sample.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-slate-800 dark:text-slate-100">{item.nomBatiment || item.libellePieuvre}</span>
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{item.codeCoque} · {item.horizonProgramme}</span>
            </div>
            {isHttpUrl(item.sourcePrincipale) && (
              <a href={item.sourcePrincipale} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:underline dark:text-blue-300">
                Source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => explore('cartographie')}>Voir sur la carte</Button>
        <Button variant="secondary" onClick={() => explore('tableau')}>Voir en tableau</Button>
      </div>
    </Card>
  );
}

export function OpportunitiesView({ data }: OpportunitiesViewProps) {
  const filters = useAppStore((state) => state.filters);
  const [horizon, setHorizon] = useState<HorizonOption>('Tous');
  const filteredInventory = useMemo(() => filterInventory(data.inventory, filters), [data.inventory, filters]);
  const scopedInventory = useMemo(() => (horizon === 'Tous' ? filteredInventory : filteredInventory.filter((item) => item.horizonProgramme === horizon)), [filteredInventory, horizon]);
  const groups = useMemo(() => buildOpportunityGroups(scopedInventory), [scopedInventory]);
  const promising = groups.filter((group) => group.future + group.transition > 0).slice(0, 5);

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Lecture marché"
        title="Vue opportunités"
        description="Cette vue classe les opportunités par priorité, distingue les horizons et donne une lecture métier directe : MCO, futur, transition, soutien, export, formation ou sûreté maritime."
      />
      <FilterPanel items={data.inventory} />

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">Filtrer par horizon</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Permet de séparer les besoins actuels, les transitions et les programmes futurs.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {horizonOptions.map((option) => (
              <button
                key={option}
                onClick={() => setHorizon(option)}
                className={cx(
                  'rounded-xl px-3 py-2 text-sm font-bold transition',
                  horizon === option ? 'bg-navy-800 text-white dark:bg-blue-500' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <h3 className="font-bold text-slate-950 dark:text-white">Priorités visibles</h3>
          </div>
          <div className="mt-4 space-y-3">
            {promising.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Aucune priorité future ou transition dans le périmètre actuel.</p>}
            {promising.map((group) => (
              <div key={group.name} className="flex items-center gap-3 text-sm">
                <ArrowRight className="h-4 w-4 text-amber-500" />
                <span className="flex-1 text-slate-700 dark:text-slate-200">{group.name}</span>
                <Badge>{group.future + group.transition}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 md:col-span-2">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <h3 className="font-bold text-slate-950 dark:text-white">Comment lire cette vue</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Le score donne plus de poids aux lignes Futur et Transition car elles signalent des besoins à venir. Les lignes En service restent importantes pour les marchés récurrents : MCO, maintenance, soutien logistique, formation et services externalisés.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {groups.map((group) => <OpportunityCard key={group.name} group={group} />)}
      </div>
    </div>
  );
}
