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
  const dividerColor = isCritical ? '#feb2b2' : '#e2e8f0';
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
          fontSize: 20,
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
          fontSize: 28,
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
            fontSize: 11,
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
  const valueStyle: React.CSSProperties = { fontWeight: 700, fontSize: 28, color: textColor };

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

      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${dividerColor}`, textAlign: 'center', fontWeight: 700, fontSize: 26, color: textColor }}>
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
          fontSize: 13,
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

function buildFlowElements(result: CpmResult): { nodes: Node[]; edges: Edge[] } {
  const COL_WIDTH = 330;
  const ROW_HEIGHT = 240;

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
    position: {
      x: (level.get(n.id) ?? 0) * COL_WIDTH + 40,
      y: (posY.get(n.id) ?? 0) + 40,
    },
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
    markerEnd: { type: MarkerType.ArrowClosed, color: e.isCritical ? '#e53e3e' : '#a0aec0' },
  }));

  return { nodes, edges };
}

export default function NetworkGraph({ result }: Props) {
  const [detailMode, setDetailMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const { nodes: baseNodes, edges: baseEdges } = useMemo(() => buildFlowElements(result), [result]);

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
      // result가 바뀌어 노드 구성이 달라진 경우엔 위치까지 완전 초기화
      if (!sameGraph) return enrichedNodes;
      // 아니면 data/style만 교체하고 위치는 현재 상태 유지
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

        {/* 범례 패널 (버튼 클릭 시 표시) */}
        {showLegend && (
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '16px 18px',
            zIndex: 20,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            width: 340,
            color: '#2d3748',
          }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>범례</div>

            {/* 원형 노드 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#718096', marginBottom: 10 }}>원형 노드</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative', flexShrink: 0, width: 64, height: 64, marginTop: 22 }}>
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, fontWeight: 700, fontSize: 15, color: '#1a202c', whiteSpace: 'nowrap' }}>3</div>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #a0aec0', background: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#1a202c' }}>A</div>
                </div>
                <div style={{ fontSize: 12, lineHeight: 2, color: '#4a5568' }}>
                  <div>↑ 원 위 숫자: <b>소요 기간</b></div>
                  <div>○ 원 안 문자: <b>작업명</b></div>
                </div>
              </div>
            </div>

            {/* 상세 노드 */}
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#718096', marginBottom: 10 }}>상세 노드 (클릭하여 확인)</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* 미니 노드 그림 */}
                <div style={{ flexShrink: 0 }}>
                  {/* 일반 노드 */}
                  <div style={{ border: '2px solid #cbd5e0', borderRadius: 6, background: '#f7fafc', width: 138, marginBottom: 6 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
                      {[['ES','0'],['DR','3'],['EF','3']].map(([lbl, val], i) => (
                        <div key={lbl} style={{ padding: '3px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : undefined }}>
                          <div style={{ fontSize: 8, color: '#718096' }}>{lbl}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '4px', textAlign: 'center', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #e2e8f0' }}>A</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      {[['LS','0'],['TF','0'],['LF','3']].map(([lbl, val], i) => (
                        <div key={lbl} style={{ padding: '3px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #e2e8f0' : undefined }}>
                          <div style={{ fontSize: 8, color: '#718096' }}>{lbl}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 임계 경로 노드 */}
                  <div style={{ border: '2px solid #e53e3e', borderRadius: 6, background: '#fff5f5', width: 138 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #feb2b2' }}>
                      {[['ES','0'],['DR','5'],['EF','5']].map(([lbl, val], i) => (
                        <div key={lbl} style={{ padding: '3px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #feb2b2' : undefined }}>
                          <div style={{ fontSize: 8, color: '#718096' }}>{lbl}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#c53030' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '4px', textAlign: 'center', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #feb2b2', color: '#c53030' }}>B</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                      {[['LS','0'],['TF','0'],['LF','5']].map(([lbl, val], i) => (
                        <div key={lbl} style={{ padding: '3px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #feb2b2' : undefined }}>
                          <div style={{ fontSize: 8, color: '#718096' }}>{lbl}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#c53030' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 항목 설명 */}
                <div style={{ fontSize: 11, lineHeight: 2, color: '#4a5568' }}>
                  <div><b>ES</b> 최조 시작일</div>
                  <div><b>DR</b> 소요 기간</div>
                  <div><b>EF</b> 최조 완료일</div>
                  <div><b>LS</b> 최지 시작일</div>
                  <div><b>TF</b> 여유 시간</div>
                  <div><b>LF</b> 최지 완료일</div>
                  <div style={{ marginTop: 6, color: '#e53e3e', fontWeight: 600 }}>빨간색: 임계 경로</div>
                </div>
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
            범례
          </button>
        </div>
      </div>
    </div>
  );
}
