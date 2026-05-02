// ─────────────────────────────────────────────
// CPM 레이아웃 커스텀 훅 (useCpmLayout)
//
// 역할:
//   - CPM 계산 결과를 ReactFlow 노드/엣지로 변환
//   - 계층(level) 기반 자동 배치 알고리즘으로 초기 위치 결정
//   - 원형 모드 ↔ 상세 모드 전환 시 위치를 비율로 보정
//     (노드 크기 차이만큼 간격을 스케일해 사용자가 옮긴 위치를 최대한 유지)
//   - 노드 개별 확장(isExpanded), 전체 상세 보기(detailMode) 상태를 노드 data에 반영
// ─────────────────────────────────────────────

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { Node, Edge, MarkerType, useNodesState, useEdgesState, NodeOrigin } from '@xyflow/react';
import { CpmResult } from '../cpm';
import { CpmNodeData } from './CpmNode';

// ReactFlow의 origin [0.5, 0.5]: position이 노드의 중심점을 가리킨다
const NODE_ORIGIN: NodeOrigin = [0.5, 0.5];

// 모드별 노드 간 간격 상수.
// 상세 모드는 박스 크기가 더 크므로 간격을 넓게 잡는다.
export const CIRCLE_COL = 330; // 원형 모드 열 간격 (px)
export const DETAIL_COL = 420; // 상세 모드 열 간격 (px)
export const CIRCLE_ROW = 240; // 원형 모드 행 간격 (px)
export const DETAIL_ROW = 300; // 상세 모드 행 간격 (px)

// ─── 레이아웃 계산 함수 ──────────────────────
// CPM 결과를 받아 ReactFlow 노드와 엣지 배열을 생성한다.
// detailLayout 플래그로 간격 상수를 달리 적용한다.
function buildFlowElements(result: CpmResult, detailLayout = false): { nodes: Node[]; edges: Edge[] } {
  const COL_WIDTH  = detailLayout ? DETAIL_COL : CIRCLE_COL;
  const ROW_HEIGHT = detailLayout ? DETAIL_ROW : CIRCLE_ROW;

  // 인접 리스트 구성: 각 노드의 후속 / 선행 노드 목록
  const successors   = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  result.nodes.forEach((n) => { successors.set(n.id, []); predecessors.set(n.id, []); });
  result.edges.forEach((e) => {
    successors.get(e.from)?.push(e.to);
    predecessors.get(e.to)?.push(e.from);
  });

  // 각 노드의 계층(level) 계산: BFS로 가장 먼 선행 경로 길이를 구함
  // level이 같은 노드는 같은 열(column)에 배치된다.
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

  // 같은 계층에 속한 노드들을 묶어서 행(row) 위치를 결정
  const levelGroups = new Map<number, string[]>();
  result.nodes.forEach((n) => {
    const lv = level.get(n.id) ?? 0;
    if (!levelGroups.has(lv)) levelGroups.set(lv, []);
    levelGroups.get(lv)!.push(n.id);
  });

  // Y 좌표 계산: 선행 노드들의 평균 Y에 가까운 순서로 정렬해 화살표 교차를 최소화
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
    // 노드 수가 적은 계층은 전체 높이 중앙에 오도록 offset 적용
    const offset = ((maxNodes - nodeIds.length) / 2) * ROW_HEIGHT;
    nodeIds.forEach((id, i) => posY.set(id, offset + i * ROW_HEIGHT));
  });

  // ReactFlow Node 객체 생성
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

  // ReactFlow Edge 객체 생성
  const edges: Edge[] = result.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: e.isCritical, // 임계 경로 엣지는 점선 애니메이션 적용
    style: { stroke: e.isCritical ? '#e53e3e' : '#a0aec0', strokeWidth: e.isCritical ? 2.5 : 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: e.isCritical ? '#e53e3e' : '#a0aec0', width: 18, height: 18 },
  }));

  return { nodes, edges };
}

// ─── 커스텀 훅 ───────────────────────────────
// NetworkGraph 컴포넌트에서 호출하여 노드/엣지 상태와 위치 관리 로직을 제공한다.
export function useCpmLayout(result: CpmResult, detailMode: boolean, expandedNodes: Set<string>) {
  // 원형 / 상세 두 가지 레이아웃을 미리 계산해 두고 모드에 따라 전환
  const { nodes: circleNodes, edges: circleEdges } = useMemo(() => buildFlowElements(result, false), [result]);
  const { nodes: detailNodes, edges: detailEdges } = useMemo(() => buildFlowElements(result, true),  [result]);
  const baseNodes = detailMode ? detailNodes : circleNodes;
  const baseEdges = detailMode ? detailEdges : circleEdges;

  // 현재 모드와 확장 상태를 노드 data/style에 반영
  const enrichedNodes = useMemo(() =>
    baseNodes.map(node => {
      const isExpanded = expandedNodes.has(node.id);
      const showDetail = detailMode || isExpanded;
      const isCritical = (node.data as CpmNodeData).isCritical;
      return {
        ...node,
        data: { ...node.data, isExpanded, detailMode },
        style: showDetail ? {
          // 상세 박스: 배경색·테두리·고정 너비 적용
          background: isCritical ? '#fff5f5' : '#f7fafc',
          border: `2px solid ${isCritical ? '#e53e3e' : '#cbd5e0'}`,
          borderRadius: 8, padding: 0, width: 260, overflow: 'visible',
        } : {
          // 원형: 투명 배경, 80×80 고정 크기
          background: 'transparent', border: 'none', borderRadius: 0,
          padding: 0, width: 80, height: 80, overflow: 'visible',
        },
      };
    }),
    [baseNodes, detailMode, expandedNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  // 이전 detailMode 값을 추적해 "모드가 바뀐 순간"을 감지
  const prevDetailModeRef = useRef(detailMode);

  useEffect(() => {
    const modeChanged = prevDetailModeRef.current !== detailMode;
    prevDetailModeRef.current = detailMode;

    setNodes(prev => {
      const prevMap   = new Map(prev.map(n => [n.id, n]));
      // 그래프 자체가 바뀐 경우(새 계산 결과): 레이아웃 초기 위치 그대로 사용
      const sameGraph = enrichedNodes.length === prev.length && enrichedNodes.every(n => prevMap.has(n.id));
      if (!sameGraph) return enrichedNodes;

      if (modeChanged) {
        // 모드 전환 시: 사용자가 드래그로 이동시킨 현재 위치를 유지하되,
        // 원형↔상세 노드의 크기 차이만큼 간격을 비율로 보정한다.
        // 중심점(centroid)을 기준으로 스케일하여 전체 배치가 자연스럽게 늘어나거나 줄어든다.
        const scaleX = detailMode ? DETAIL_COL / CIRCLE_COL : CIRCLE_COL / DETAIL_COL;
        const scaleY = detailMode ? DETAIL_ROW / CIRCLE_ROW : CIRCLE_ROW / DETAIL_ROW;
        const cx = prev.reduce((s, n) => s + n.position.x, 0) / prev.length;
        const cy = prev.reduce((s, n) => s + n.position.y, 0) / prev.length;
        return enrichedNodes.map(updated => {
          const cur = prevMap.get(updated.id);
          if (!cur) return updated;
          return {
            ...updated,
            position: {
              x: cx + (cur.position.x - cx) * scaleX,
              y: cy + (cur.position.y - cy) * scaleY,
            },
          };
        });
      }

      // 같은 모드에서 expand/collapse 등 data·style 변경: 위치는 그대로 유지
      return enrichedNodes.map(updated => ({
        ...updated,
        position: prevMap.get(updated.id)?.position ?? updated.position,
      }));
    });
  }, [enrichedNodes]);

  // 엣지는 그래프 구조가 바뀔 때만 교체 (위치 이동과 무관)
  useEffect(() => { setEdges(baseEdges); }, [baseEdges]);

  // 위치 초기화: 현재 enrichedNodes의 기본 위치로 되돌림
  const resetPositions = useCallback(() => setNodes(enrichedNodes), [enrichedNodes, setNodes]);

  return { nodes, setNodes, onNodesChange, edges, onEdgesChange, resetPositions };
}
