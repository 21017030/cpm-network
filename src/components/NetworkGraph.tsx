import { useEffect } from 'react';
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

const unitLabel: Record<Unit, string> = { hour: '시간', day: '일', week: '주' };

// CPM 계산 결과를 React Flow 노드/엣지로 변환
function buildFlowElements(result: CpmResult, unit: Unit): { nodes: Node[]; edges: Edge[] } {
  const COL_WIDTH = 220;
  const ROW_HEIGHT = 160;

  // 노드를 레이어(열)별로 분류 — ES 기준
  const layerMap = new Map<string, number>();
  // ES 값을 기준으로 레이어 결정
  const esValues = [...new Set(result.nodes.map((n) => n.es))].sort((a, b) => a - b);
  result.nodes.forEach((n) => {
    layerMap.set(n.id, esValues.indexOf(n.es));
  });

  // 같은 레이어 내 노드를 행으로 배치
  const layerCount = new Map<number, number>();
  const nodes: Node[] = result.nodes.map((n) => {
    const col = layerMap.get(n.id)!;
    const row = layerCount.get(col) ?? 0;
    layerCount.set(col, row + 1);

    return {
      id: n.id,
      position: { x: col * COL_WIDTH, y: row * ROW_HEIGHT },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      style: {
        background: n.isCritical ? '#fff5f5' : '#f7fafc',
        border: `2px solid ${n.isCritical ? '#e53e3e' : '#cbd5e0'}`,
        borderRadius: 8,
        padding: 0,
        width: 180,
      },
      data: {
        label: (
          <div style={{ fontSize: 12, textAlign: 'left', padding: '8px 12px' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, color: n.isCritical ? '#e53e3e' : '#2d3748' }}>
              {n.name}
            </div>
            {n.description && (
              <div style={{ color: '#718096', marginBottom: 4 }}>{n.description}</div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, color: '#4a5568' }}>
              <span>ES: {n.es}</span>
              <span>EF: {n.ef}</span>
              <span>LS: {n.ls}</span>
              <span>LF: {n.lf}</span>
            </div>
            <div style={{ marginTop: 4, color: '#718096' }}>
              기간: {n.duration}{unitLabel[unit]} | 여유: {n.float}{unitLabel[unit]}
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
