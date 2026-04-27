import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { WorkbookData } from '../../types/data';
import { filterInventory } from '../../utils/filters';
import { buildGraphData, getDefaultExpandedIds, getVisibleGraph } from '../../utils/graph';
import { FilterPanel } from '../filters/FilterPanel';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SectionTitle } from '../ui/SectionTitle';
import { CytoscapeGraph } from './CytoscapeGraph';
import { GraphLegend } from './GraphLegend';
import { NodeDetailsPanel } from './NodeDetailsPanel';

interface GraphViewProps {
  data: WorkbookData;
}

export function GraphView({ data }: GraphViewProps) {
  const filters = useAppStore((state) => state.filters);
  const expandedNodeIds = useAppStore((state) => state.expandedNodeIds);
  const graphMaxDepth = useAppStore((state) => state.graphMaxDepth);
  const setGraphMaxDepth = useAppStore((state) => state.setGraphMaxDepth);
  const setExpandedNodeIds = useAppStore((state) => state.setExpandedNodeIds);
  const expandAllVisible = useAppStore((state) => state.expandAllVisible);
  const collapseToTop = useAppStore((state) => state.collapseToTop);

  const filteredInventory = useMemo(() => filterInventory(data.inventory, filters), [data.inventory, filters]);
  const fullGraph = useMemo(() => buildGraphData(filteredInventory, data.relations), [filteredInventory, data.relations]);
  const visibleGraph = useMemo(() => getVisibleGraph(fullGraph, expandedNodeIds, graphMaxDepth), [fullGraph, expandedNodeIds, graphMaxDepth]);

  useEffect(() => {
    setExpandedNodeIds(getDefaultExpandedIds(fullGraph));
  }, [fullGraph, setExpandedNodeIds]);

  return (
    <div className="space-y-5">
      <SectionTitle
        eyebrow="Pieuvre relationnelle"
        title="Cartographie principale"
        description="Le graphe suit l’ordre Centre → Segment → Horizon → Fonction → Catégorie → Type → Nom du bâtiment, avec les liens de cohérence métier et les filtres actifs."
      />
      <FilterPanel items={data.inventory} />
      <GraphLegend />
      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-navy-50 p-2 text-navy-700 dark:bg-slate-800 dark:text-blue-300">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">Niveau de lecture</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Limitez la profondeur pour garder la cartographie lisible avec beaucoup de nœuds.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Profondeur {graphMaxDepth}</label>
            <input
              type="range"
              min={2}
              max={7}
              value={graphMaxDepth}
              onChange={(event) => setGraphMaxDepth(Number(event.target.value))}
              className="accent-navy-700"
            />
            <Button onClick={() => expandAllVisible(fullGraph.nodes.filter((node) => node.depth <= graphMaxDepth).map((node) => node.id))}>
              <ChevronDown className="h-4 w-4" /> Tout ouvrir
            </Button>
            <Button onClick={() => collapseToTop(getDefaultExpandedIds(fullGraph))}>
              <ChevronUp className="h-4 w-4" /> Réduire
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <CytoscapeGraph graph={visibleGraph} />
        <NodeDetailsPanel />
      </div>
    </div>
  );
}
