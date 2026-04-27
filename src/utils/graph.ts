import { HIERARCHY_FIELDS } from '../constants/sheets';
import { HORIZON_COLORS, LEVEL_COLORS, SEGMENT_COLORS } from '../constants/palette';
import type { GraphData, GraphEdge, GraphNode, InventoryItem, RelationLink } from '../types/data';
import { displayValue } from './format';

const ROOT_ID = 'root:marche-naval-opportunites';
const SEP = ' > ';

type HierarchyKey = (typeof HIERARCHY_FIELDS)[number]['key'];

type NodeDraft = GraphNode & { itemIds: Set<string> };

function safePart(value: string): string {
  return value.replace(/\s+/g, ' ').trim() || 'Non renseigné';
}

function getHierarchyValue(item: InventoryItem, key: HierarchyKey): string {
  if (key === 'nomBatiment') {
    const label = item.libellePieuvre || [item.nomBatiment, item.codeCoque ? `(${item.codeCoque})` : ''].filter(Boolean).join(' ');
    return safePart(label || item.id);
  }
  return safePart(String(item[key] ?? ''));
}

function getColorKey(level: string, label: string): string {
  if (level === 'Segment cartographie') return SEGMENT_COLORS[label] ?? LEVEL_COLORS[level];
  if (level === 'Horizon programme') return HORIZON_COLORS[label] ?? LEVEL_COLORS[level];
  return LEVEL_COLORS[level] ?? '#334155';
}

function relationKey(parent: string, enfant: string): string {
  return `${parent.trim()} -> ${enfant.trim()}`;
}

export function buildRelationIndex(relations: RelationLink[]): Map<string, RelationLink> {
  return new Map(relations.map((relation) => [relationKey(relation.parent, relation.enfant), relation]));
}

export function buildGraphData(items: InventoryItem[], relations: RelationLink[]): GraphData {
  const nodes = new Map<string, NodeDraft>();
  const edges = new Map<string, GraphEdge>();
  const relationIndex = buildRelationIndex(relations);

  function upsertNode(node: Omit<GraphNode, 'count' | 'hasChildren'>, item: InventoryItem): NodeDraft {
    const existing = nodes.get(node.id);
    if (existing) {
      existing.itemIds.add(item.id);
      existing.count = existing.itemIds.size;
      if (!existing.item && node.item) existing.item = node.item;
      return existing;
    }

    const draft: NodeDraft = {
      ...node,
      count: 1,
      hasChildren: false,
      itemIds: new Set([item.id]),
    };
    nodes.set(node.id, draft);
    return draft;
  }

  for (const item of items) {
    let parentId = '';
    let parentLabel = '';
    const path: string[] = [];

    HIERARCHY_FIELDS.forEach((field, index) => {
      const label = getHierarchyValue(item, field.key);
      path.push(label);
      const level = field.label;
      const id = index === 0 ? ROOT_ID : `${level}:${path.join(SEP)}`;
      const relation = parentLabel ? relationIndex.get(relationKey(parentLabel, label)) : undefined;

      const node = upsertNode(
        {
          id,
          label,
          level,
          depth: index,
          path: [...path],
          colorKey: getColorKey(level, label),
          parentId: parentId || undefined,
          item: field.key === 'nomBatiment' ? item : undefined,
          relation,
        },
        item,
      );

      if (parentId) {
        const edgeId = `${parentId}-->${id}`;
        const parentNode = nodes.get(parentId);
        if (parentNode) parentNode.hasChildren = true;
        if (!edges.has(edgeId)) {
          edges.set(edgeId, {
            id: edgeId,
            source: parentId,
            target: id,
            count: relation?.nbBatiments ?? null,
            relation,
          });
        }
      }

      parentId = node.id;
      parentLabel = label;
    });
  }

  return {
    nodes: [...nodes.values()].map(({ itemIds, ...node }) => node),
    edges: [...edges.values()],
  };
}

export function getDefaultExpandedIds(graph: GraphData): string[] {
  return graph.nodes
    .filter((node) => node.depth <= 2)
    .map((node) => node.id);
}

export function getVisibleGraph(graph: GraphData, expandedIds: Set<string>, maxDepth: number): GraphData {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const visibleNodes = graph.nodes.filter((node) => {
    if (node.depth <= 1) return true;
    if (node.depth > maxDepth) return false;
    let currentParentId = node.parentId;
    while (currentParentId) {
      if (!expandedIds.has(currentParentId)) return false;
      currentParentId = nodesById.get(currentParentId)?.parentId;
    }
    return true;
  });
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = graph.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  return { nodes: visibleNodes, edges: visibleEdges };
}

export function describeNode(node: GraphNode): string {
  if (node.item) {
    return `${node.item.nomBatiment || node.label} — ${displayValue(node.item.typeBatiment)} / ${displayValue(node.item.horizonProgramme)}`;
  }
  return `${node.level} — ${node.count} bâtiment${node.count > 1 ? 's' : ''}`;
}
