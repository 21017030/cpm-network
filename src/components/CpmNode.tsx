import React, { useState } from 'react';
import { NodeProps, Position, Handle } from '@xyflow/react';

export type CpmNodeData = {
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

export function CpmNodeComponent({ data }: NodeProps) {
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

export const nodeTypes = { cpmNode: CpmNodeComponent };
