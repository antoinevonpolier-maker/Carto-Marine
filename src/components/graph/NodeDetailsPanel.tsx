import { ExternalLink, Info, X } from 'lucide-react';
import { STATUS_COLORS } from '../../constants/palette';
import { useAppStore } from '../../store/useAppStore';
import type { GraphNode, InventoryItem } from '../../types/data';
import { cx, displayValue, isHttpUrl } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const details: Array<{ label: string; value: (item: InventoryItem) => string | number | null }> = [
  { label: 'ID', value: (item) => item.id },
  { label: 'Segment cartographie', value: (item) => item.segmentCartographie },
  { label: 'Pays / marine', value: (item) => item.paysMarine },
  { label: 'Pôle d’analyse', value: (item) => item.poleAnalyse },
  { label: 'Horizon programme', value: (item) => item.horizonProgramme },
  { label: 'Opportunité marché', value: (item) => item.opportuniteMarche },
  { label: 'Fonction', value: (item) => item.fonction },
  { label: 'Catégorie', value: (item) => item.categorie },
  { label: 'Type de bâtiment', value: (item) => item.typeBatiment },
  { label: 'Classe', value: (item) => item.classe },
  { label: 'Code coque', value: (item) => item.codeCoque },
  { label: 'Port de rattachement', value: (item) => item.portRattachement },
  { label: 'Zone', value: (item) => item.zone },
  { label: 'Tonnage', value: (item) => item.tonnageTexte || item.tonnageT },
  { label: 'Année MES', value: (item) => item.anneeMES },
  { label: 'Mise en service / date', value: (item) => item.miseEnServiceDate },
  { label: 'Statut 2026', value: (item) => item.statut2026 },
  { label: 'Périmètre', value: (item) => item.perimetre },
  { label: 'À compter dans les 69 officiels ?', value: (item) => item.compter69Officiels },
  { label: 'Constructeur', value: (item) => item.constructeur },
  { label: 'Port constructeur', value: (item) => item.portConstructeur },
  { label: 'Motoriste', value: (item) => item.motoriste },
  { label: 'Propulsion', value: (item) => item.propulsion },
  { label: 'Puissance CV', value: (item) => item.puissanceCV },
  { label: 'Mainteneur', value: (item) => item.mainteneur },
  { label: 'Contrat SSF/DGA', value: (item) => item.contratSsfDga },
  { label: 'Lancement renouvellement', value: (item) => item.lancementRenouvellement },
  { label: 'Fiabilité source', value: (item) => item.fiabiliteSource },
  { label: 'Observations', value: (item) => item.observations },
];

function NodeSummary({ node }: { node: GraphNode }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Nœud sélectionné</p>
        <h3 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{node.label}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{node.level}</Badge>
          <Badge>{node.count} bâtiment{node.count > 1 ? 's' : ''}</Badge>
          {node.hasChildren && <Badge>Branche extensible</Badge>}
        </div>
      </div>
      {node.relation && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          <p className="font-bold">Relation métier</p>
          <p className="mt-1">{node.relation.typeLien}</p>
          {node.relation.exemples && <p className="mt-2 text-xs opacity-80">Exemples : {node.relation.exemples}</p>}
        </div>
      )}
    </div>
  );
}

export function NodeDetailsPanel() {
  const selectedNode = useAppStore((state) => state.selectedNode);
  const setSelectedNode = useAppStore((state) => state.setSelectedNode);

  if (!selectedNode) {
    return (
      <Card className="h-full p-5">
        <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
          <Info className="mt-1 h-5 w-5" />
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Aucun nœud sélectionné</h3>
            <p className="mt-1 text-sm leading-6">Cliquez sur une branche pour afficher son contexte ou sur un bâtiment pour consulter toutes les colonnes disponibles.</p>
          </div>
        </div>
      </Card>
    );
  }

  const item = selectedNode.item;

  return (
    <Card className="h-full overflow-hidden p-0">
      <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Détail</p>
          <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{item?.nomBatiment || selectedNode.label}</h2>
        </div>
        <button onClick={() => setSelectedNode(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-auto p-5">
        <NodeSummary node={selectedNode} />
        {item && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={cx(STATUS_COLORS[item.statutCartographie] ?? 'bg-slate-100 text-slate-700 ring-slate-200')}>{item.statutCartographie || 'Statut non renseigné'}</Badge>
              <Badge>{item.horizonProgramme || 'Horizon non renseigné'}</Badge>
              <Badge>{item.opportuniteMarche || 'Opportunité non renseignée'}</Badge>
            </div>
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {details.map((detail) => (
                <div key={detail.label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-3">
                  <dt className="font-semibold text-slate-500 dark:text-slate-400">{detail.label}</dt>
                  <dd className="sm:col-span-2 text-slate-800 dark:text-slate-100">{displayValue(detail.value(item))}</dd>
                </div>
              ))}
              <div className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-3">
                <dt className="font-semibold text-slate-500 dark:text-slate-400">Source principale</dt>
                <dd className="sm:col-span-2 text-slate-800 dark:text-slate-100">
                  {isHttpUrl(item.sourcePrincipale) ? (
                    <a href={item.sourcePrincipale} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-navy-700 hover:underline dark:text-blue-300">
                      Ouvrir la source <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    displayValue(item.sourcePrincipale)
                  )}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </Card>
  );
}
