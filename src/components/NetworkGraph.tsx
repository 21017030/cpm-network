import React, { useEffect } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CpmResult } from '../cpm';
import { Unit } from '../types';

interface Props {
  result: CpmResult;
  unit: Unit;
}

const unitLabel: Record<Unit, string> = { day: '일', week: '주' };

// CPM 계산 결과를 React Flow 노드/엣지로 변환
function buildFlowElements(result: CpmResult, unit: Unit): { nodes: Node[]; edges: Edge[] } {
  const COL_WIDTH = 250;
  const ROW_HEIGHT = 180;

  // 선행/후행 관계 맵 구성
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  result.nodes.forEach((n) => { successors.set(n.id, []); predecessors.set(n.id, []); });
  result.edges.forEach((e) => {
    successors.get(e.from)?.push(e.to);
    predecessors.get(e.to)?.push(e.from);
  });

  // 위상 정렬 기반 레벨 계산 (소스에서의 최장 경로)
  const level = new Map<string, number>();
  result.nodes.forEach((n) => level.set(n.id, 0));
  const inDegree = new Map<string, number>();
  result.nodes.forEach((n) => inDegree.set(n.id, (predecessors.get(n.id) || []).length));
  const queue = result.nodes.filter((n) => (predecessors.get(n.id) || []).length === 0).map((n) => n.id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const child of successors.get(id) || []) {
      level.set(child, Math.max(level.get(child) ?? 0, (level.get(id) ?? 0) + 1));
      inDegree.set(child, (inDegree.get(child) ?? 1) - 1);
      if (inDegree.get(child) === 0) queue.push(child);
    }
  }

  // 레벨별 노드 그룹화
  const levelGroups = new Map<number, string[]>();
  result.nodes.forEach((n) => {
    const lv = level.get(n.id) ?? 0;
    if (!levelGroups.has(lv)) levelGroups.set(lv, []);
    levelGroups.get(lv)!.push(n.id);
  });

  // 레벨 순서대로 처리: 부모 y좌표 평균(바리센터)으로 정렬 후 수직 중앙 정렬
  const posY = new Map<string, number>();
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

  const nodes: Node[] = result.nodes.map((n) => {
    const borderColor = n.isCritical ? '#e53e3e' : '#cbd5e0';
    const dividerColor = n.isCritical ? '#feb2b2' : '#e2e8f0';
    const cellStyle = (withRightBorder: boolean): React.CSSProperties => ({
      padding: '4px 6px',
      borderRight: withRightBorder ? `1px solid ${dividerColor}` : undefined,
      textAlign: 'center' as const,
    });
    const labelStyle: React.CSSProperties = { fontSize: 10, color: '#718096', marginBottom: 2 };
    const valueStyle: React.CSSProperties = { fontWeight: 700, fontSize: 13, color: n.isCritical ? '#e53e3e' : '#2d3748' };
    return {
      id: n.id,
      position: { x: (level.get(n.id) ?? 0) * COL_WIDTH, y: posY.get(n.id) ?? 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: n.isCritical ? '#fff5f5' : '#f7fafc',
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        padding: 0,
        width: 210,
        overflow: 'hidden',
      },
      data: {
        label: (
          <div style={{ fontSize: 12, width: '100%' }}>
            {/* 상단: ES | DR | EF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${dividerColor}` }}>
              <div style={cellStyle(true)}>
                <div style={labelStyle}>ES</div>
                <div style={valueStyle}>{n.es}</div>
              </div>
              <div style={cellStyle(true)}>
                <div style={labelStyle}>DR</div>
                <div style={valueStyle}>{n.duration}</div>
              </div>
              <div style={cellStyle(false)}>
                <div style={labelStyle}>EF</div>
                <div style={valueStyle}>{n.ef}</div>
              </div>
            </div>
            {/* 중단: 작업명 */}
            <div style={{ padding: '6px 10px', borderBottom: `1px solid ${dividerColor}`, textAlign: 'center', fontWeight: 700, fontSize: 13, color: n.isCritical ? '#e53e3e' : '#2d3748' }}>
              {n.name}
              {n.description && (
                <div style={{ fontWeight: 400, fontSize: 10, color: '#718096', marginTop: 2 }}>{n.description}</div>
              )}
            </div>
            {/* 하단: LS | TF | LF */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div style={cellStyle(true)}>
                <div style={labelStyle}>LS</div>
                <div style={valueStyle}>{n.ls}</div>
              </div>
              <div style={cellStyle(true)}>
                <div style={labelStyle}>TF</div>
                <div style={valueStyle}>{n.float}</div>
              </div>
              <div style={cellStyle(false)}>
                <div style={labelStyle}>LF</div>
                <div style={valueStyle}>{n.lf}</div>
              </div>
            </div>
          </div>
        ),
      },
    };
  });

  const edges: Edge[] = result.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: e.isCritical,
    style: { stroke: e.isCritical ? '#e53e3e' : '#a0aec0', strokeWidth: e.isCritical ? 2 : 1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: e.isCritical ? '#e53e3e' : '#a0aec0' },
  }));

  return { nodes, edges };
}

export default function NetworkGraph({ result, unit }: Props) {
  const { nodes: flowNodes, edges: flowEdges } = buildFlowElements(result, unit);
  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // 계산 결과가 바뀌면 그래프 갱신
  useEffect(() => {
    const { nodes: n, edges: e } = buildFlowElements(result, unit);
    setNodes(n);
    setEdges(e);
  }, [result, unit]);

  return (
    <div style={{ width: '100%', height: 480, borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      />
    </div>
  );
}
