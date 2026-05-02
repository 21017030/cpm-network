import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Position,
  MarkerType,
  Handle,
  NodeProps,
  NodeOrigin,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CpmResult } from '../cpm';

interface Props {
  result: CpmResult;
}

type CpmNodeData = {
  es: number;
  dr: number;
  ef: number;
  name: string;
  description: string;
  ls: number;
  tf: number;
  lf: number;
  isCritical: boolean;
  isExpanded: boolean;
  detailMode: boolean;
  [key: string]: unknown;
};

const NODE_ORIGIN: NodeOrigin = [0.5, 0.5];

function CpmNodeComponent({ data }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { es, dr, ef, name, description, ls, tf, lf, isCritical, isExpanded, detailMode } = data as CpmNodeData;

  const showDetail = detailMode || isExpanded;
  const dividerColor = isCritical ? '#f87171' : '#94a3b8';
  const textColor = isCritical ? '#c53030' : '#1a202c';
  const borderColor = isCritical ? '#e53e3e' : '#a0aec0';

  if (!showDetail) {
    return (
      <div
        style={{ position: 'relative', width: '100%', height: '100%' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 소요 기간 — 원 바깥 위쪽 */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 5px)',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 26,
          fontWeight: 600,
          color: textColor,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          {dr}
        </div>

        {/* 원형 노드 */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: isCritical ? '#fff5f5' : '#f7fafc',
          border: `2px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 34,
          color: textColor,
          boxSizing: 'border-box',
        }}>
          <Handle type="target" position={Position.Left} style={{ background: borderColor }} />
          <Handle type="source" position={Position.Right} style={{ background: borderColor }} />
          {name}
        </div>

        {hovered && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2d3748',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 21,
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
          }}>
            클릭하여 상세 정보 표시
          </div>
        )}
      </div>
    );
  }

  const cellStyle = (withRightBorder: boolean): React.CSSProperties => ({
    padding: '7px 10px',
    borderRight: withRightBorder ? `1px solid ${dividerColor}` : undefined,
    textAlign: 'center',
  });
  const labelStyle: React.CSSProperties = { fontSize: 10, color: '#718096', marginBottom: 2 };
  const valueStyle: React.CSSProperties = { fontWeight: 700, fontSize: 34, color: textColor };

  return (
    <div
      style={{ position: 'relative', width: '100%', cursor: detailMode ? 'default' : 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} style={{ background: isCritical ? '#e53e3e' : '#a0aec0' }} />
      <Handle type="source" position={Position.Right} style={{ background: isCritical ? '#e53e3e' : '#a0aec0' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${dividerColor}` }}>
        <div style={cellStyle(true)}>
          <div style={labelStyle}>ES</div>
          <div style={valueStyle}>{es}</div>
        </div>
        <div style={cellStyle(true)}>
          <div style={labelStyle}>DR</div>
          <div style={valueStyle}>{dr}</div>
        </div>
        <div style={cellStyle(false)}>
          <div style={labelStyle}>EF</div>
          <div style={valueStyle}>{ef}</div>
        </div>
      </div>

      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${dividerColor}`, textAlign: 'center', fontWeight: 700, fontSize: 32, color: textColor }}>
        {name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div style={cellStyle(true)}>
          <div style={labelStyle}>LS</div>
          <div style={valueStyle}>{ls}</div>
        </div>
        <div style={cellStyle(true)}>
          <div style={labelStyle}>TF</div>
          <div style={valueStyle}>{tf}</div>
        </div>
        <div style={cellStyle(false)}>
          <div style={labelStyle}>LF</div>
          <div style={valueStyle}>{lf}</div>
        </div>
      </div>

      {hovered && description && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#2d3748',
          color: '#fff',
          padding: '7px 12px',
          borderRadius: 6,
          fontSize: 23,
          whiteSpace: 'nowrap',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}>
          {description}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #2d3748',
          }} />
        </div>
      )}
    </div>
  );
}

const nodeTypes = { cpmNode: CpmNodeComponent };

function buildFlowElements(result: CpmResult, detailLayout = false): { nodes: Node[]; edges: Edge[] } {
  // 상세 모드에서는 260px 너비 노드가 서로 겹치지 않도록 간격을 넓힘
  const COL_WIDTH = detailLayout ? 420 : 330;
  const ROW_HEIGHT = detailLayout ? 300 : 240;

  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  result.nodes.forEach((n) => { successors.set(n.id, []); predecessors.set(n.id, []); });
  result.edges.forEach((e) => {
    successors.get(e.from)?.push(e.to);
    predecessors.get(e.to)?.push(e.from);
  });

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

  const levelGroups = new Map<number, string[]>();
  result.nodes.forEach((n) => {
    const lv = level.get(n.id) ?? 0;
    if (!levelGroups.has(lv)) levelGroups.set(lv, []);
    levelGroups.get(lv)!.push(n.id);
  });

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

  // position = center of the 80×80 circle (origin [0.5, 0.5] means position is the center)
  const nodes: Node[] = result.nodes.map((n) => ({
    id: n.id,
    type: 'cpmNode',
    origin: NODE_ORIGIN,
    position: { x: (level.get(n.id) ?? 0) * COL_WIDTH + 40, y: (posY.get(n.id) ?? 0) + 40 },
    data: {
      es: n.es,
      dr: n.duration,
      ef: n.ef,
      name: n.name,
      description: n.description ?? '',
      ls: n.ls,
      tf: n.float,
      lf: n.lf,
      isCritical: n.isCritical,
      isExpanded: false,
      detailMode: false,
    },
    style: {
      background: 'transparent',
      border: 'none',
      borderRadius: 0,
      padding: 0,
      width: 80,
      height: 80,
      overflow: 'visible',
    },
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

export default function NetworkGraph({ result }: Props) {
  const [detailMode, setDetailMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const { nodes: circleNodes, edges: circleEdges } = useMemo(() => buildFlowElements(result, false), [result]);
  const { nodes: detailNodes, edges: detailEdges } = useMemo(() => buildFlowElements(result, true), [result]);
  const baseNodes = detailMode ? detailNodes : circleNodes;
  const baseEdges = detailMode ? detailEdges : circleEdges;

  useEffect(() => {
    setExpandedNodes(new Set());
  }, [result]);

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
          borderRadius: 8,
          padding: 0,
          width: 260,
          overflow: 'visible',
        } : {
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
          width: 80,
          height: 80,
          overflow: 'visible',
        },
      };
    }),
    [baseNodes, detailMode, expandedNodes]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  useEffect(() => {
    setNodes(prev => {
      const prevMap = new Map(prev.map(n => [n.id, n]));
      const sameGraph =
        enrichedNodes.length === prev.length &&
        enrichedNodes.every(n => prevMap.has(n.id));
      // 새 그래프 생성 시에만 레이아웃 위치로 초기화, 그 외엔 현재 위치 공유
      if (!sameGraph) return enrichedNodes;
      return enrichedNodes.map(updated => ({
        ...updated,
        position: prevMap.get(updated.id)?.position ?? updated.position,
      }));
    });
  }, [enrichedNodes]);

  useEffect(() => {
    setEdges(baseEdges);
  }, [baseEdges]);

  const handleResetPositions = useCallback(() => {
    setNodes(enrichedNodes);
  }, [enrichedNodes, setNodes]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (detailMode) return;
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  }, [detailMode]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 650, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onInit={setRfInstance}
          minZoom={0.1}
          fitView
        />

        {/* 도움말 패널 (버튼 클릭 시 표시) */}
        {showLegend && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '18px 20px',
            zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            width: 360,
            color: '#2d3748',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>도움말</div>

            {/* 원형 노드 */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#718096', marginBottom: 12 }}>원형 노드</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ position: 'relative', flexShrink: 0, width: 70, height: 70, marginTop: 26 }}>
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 5, fontWeight: 700, fontSize: 15, color: '#718096', whiteSpace: 'nowrap' }}>소요 기간</div>
                  <div style={{ width: 70, height: 70, borderRadius: '50%', border: '2px solid #a0aec0', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#718096' }}>작업명</div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 2.2, color: '#4a5568' }}>
                  <div>↑ 원 위: <b>소요 기간</b></div>
                  <div>○ 원 안: <b>작업명</b></div>
                </div>
              </div>
            </div>

            {/* 상세 노드 */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#718096', marginBottom: 12 }}>상세 노드 (클릭하여 확인)</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* 미니 노드 그림 — 값 없이 항목명만 */}
                <div style={{ border: '2px solid #cbd5e0', borderRadius: 6, background: '#f7fafc', flexShrink: 0, width: 150 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
                    {['ES', 'DR', 'EF'].map((lbl, i) => (
                      <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : undefined }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#4a5568' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e2e8f0', color: '#718096' }}>작업명</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['LS', 'TF', 'LF'].map((lbl, i) => (
                      <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : undefined }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#4a5568' }}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 항목 설명 */}
                <div style={{ fontSize: 12, lineHeight: 1.6, color: '#4a5568' }}>
                  {[
                    ['ES', 'Earliest Start', '최초 착수 시간'],
                    ['EF', 'Earliest Finish', '최초 완료 시간'],
                    ['DR', 'Duration', '작업 소요 시간'],
                    ['LS', 'Latest Start', '최종 착수 가능 시간'],
                    ['LF', 'Latest Finish', '최종 완료 가능 시간'],
                    ['TF', 'Total Float', '총 여유 시간'],
                  ].map(([abbr, en, ko]) => (
                    <div key={abbr} style={{ marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{abbr}</span>
                      <span style={{ color: '#718096', fontSize: 11 }}> {en}</span>
                      <div style={{ paddingLeft: 4 }}>{ko}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12, fontSize: 13, color: '#e53e3e', fontWeight: 600 }}>
                🔴 빨간색 노드 / 선: 임계 경로
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderTop: '1px solid #e2e8f0',
        background: '#f7fafc',
      }}>
        <input
          type="checkbox"
          id="detail-mode"
          checked={detailMode}
          onChange={e => setDetailMode(e.target.checked)}
          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#4299e1' }}
        />
        <label htmlFor="detail-mode" style={{ cursor: 'pointer', fontSize: 14, color: '#4a5568', userSelect: 'none' }}>
          전체 상세 정보 표시
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => rfInstance?.fitView({ duration: 400 })}
            style={{
              padding: '4px 12px',
              fontSize: 13,
              color: '#4a5568',
              background: '#fff',
              border: '1px solid #cbd5e0',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            중앙으로
          </button>
          <button
            onClick={handleResetPositions}
            style={{
              padding: '4px 12px',
              fontSize: 13,
              color: '#4a5568',
              background: '#fff',
              border: '1px solid #cbd5e0',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            위치 초기화
          </button>
          <button
            onClick={() => setShowLegend(v => !v)}
            style={{
              padding: '4px 12px',
              fontSize: 13,
              color: showLegend ? '#fff' : '#4a5568',
              background: showLegend ? '#4a90d9' : '#fff',
              border: `1px solid ${showLegend ? '#4a90d9' : '#cbd5e0'}`,
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            도움말
          </button>
        </div>
      </div>
    </div>
  );
}
