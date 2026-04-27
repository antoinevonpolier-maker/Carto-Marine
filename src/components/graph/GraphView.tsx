import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { WorkbookData } from '../../types/data';
import { filterInventory } from '../../utils/filters';
import { buildGraphData, getDefaultExpandedIds, getVisibleGraph } from '../../utils/graph';
import { FilterPanel } from '../filters/FilterPanel';
import { Button } from '../ui/Button';
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
  const setExpandedNodeIds = useAppStore((state) => state.setExpandedNodeIds);
  const expandAllVisible = useAppStore((state) => state.expandAllVisible);
  const collapseToTop = useAppStore((state) => state.collapseToTop);
  const triggerGraphFit = useAppStore((state) => state.triggerGraphFit);

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
        description="Le graphe suit l'ordre Centre → Segment → Horizon → Fonction → Catégorie → Type → Nom du bâtiment, avec les liens de cohérence métier et les filtres actifs."
      />
      <FilterPanel items={data.inventory} />
      <GraphLegend />
      <div className="flex justify-end gap-2">
        <Button onClick={() => expandAllVisible(fullGraph.nodes.map((node) => node.id))}>
          <ChevronDown className="h-4 w-4" /> Tout ouvrir
        </Button>
        <Button onClick={triggerGraphFit}>
          <Maximize2 className="h-4 w-4" /> Agrandir
        </Button>
        <Button onClick={() => collapseToTop(getDefaultExpandedIds(fullGraph))}>
          <ChevronUp className="h-4 w-4" /> Réduire
        </Button>
      </div>

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <CytoscapeGraph graph={visibleGraph} />
        <NodeDetailsPanel />
      </div>
    </div>
  );
}
