import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CpmResult } from '../cpm';
import { nodeTypes } from './CpmNode';
import { useCpmLayout } from './useCpmLayout';

interface Props {
  result: CpmResult;
}

export default function NetworkGraph({ result }: Props) {
  const [detailMode, setDetailMode] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const { nodes, setNodes, onNodesChange, edges, onEdgesChange, resetPositions } = useCpmLayout(result, detailMode, expandedNodes);

  useEffect(() => {
    setExpandedNodes(new Set());
  }, [result]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (detailMode) return;
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      return next;
    });
  }, [detailMode]);

  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, zIndex: 1000 } : n));
  }, [setNodes]);

  const handleNodeMouseLeave = useCallback((_: React.MouseEvent, node: Node) => {
    setNodes(nds => nds.map(n => n.id === node.id ? { ...n, zIndex: 0 } : n));
  }, [setNodes]);

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
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          onInit={setRfInstance}
          minZoom={0.1}
          fitView
        />

        {showLegend && (
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '18px 20px', zIndex: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            width: 360, color: '#2d3748',
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>도움말</div>

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

            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#718096', marginBottom: 12 }}>상세 노드 (클릭하여 확인)</div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
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
                <div style={{ fontSize: 12, lineHeight: 1.6, color: '#4a5568' }}>
                  {[
                    ['ES', 'Earliest Start',  '최초 착수 시간'],
                    ['EF', 'Earliest Finish', '최초 완료 시간'],
                    ['DR', 'Duration',        '작업 소요 시간'],
                    ['LS', 'Latest Start',    '최종 착수 가능 시간'],
                    ['LF', 'Latest Finish',   '최종 완료 가능 시간'],
                    ['TF', 'Total Float',     '총 여유 시간'],
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

      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #e2e8f0', background: '#f7fafc' }}>
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
            style={{ padding: '4px 12px', fontSize: 13, color: '#4a5568', background: '#fff', border: '1px solid #cbd5e0', borderRadius: 6, cursor: 'pointer' }}
          >
            중앙으로
          </button>
          <button
            onClick={resetPositions}
            style={{ padding: '4px 12px', fontSize: 13, color: '#4a5568', background: '#fff', border: '1px solid #cbd5e0', borderRadius: 6, cursor: 'pointer' }}
          >
            위치 초기화
          </button>
          <button
            onClick={() => setShowLegend(v => !v)}
            style={{ padding: '4px 12px', fontSize: 13, color: showLegend ? '#fff' : '#4a5568', background: showLegend ? '#4a90d9' : '#fff', border: `1px solid ${showLegend ? '#4a90d9' : '#cbd5e0'}`, borderRadius: 6, cursor: 'pointer' }}
          >
            도움말
          </button>
        </div>
      </div>
    </div>
  );
}
