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
        style={{
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
          fontSize: 18,
          color: textColor,
          position: 'relative',
          boxSizing: 'border-box',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Handle type="target" position={Position.Left} style={{ background: borderColor }} />
        <Handle type="source" position={Position.Right} style={{ background: borderColor }} />
        {name}
        {hovered && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
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
  const valueStyle: React.CSSProperties = { fontWeight: 700, fontSize: 22, color: textColor };

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

      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${dividerColor}`, textAlign: 'center', fontWeight: 700, fontSize: 20, color: textColor }}>
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

  const nodes: Node[] = result.nodes.map((n) => ({
    id: n.id,
    type: 'cpmNode',
    position: { x: (level.get(n.id) ?? 0) * COL_WIDTH, y: posY.get(n.id) ?? 0 },
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
      background: n.isCritical ? '#fff5f5' : '#f7fafc',
      border: `2px solid ${n.isCritical ? '#e53e3e' : '#cbd5e0'}`,
      borderRadius: 8,
      padding: 0,
      width: 260,
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

  const [nodes, setNodes, onNodesChange] = useNodesState(enrichedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(baseEdges);

  useEffect(() => {
    setNodes(enrichedNodes);
  }, [enrichedNodes]);

  useEffect(() => {
    setEdges(baseEdges);
  }, [baseEdges]);

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
    <div style={{ borderRadius: 8, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 700 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
        />
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
      </div>
    </div>
  );
}
