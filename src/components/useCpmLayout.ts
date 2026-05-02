import { useMemo, useEffect, useRef, useCallback } from 'react';
import { Node, Edge, MarkerType, useNodesState, useEdgesState, NodeOrigin } from '@xyflow/react';
import { CpmResult } from '../cpm';
import { CpmNodeData } from './CpmNode';

const NODE_ORIGIN: NodeOrigin = [0.5, 0.5];

export const CIRCLE_COL = 330;
export const DETAIL_COL  = 420;
export const CIRCLE_ROW  = 240;
export const DETAIL_ROW  = 300;

function buildFlowElements(result: CpmResult, detailLayout = false): { nodes: Node[]; edges: Edge[] } {
  const COL_WIDTH  = detailLayout ? DETAIL_COL : CIRCLE_COL;
  const ROW_HEIGHT = detailLayout ? DETAIL_ROW : CIRCLE_ROW;

  const successors   = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  result.nodes.forEach((n) => { successors.set(n.id, []); predecessors.set(n.id, []); });
  result.edges.forEach((e) => {
    successors.get(e.from)?.push(e.to);
    predecessors.get(e.to)?.push(e.from);
  });

  const level    = new Map<string, number>();
  const inDegree = new Map<string, number>();
  result.nodes.forEach((n) => { level.set(n.id, 0); inDegree.set(n.id, (predecessors.get(n.id) || []).length); });
  const queue = result.nodes.filter((n) => (predecessors.get(n.id) || []).length === 0).map((n) => n.id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const child of successors.get(id) || []) {
      level.set(child, Math.max(level.get(child) ?? 0, (level.get(id) ?? 0) + 1));
      inDegree.set(child, (inDegree.get(child) ?? 1) - 1);
      if (inDegree.get(child) === 0) queue.push(child);
    }
  }

  const levelGroups = new Map<number, string[]>();
  result.nodes.forEach((n) => {
    const lv = level.get(n.id) ?? 0;
    if (!levelGroups.has(lv)) levelGroups.set(lv, []);
    levelGroups.get(lv)!.push(n.id);
  });

  const posY     = new Map<string, number>();
  const maxNodes = Math.max(...[...levelGroups.values()].map((g) => g.length));
  const sortedLevels = [...levelGroups.keys()].sort((a, b) => a - b);
  sortedLevels.forEach((lv) => {
    const nodeIds = levelGroups.get(lv)!;
    if (lv > 0) {
      nodeIds.sort((a, b) => {
        const avgY = (id: string) => {
          const preds = predecessors.get(id) || [];
          if (preds.length === 0) return 0;
          return preds.reduce((sum, pid) => sum + (posY.get(pid) ?? 0), 0) / preds.length;
        };
        return avgY(a) - avgY(b);
      });
    }
    const offset = ((maxNodes - nodeIds.length) / 2) * ROW_HEIGHT;
    nodeIds.forEach((id, i) => posY.set(id, offset + i * ROW_HEIGHT));
  });

  const nodes: Node[] = result.nodes.map((n) => ({
    id: n.id,
    type: 'cpmNode',
    origin: NODE_ORIGIN,
    position: { x: (level.get(n.id) ?? 0) * COL_WIDTH + 40, y: (posY.get(n.id) ?? 0) + 40 },
    data: {
      es: n.es, dr: n.duration, ef: n.ef,
      name: n.name, description: n.description ?? '',
      ls: n.ls, tf: n.float, lf: n.lf,
      isCritical: n.isCritical,
      isExpanded: false, detailMode: false,
    },
    style: { background: 'transparent', border: 'none', borderRadius: 0, padding: 0, width: 80, height: 80, overflow: 'visible' },
  }));

  const edges: Edge[] = result.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: e.isCritical,
    style: { stroke: e.isCritical ? '#e53e3e' : '#a0aec0', strokeWidth: e.isCritical ? 2.5 : 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: e.isCritical ? '#e53e3e' : '#a0aec0', width: 18, height: 18 },
  }));

  return { nodes, edges };
}

export function useCpmLayout(result: CpmResult, detailMode: boolean, expandedNodes: Set<string>) {
  const { nodes: circleNodes, edges: circleEdges } = useMemo(() => buildFlowElements(result, false), [result]);
  const { nodes: detailNodes, edges: detailEdges } = useMemo(() => buildFlowElements(result, true),  [result]);
  const baseNodes = detailMode ? detailNodes : circleNodes;
  const baseEdges = detailMode ? detailEdges : circleEdges;

  const enrichedNodes = useMemo(() =>
    baseNodes.map(node => {
      const isExpanded = expandedNodes.has(node.id);
      const showDetail = detailMode || isExpanded;
      const isCritical = (node.data as CpmNodeData).isCritical;
      return {
        ...node,
        data: { ...node.data, isExpanded, detailMode },
        style: showDetail ? {
          background: isCritical ? '#fff5f5' : '#f7fafc',
          border: `2px solid ${isCritical ? '#e53e3e' : '#cbd5e0'}`,
          borderRadius: 8, padding: 0, width: 260, overflow: 'visible',
        } : {
          background: 'transparent', border: 'none', borderRadius: 0,
          padding: 0, width: 80, height: 80, overflow: 'visible',
        },
      };
    }),
    [baseNodes, detailMode, expandedNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  const prevDetailModeRef = useRef(detailMode);

  useEffect(() => {
    const modeChanged = prevDetailModeRef.current !== detailMode;
    prevDetailModeRef.current = detailMode;

    setNodes(prev => {
      const prevMap   = new Map(prev.map(n => [n.id, n]));
      const sameGraph = enrichedNodes.length === prev.length && enrichedNodes.every(n => prevMap.has(n.id));

      if (!sameGraph) return enrichedNodes;

      if (modeChanged) {
        const scaleX = detailMode ? DETAIL_COL / CIRCLE_COL : CIRCLE_COL / DETAIL_COL;
        const scaleY = detailMode ? DETAIL_ROW / CIRCLE_ROW : CIRCLE_ROW / DETAIL_ROW;
        const cx = prev.reduce((s, n) => s + n.position.x, 0) / prev.length;
        const cy = prev.reduce((s, n) => s + n.position.y, 0) / prev.length;
        return enrichedNodes.map(updated => {
          const cur = prevMap.get(updated.id);
          if (!cur) return updated;
          return { ...updated, position: { x: cx + (cur.position.x - cx) * scaleX, y: cy + (cur.position.y - cy) * scaleY } };
        });
      }

      return enrichedNodes.map(updated => ({
        ...updated,
        position: prevMap.get(updated.id)?.position ?? updated.position,
      }));
    });
  }, [enrichedNodes]);

  useEffect(() => { setEdges(baseEdges); }, [baseEdges]);

  const resetPositions = useCallback(() => setNodes(enrichedNodes), [enrichedNodes, setNodes]);

  return { nodes, setNodes, onNodesChange, edges, onEdgesChange, resetPositions };
}
