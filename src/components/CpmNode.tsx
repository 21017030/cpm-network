// ─────────────────────────────────────────────
// CPM 노드 컴포넌트
//
// 하나의 작업 노드를 두 가지 모드로 렌더링한다.
//   - 원형 모드 (기본): 작업명과 소요 기간만 표시. 클릭하면 상세 모드로 전환.
//   - 상세 모드: ES/DR/EF / 작업명 / LS/TF/LF 6칸 박스로 표시.
//     전체 상세 보기(detailMode) 또는 개별 클릭(isExpanded)으로 활성화된다.
//
// 임계 경로 노드는 빨간색, 일반 노드는 파란색 계열로 강조된다.
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';

// ReactFlow 노드의 data 필드 타입.
// CPM 계산 결과값과 표시 모드 플래그를 함께 담는다.
export type CpmNodeData = {
  es: number;          // Earliest Start
  dr: number;          // Duration
  ef: number;          // Earliest Finish
  name: string;        // 작업명
  description: string; // 작업 설명 (상세 모드 호버 시 툴팁으로 표시)
  ls: number;          // Latest Start
  tf: number;          // Total Float
  lf: number;          // Latest Finish
  isCritical: boolean; // 임계 경로 여부
  isExpanded: boolean; // 개별 클릭으로 상세 모드가 된 경우
  detailMode: boolean; // 전체 상세 보기 모드가 켜진 경우
  [key: string]: unknown; // ReactFlow NodeData 인덱스 시그니처 요구 사항
};

export function CpmNodeComponent({ data }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const { es, dr, ef, name, description, ls, tf, lf, isCritical, isExpanded, detailMode } = data as CpmNodeData;

  // 둘 중 하나라도 true이면 상세 박스로 렌더링
  const showDetail   = detailMode || isExpanded;
  const dividerColor = isCritical ? '#f87171' : '#94a3b8';
  const textColor    = isCritical ? '#c53030' : '#1a202c';
  const borderColor  = isCritical ? '#e53e3e' : '#a0aec0';

  // ── 원형 노드 ──────────────────────────────
  if (!showDetail) {
    return (
      <div
        style={{ position: 'relative', width: '100%', height: '100%' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 소요 기간: 원 바깥 위쪽에 표시 */}
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

        {/* 원형 본체: 작업명 표시 */}
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
          <Handle type="target" position={Position.Left}  style={{ background: borderColor }} />
          <Handle type="source" position={Position.Right} style={{ background: borderColor }} />
          {name}
        </div>

        {/* 호버 시 안내 툴팁 */}
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

  // ── 상세 박스 노드 ──────────────────────────
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
      <Handle type="target" position={Position.Left}  style={{ background: isCritical ? '#e53e3e' : '#a0aec0' }} />
      <Handle type="source" position={Position.Right} style={{ background: isCritical ? '#e53e3e' : '#a0aec0' }} />

      {/* 상단 행: ES / DR / EF */}
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

      {/* 중간 행: 작업명 */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${dividerColor}`, textAlign: 'center', fontWeight: 700, fontSize: 32, color: textColor }}>
        {name}
      </div>

      {/* 하단 행: LS / TF / LF */}
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

      {/* 호버 시 작업 설명 툴팁 (description이 있을 때만 표시) */}
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
          {/* 말풍선 꼬리 삼각형 */}
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

// ReactFlow에 커스텀 노드 타입을 등록하는 맵
export const nodeTypes = { cpmNode: CpmNodeComponent };
