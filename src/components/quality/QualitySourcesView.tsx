import { AlertTriangle, CheckCircle2, ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { WorkbookData } from '../../types/data';
import { countBy, topEntries } from '../../utils/analytics';
import { formatNumber, isHttpUrl } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';

type TabId = 'sources' | 'corrections' | 'exclusions';

interface QualitySourcesViewProps {
  data: WorkbookData;
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        active
          ? 'rounded-xl bg-navy-800 px-4 py-2 text-sm font-bold text-white dark:bg-blue-500'
          : 'rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      }
    >
      {children}
    </button>
  );
}

function ReliabilityCard({ data }: QualitySourcesViewProps) {
  const reliability = useMemo(() => topEntries(countBy(data.inventory, (item) => item.fiabiliteSource), 10), [data.inventory]);
  const total = data.inventory.length;
  return (
    <Card>
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-navy-700 dark:text-blue-300" />
        <h3 className="font-bold text-slate-950 dark:text-white">Fiabilité des sources</h3>
      </div>
      <div className="mt-4 space-y-3">
        {reliability.map(([label, count]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">{label || 'Non renseigné'}</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">{formatNumber(count)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-navy-700 dark:bg-blue-400" style={{ width: `${Math.max(4, (count / Math.max(total, 1)) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SourcesTable({ data }: QualitySourcesViewProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Utilisation / remarques</th>
            <th className="px-4 py-3">URL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.sources.map((source) => (
            <tr key={`${source.source}-${source.url}`} className="bg-white dark:bg-slate-900">
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{source.source}</td>
              <td className="px-4 py-3"><Badge>{source.type || 'Non renseigné'}</Badge></td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{source.dateConsultation}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{source.utilisationRemarques}</td>
              <td className="px-4 py-3">
                {isHttpUrl(source.url) ? (
                  <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy-700 hover:underline dark:text-blue-300">
                    Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400">{source.url}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CorrectionsTable({ data }: QualitySourcesViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.corrections.map((correction) => (
        <Card key={`${correction.typeCorrection}-${correction.element}`}>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <div>
              <Badge>{correction.typeCorrection}</Badge>
              <h3 className="mt-2 font-bold text-slate-950 dark:text-white">{correction.element}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Avant : {correction.avantProbleme}</p>
              <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">Après : {correction.apresCorrection}</p>
              {correction.sourceRemarque && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{correction.sourceRemarque}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ExclusionsTable({ data }: QualitySourcesViewProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.exclusions.map((exclusion) => (
        <Card key={`${exclusion.ligneSource}-${exclusion.code}-${exclusion.nom}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 text-amber-600 dark:text-amber-300" />
            <div>
              <Badge className="bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800">Exclu de la visualisation principale</Badge>
              <h3 className="mt-2 font-bold text-slate-950 dark:text-white">{exclusion.nom || exclusion.code || 'Élément exclu'}</h3>
              {exclusion.code && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{exclusion.code}</p>}
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Raison : {exclusion.raison}</p>
              {exclusion.commentaire && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{exclusion.commentaire}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function QualitySourcesView({ data }: QualitySourcesViewProps) {
  const [tab, setTab] = useState<TabId>('sources');

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Traçabilité"
        title="Sources, corrections et qualité des données"
        description="Cette vue regroupe les sources, corrections et exclusions. Les exclusions restent hors graphe principal, mais elles sont documentées pour conserver la transparence de la donnée."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-navy-700 dark:text-blue-300" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{formatNumber(data.sources.length)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">sources documentées</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{formatNumber(data.corrections.length)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">corrections / enrichissements</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-2xl font-bold text-slate-950 dark:text-white">{formatNumber(data.exclusions.length)}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">exclusions contrôlées</p>
            </div>
          </div>
        </Card>
      </div>

      <ReliabilityCard data={data} />

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === 'sources'} onClick={() => setTab('sources')}>Sources</TabButton>
          <TabButton active={tab === 'corrections'} onClick={() => setTab('corrections')}>Corrections</TabButton>
          <TabButton active={tab === 'exclusions'} onClick={() => setTab('exclusions')}>Exclusions</TabButton>
        </div>
      </Card>

      {tab === 'sources' && <SourcesTable data={data} />}
      {tab === 'corrections' && <CorrectionsTable data={data} />}
      {tab === 'exclusions' && <ExclusionsTable data={data} />}
    </div>
  );
}
