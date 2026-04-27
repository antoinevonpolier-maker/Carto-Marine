import cytoscape, { type Core, type ElementDefinition, type NodeSingular } from 'cytoscape';
import { Download, Maximize2, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { GraphData, GraphNode } from '../../types/data';
import { describeNode } from '../../utils/graph';
import { Button } from '../ui/Button';

interface CytoscapeGraphProps {
  graph: GraphData;
}

interface TooltipState {
  x: number;
  y: number;
  node: GraphNode;
}

function toElements(graph: GraphData): ElementDefinition[] {
  return [
    ...graph.nodes.map((node) => ({
      data: {
        id: node.id,
        label: node.label,
        level: node.level,
        count: node.count,
        depth: node.depth,
        color: node.colorKey,
        hasChildren: node.hasChildren,
        description: describeNode(node),
      },
      classes: node.item ? 'leaf' : 'branch',
    })),
    ...graph.edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label ?? '',
      },
    })),
  ];
}

export function CytoscapeGraph({ graph }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<'breadthfirst' | 'cose' | 'concentric'>('breadthfirst');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const setSelectedNode = useAppStore((state) => state.setSelectedNode);
  const selectedNode = useAppStore((state) => state.selectedNode);
  const setExpandedNodeIds = useAppStore((state) => state.setExpandedNodeIds);

  const graphNodesById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes],
  );

  const elements = useMemo(() => toElements(graph), [graph]);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      minZoom: 0.08,
      maxZoom: 4,
      wheelSensitivity: 0.16,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'background-color': 'data(color)',
            color: '#020617',
            'font-size': 12,
            'font-weight': 800,
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-wrap': 'wrap',
            'text-max-width': '128px',
            'text-outline-width': 3,
            'text-outline-color': '#ffffff',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.82,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'border-width': 3,
            'border-color': '#ffffff',
            width: 'mapData(count, 1, 80, 30, 82)',
            height: 'mapData(count, 1, 80, 30, 82)',
            'overlay-padding': 8,
          },
        },
        {
          selector: 'node[level="Centre"]',
          style: {
            width: '128px',
            height: '128px',
            color: '#020617',
            'font-size': 15,
            'text-max-width': '160px',
            'text-outline-width': 4,
          },
        },
        {
          selector: 'node[level="Segment cartographie"]',
          style: {
            width: '102px',
            height: '102px',
            'font-size': 14,
            'text-max-width': '150px',
          },
        },
        {
          selector: 'node.leaf',
          style: {
            shape: 'round-rectangle',
            width: '38px',
            height: '26px',
            'font-size': 10,
            'text-max-width': '115px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.65,
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 5,
            'border-color': '#f59e0b',
            'line-color': '#f59e0b',
            'target-arrow-color': '#f59e0b',
          },
        },
      ],
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().remove();
    cy.add(elements);
    runLayout();

    cy.off('tap');
    cy.off('mouseover');
    cy.off('mouseout');

    cy.on('tap', 'node', (event) => {
      const node = graphNodesById.get(event.target.id());
      if (!node) return;

      setSelectedNode(node);

      if (node.hasChildren) {
        // Accordion: expand this node exclusively, close all sibling branches
        const newIds = new Set<string>();
        newIds.add(node.id);
        let parentId = node.parentId;
        while (parentId) {
          newIds.add(parentId);
          parentId = graphNodesById.get(parentId)?.parentId;
        }
        setExpandedNodeIds([...newIds]);
      }

      focusNode(event.target.id(), node.hasChildren ? 150 : 120);
    });

    cy.on('mouseover', 'node', (event) => {
      const node = graphNodesById.get(event.target.id());
      if (!node) return;

      const originalEvent = event.originalEvent as MouseEvent;

      setTooltip({
        x: originalEvent.clientX + 12,
        y: originalEvent.clientY + 12,
        node,
      });
    });

    cy.on('mouseout', 'node', () => {
      setTooltip(null);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, graphNodesById, setSelectedNode, setExpandedNodeIds, layoutName]);

  useEffect(() => {
    if (!selectedNode) return;

    const timer = window.setTimeout(() => {
      focusNode(selectedNode.id, 130);
    }, 420);

    return () => {
      window.clearTimeout(timer);
    };
  }, [graph.nodes.length, selectedNode]);

  function runLayout() {
    const cy = cyRef.current;
    if (!cy) return;

    const common = {
      animate: true,
      animationDuration: 350,
      padding: 70,
    };

    const layoutOptions =
      layoutName === 'breadthfirst'
        ? {
            name: 'breadthfirst',
            directed: true,
            spacingFactor: 1.35,
            circle: false,
            ...common,
          }
        : layoutName === 'concentric'
          ? {
              name: 'concentric',
              concentric: (node: NodeSingular) => 10 - Number(node.data('depth')),
              levelWidth: () => 1,
              minNodeSpacing: 28,
              ...common,
            }
          : {
              name: 'cose',
              nodeRepulsion: 8200,
              idealEdgeLength: 105,
              gravity: 0.16,
              ...common,
            };

    cy.layout(layoutOptions as cytoscape.LayoutOptions).run();
  }

  function focusNode(nodeId: string, padding = 120) {
    const cy = cyRef.current;
    if (!cy) return;

    const node = cy.$id(nodeId);
    if (!node || node.empty()) return;

    const neighborhood = node.closedNeighborhood();

    cy.animate(
      {
        fit: {
          eles: neighborhood,
          padding,
        },
      },
      {
        duration: 450,
        easing: 'ease-in-out-cubic',
      },
    );

    node.select();
  }

  function fitGraph() {
    cyRef.current?.fit(undefined, 60);
  }

  function exportPng() {
    const cy = cyRef.current;
    if (!cy) return;

    const png = cy.png({
      output: 'blob',
      bg: 'white',
      full: true,
      scale: 2,
    } as any) as unknown as Blob;

    const url = URL.createObjectURL(png);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'cartographie-marche-naval.png';
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <select
          value={layoutName}
          onChange={(event) => setLayoutName(event.target.value as typeof layoutName)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="breadthfirst">Hiérarchique</option>
          <option value="concentric">Pieuvre concentrique</option>
          <option value="cose">Réseau force</option>
        </select>

        <Button onClick={runLayout} variant="secondary">
          <RefreshCw className="h-4 w-4" />
          Relancer
        </Button>

        <Button onClick={fitGraph} variant="secondary">
          <Maximize2 className="h-4 w-4" />
          Ajuster
        </Button>

        <Button onClick={exportPng} variant="secondary">
          <Download className="h-4 w-4" />
          PNG
        </Button>
      </div>

      <div
        ref={containerRef}
        className="h-[72vh] min-h-[560px] w-full bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc,_#eef2ff)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_30%),linear-gradient(180deg,_#0f172a,_#020617)]"
      />

      <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-xs font-medium text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-300">
        {graph.nodes.length} nœuds visibles · {graph.edges.length} liens · clic = détail + zoom automatique + expansion/réduction
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-soft dark:border-slate-700 dark:bg-slate-900"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <p className="font-bold text-slate-950 dark:text-white">
            {tooltip.node.label}
          </p>

          <p className="mt-1 text-slate-600 dark:text-slate-300">
            {describeNode(tooltip.node)}
          </p>

          {tooltip.node.hasChildren && (
            <p className="mt-2 font-semibold text-navy-700 dark:text-blue-300">
              Cliquez pour ouvrir / fermer et zoomer
            </p>
          )}
        </div>
      )}
    </div>
  );
}
