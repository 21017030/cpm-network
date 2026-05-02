import React, { useState } from 'react';

interface Props {
  onBack: () => void;
}

type ExNode = {
  name: string;
  pred: string;
  es: number; dr: number; ef: number;
  ls: number; tf: number; lf: number;
  critical: boolean;
};

const NODES: ExNode[] = [
  { name: 'A', pred: '없음', es: 0, dr: 2, ef: 2, ls: 0, tf: 0, lf: 2, critical: true  },
  { name: 'B', pred: 'A',    es: 2, dr: 3, ef: 5, ls: 4, tf: 2, lf: 7, critical: false },
  { name: 'C', pred: 'A',    es: 2, dr: 5, ef: 7, ls: 2, tf: 0, lf: 7, critical: true  },
  { name: 'D', pred: 'B, C', es: 7, dr: 2, ef: 9, ls: 7, tf: 0, lf: 9, critical: true  },
];

function NodeSvg({ x, y, d }: { x: number; y: number; d: ExNode }) {
  const W = 150, H = 90, rowH = 30, col = 50;
  const stroke = d.critical ? '#e53e3e' : '#4a90d9';
  const tc     = d.critical ? '#c53030' : '#2d3748';
  const bg     = d.critical ? '#fff5f5' : '#ebf8ff';
  const div    = d.critical ? '#fc8181' : '#90cdf4';

  return (
    <g>
      <rect x={x} y={y} width={W} height={H} fill={bg} stroke={stroke} strokeWidth={2} rx={4} />
      <line x1={x}         y1={y + rowH}     x2={x + W}       y2={y + rowH}     stroke={div} strokeWidth={1} />
      <line x1={x}         y1={y + rowH * 2} x2={x + W}       y2={y + rowH * 2} stroke={div} strokeWidth={1} />
      <line x1={x + col}   y1={y}            x2={x + col}     y2={y + rowH}     stroke={div} strokeWidth={1} />
      <line x1={x + col*2} y1={y}            x2={x + col*2}   y2={y + rowH}     stroke={div} strokeWidth={1} />
      <line x1={x + col}   y1={y + rowH * 2} x2={x + col}     y2={y + H}        stroke={div} strokeWidth={1} />
      <line x1={x + col*2} y1={y + rowH * 2} x2={x + col*2}   y2={y + H}        stroke={div} strokeWidth={1} />

      <text x={x + 25}  y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">ES</text>
      <text x={x + 25}  y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.es}</text>
      <text x={x + 75}  y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">DR</text>
      <text x={x + 75}  y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.dr}</text>
      <text x={x + 125} y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">EF</text>
      <text x={x + 125} y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.ef}</text>

      <text x={x + 75} y={y + rowH + 20} textAnchor="middle" fontSize="16" fontWeight="bold" fill={tc}>{d.name}</text>

      <text x={x + 25}  y={y + rowH*2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">LS</text>
      <text x={x + 25}  y={y + rowH*2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.ls}</text>
      <text x={x + 75}  y={y + rowH*2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">TF</text>
      <text x={x + 75}  y={y + rowH*2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.tf}</text>
      <text x={x + 125} y={y + rowH*2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">LF</text>
      <text x={x + 125} y={y + rowH*2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.lf}</text>
    </g>
  );
}

const sec: React.CSSProperties  = { marginBottom: 52 };
const h2:  React.CSSProperties  = { fontSize: '1.3rem', fontWeight: 700, color: '#2d3748', marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #ebf4ff' };
const h3:  React.CSSProperties  = { fontSize: '1rem', fontWeight: 600, color: '#4a5568', marginTop: 20, marginBottom: 10 };
const p:   React.CSSProperties  = { color: '#4a5568', lineHeight: 1.85, marginBottom: 12, fontSize: '0.96rem' };
const fml: React.CSSProperties  = { background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 18px', fontFamily: 'monospace', fontSize: '0.93rem', color: '#2d3748', marginBottom: 10 };

const FIELD_DETAILS = [
  {
    abbr: 'ES', en: 'Earliest Start', color: '#4a90d9',
    summary: '최초 착수 가능 시점',
    detail: '이 작업을 가장 빨리 시작할 수 있는 시점입니다. 모든 선행 작업이 완료된 직후 즉시 착수할 수 있는 최초의 시점으로, 선행 작업들의 EF(최초 완료 시점) 중 가장 큰 값으로 결정됩니다. 선행 작업이 없는 시작 작업은 ES = 0입니다.',
    formula: null,
  },
  {
    abbr: 'DR', en: 'Duration', color: '#4a90d9',
    summary: '작업 소요 기간',
    detail: '해당 작업을 완료하는 데 필요한 기간입니다. 사용자가 직접 입력하는 유일한 값으로, ES·EF·LS·LF·TF 등 모든 시간 값의 계산 기반이 됩니다. 단위는 일(day) 또는 주(week)로 설정할 수 있습니다.',
    formula: null,
  },
  {
    abbr: 'EF', en: 'Earliest Finish', color: '#4a90d9',
    summary: '최초 완료 가능 시점',
    detail: '이 작업이 가장 빨리 완료될 수 있는 시점입니다. ES에 소요 기간(DR)을 더한 값으로 계산됩니다. EF는 후속 작업의 ES를 결정하는 데 사용되며, 전진 계산(Forward Pass)의 핵심 결과값입니다.',
    formula: 'EF = ES + DR',
  },
  {
    abbr: 'LS', en: 'Latest Start', color: '#718096',
    summary: '최종 착수 가능 시점',
    detail: '전체 프로젝트 일정을 지연시키지 않으면서 이 작업을 시작할 수 있는 가장 늦은 시점입니다. LF(최종 완료 시점)에서 소요 기간(DR)을 뺀 값으로 계산됩니다. 임계 작업은 LS = ES이며, 이보다 늦게 시작하면 전체 일정이 지연됩니다.',
    formula: 'LS = LF − DR',
  },
  {
    abbr: 'TF', en: 'Total Float', color: '#718096',
    summary: '총 여유 시간',
    detail: '전체 프로젝트 일정을 지연시키지 않고 이 작업을 늦출 수 있는 최대 시간입니다. TF = 0이면 임계 작업으로 분류되며, 조금이라도 지연되면 전체 프로젝트가 지연됩니다. TF가 클수록 일정 관리의 유연성이 높아지며, 비임계 작업의 자원을 임계 작업에 집중시키는 판단 기준이 됩니다.',
    formula: 'TF = LS − ES  (또는 LF − EF)',
  },
  {
    abbr: 'LF', en: 'Latest Finish', color: '#718096',
    summary: '최종 완료 가능 시점',
    detail: '전체 프로젝트 일정을 지연시키지 않으면서 이 작업이 완료되어야 하는 가장 늦은 시점입니다. 후진 계산(Backward Pass)에서 후속 작업들의 LS 중 가장 작은 값으로 결정됩니다. 종료 작업의 LF는 전체 프로젝트 기간과 같습니다.',
    formula: null,
  },
];

export default function CpmGuide({ onBack }: Props) {
  const [showFieldDetail, setShowFieldDetail] = useState(false);

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 920, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: '48px 52px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 44 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: '1px solid #cbd5e0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.9rem', color: '#4a5568', whiteSpace: 'nowrap' }}
          >
            ← 메인으로
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2d3748', margin: 0 }}>
              CPM <span style={{ color: '#4a90d9' }}>임계 경로법</span>
            </h1>
            <p style={{ color: '#718096', fontSize: '0.88rem', margin: '4px 0 0' }}>Critical Path Method</p>
          </div>
        </div>

        {/* ── Section 1: 개요 ── */}
        <section style={sec}>
          <h2 style={h2}>CPM이란?</h2>
          <p style={p}>
            <strong>CPM(임계 경로법, Critical Path Method)</strong>은 프로젝트를 구성하는 여러 작업들의
            선행 관계를 네트워크 다이어그램으로 표현하고, 전체 완료 시간을 결정하는
            <strong> 가장 긴 경로(임계 경로)</strong>를 찾아내는 프로젝트 일정 관리 기법입니다.
          </p>
          <p style={p}>
            1950년대 미국 듀폰(DuPont)사에서 처음 개발되었으며, 건설·소프트웨어 개발·제조업 등
            다양한 분야의 복잡한 프로젝트 관리에 폭넓게 활용됩니다.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
            {[
              { icon: '📋', title: '전체 일정 파악',   desc: '프로젝트 최단 완료 기간을 정확히 계산합니다.' },
              { icon: '🔴', title: '임계 경로 식별',   desc: '지연 시 전체 일정에 영향을 주는 핵심 작업을 파악합니다.' },
              { icon: '⏱️', title: '여유 시간 관리',   desc: '각 작업의 여유 시간을 계산해 자원을 최적으로 배분합니다.' },
            ].map(c => (
              <div key={c.title} style={{ flex: '1 1 180px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2d3748', marginBottom: 5 }}>{c.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#718096', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: 노드 구조 ── */}
        <section style={sec}>
          <h2 style={h2}>네트워크 노드 구조</h2>
          <p style={p}>각 작업은 6칸 구조의 박스로 표현됩니다. 임계 경로 위의 작업은 빨간색으로 강조됩니다.</p>

          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 24 }}>
            {/* 노드 그림 */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ border: '2px solid #4a90d9', borderRadius: 8, background: '#ebf8ff', width: 240, overflow: 'hidden', boxShadow: '0 2px 10px rgba(74,144,217,.18)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #90cdf4' }}>
                  {(['ES','DR','EF'] as const).map((lbl, i) => (
                    <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #90cdf4' : undefined }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>{['0','5','5'][i]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #90cdf4', fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>작업명</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  {(['LS','TF','LF'] as const).map((lbl, i) => (
                    <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #90cdf4' : undefined }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>{['0','0','5'][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 항목 설명 테이블 */}
            <div style={{ flex: 1, minWidth: 420 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 55 }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: '62%' }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#4a90d9', color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '8px 0 0 0' }}>기호</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>영문 명칭</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '0 8px 0 0' }}>의미</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['ES','Earliest Start',  '최초 착수 가능 시점'],
                    ['DR','Duration',        '작업 소요 기간'],
                    ['EF','Earliest Finish', '최초 완료 가능 시점'],
                    ['LS','Latest Start',    '최종 착수 가능 시점 (지연 없는 한도)'],
                    ['TF','Total Float',     '총 여유 시간 (지연 가능한 최대 시간)'],
                    ['LF','Latest Finish',   '최종 완료 가능 시점 (지연 없는 한도)'],
                  ].map(([abbr, en, ko], i) => (
                    <tr key={abbr} style={{ borderBottom: '1px solid #e2e8f0', background: i%2===0?'#fff':'#f7fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#4a90d9' }}>{abbr}</td>
                      <td style={{ padding: '10px 14px', color: '#718096', fontSize: '0.84rem' }}>{en}</td>
                      <td style={{ padding: '10px 14px', color: '#2d3748' }}>{ko}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 상세 설명 토글 */}
              <button
                onClick={() => setShowFieldDetail(v => !v)}
                style={{
                  marginTop: 12,
                  width: '100%',
                  background: showFieldDetail ? '#ebf8ff' : '#f7fafc',
                  border: `1px solid ${showFieldDetail ? '#90cdf4' : '#e2e8f0'}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  color: '#4a5568',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                }}
              >
                <span>각 항목 상세 설명</span>
                <span style={{ fontSize: '0.75rem', color: '#718096' }}>{showFieldDetail ? '▲ 접기' : '▼ 펼치기'}</span>
              </button>

              {showFieldDetail && (
                <div style={{ marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  {FIELD_DETAILS.map((f, i) => (
                    <div
                      key={f.abbr}
                      style={{
                        padding: '16px 18px',
                        borderBottom: i < FIELD_DETAILS.length - 1 ? '1px solid #e2e8f0' : undefined,
                        background: i % 2 === 0 ? '#fff' : '#f9fafb',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#4a90d9', minWidth: 28 }}>{f.abbr}</span>
                        <span style={{ fontSize: '0.82rem', color: '#718096' }}>{f.en}</span>
                        <span style={{ fontSize: '0.85rem', color: '#4a5568', fontWeight: 600 }}>— {f.summary}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#4a5568', lineHeight: 1.8, paddingLeft: 38 }}>
                        {f.detail}
                      </p>
                      {f.formula && (
                        <div style={{ marginTop: 8, marginLeft: 38, display: 'inline-block', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 6, padding: '4px 12px', fontFamily: 'monospace', fontSize: '0.88rem', color: '#2b6cb0' }}>
                          {f.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 3: 계산 절차 ── */}
        <section style={sec}>
          <h2 style={h2}>계산 절차</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div style={{ background: '#ebf8ff', borderRadius: 10, padding: 22, border: '1px solid #bee3f8' }}>
              <h3 style={{ ...h3, marginTop: 0, color: '#2b6cb0' }}>① 전진 계산 (Forward Pass)</h3>
              <p style={{ ...p, fontSize: '0.88rem' }}>
                프로젝트 시작(ES = 0)부터 끝을 향해 진행하며 각 작업의 <strong>가장 빠른 시작·완료 시점</strong>을 계산합니다.
              </p>
              <div style={{ ...fml, background: '#fff', border: '1px solid #bee3f8', fontSize: '0.88rem' }}>
                <div style={{ marginBottom: 5 }}>EF = ES + DR</div>
                <div>후속 작업의 ES = max(선행 작업들의 EF)</div>
              </div>
            </div>

            <div style={{ background: '#fff5f5', borderRadius: 10, padding: 22, border: '1px solid #fed7d7' }}>
              <h3 style={{ ...h3, marginTop: 0, color: '#c53030' }}>② 후진 계산 (Backward Pass)</h3>
              <p style={{ ...p, fontSize: '0.88rem' }}>
                프로젝트 끝(LF = 전체 기간)에서 시작 방향으로 역산하며 <strong>가장 늦은 착수·완료 시점</strong>을 계산합니다.
              </p>
              <div style={{ ...fml, background: '#fff', border: '1px solid #fed7d7', fontSize: '0.88rem' }}>
                <div style={{ marginBottom: 5 }}>LS = LF − DR</div>
                <div>선행 작업의 LF = min(후속 작업들의 LS)</div>
              </div>
            </div>
          </div>

          <div style={{ background: '#f7fafc', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ ...h3, marginTop: 0 }}>③ 여유 시간 계산 (Total Float)</h3>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ ...fml, margin: 0, fontSize: '1rem' }}>TF = LS − ES &nbsp;(또는 LF − EF)</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.9 }}>
                <div>• TF = 0 &nbsp;→ <strong style={{ color: '#e53e3e' }}>임계 작업</strong> (절대 지연 불가)</div>
                <div>• TF &gt; 0 &nbsp;→ 비임계 작업 (TF 이내 지연 허용)</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: 계산 예시 ── */}
        <section style={sec}>
          <h2 style={h2}>계산 예시</h2>
          <p style={p}>4개의 작업으로 구성된 간단한 프로젝트를 통해 CPM 계산 과정을 살펴봅니다.</p>

          {/* 입력 테이블 */}
          <h3 style={h3}>입력 데이터</h3>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 32 }}>
            <thead>
              <tr style={{ background: '#4a90d9', color: '#fff' }}>
                {['작업','선행 작업','소요 기간(DR)','내용'].map((h,i) => (
                  <th key={h} style={{ padding: '9px 20px', textAlign: 'center', borderRadius: i===0?'8px 0 0 0':i===3?'0 8px 0 0':undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['A','없음','2','프로젝트 준비'],
                ['B','A',   '3','병렬 작업 1'],
                ['C','A',   '5','병렬 작업 2 (기간 더 김)'],
                ['D','B, C','2','최종 마무리'],
              ].map(([name,pred,dr,desc],i) => (
                <tr key={name} style={{ borderBottom: '1px solid #e2e8f0', background: i%2===0?'#fff':'#f7fafc' }}>
                  <td style={{ padding: '9px 20px', textAlign: 'center', fontWeight: 700 }}>{name}</td>
                  <td style={{ padding: '9px 20px', textAlign: 'center', color: '#718096' }}>{pred}</td>
                  <td style={{ padding: '9px 20px', textAlign: 'center' }}>{dr}</td>
                  <td style={{ padding: '9px 20px', color: '#4a5568' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* SVG 네트워크 */}
          <h3 style={h3}>네트워크 다이어그램 (계산 결과)</h3>
          <div style={{ background: '#f7fafc', borderRadius: 10, padding: '16px 8px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
            <svg viewBox="0 0 760 390" width="100%" style={{ display: 'block' }}>
              <defs>
                <marker id="g-arr-red"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e53e3e"/>
                </marker>
                <marker id="g-arr-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#4a90d9"/>
                </marker>
              </defs>

              {/* 엣지 */}
              <line x1="180" y1="190" x2="304" y2="78"  stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)"/>
              <line x1="180" y1="190" x2="304" y2="302" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)"/>
              <line x1="456" y1="78"  x2="579" y2="190" stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)"/>
              <line x1="456" y1="302" x2="579" y2="190" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)"/>

              {/* 노드 — A(30,145) B(305,33) C(305,257) D(580,145) */}
              <NodeSvg x={30}  y={145} d={NODES[0]} />
              <NodeSvg x={305} y={33}  d={NODES[1]} />
              <NodeSvg x={305} y={257} d={NODES[2]} />
              <NodeSvg x={580} y={145} d={NODES[3]} />

              {/* 범례 */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="210" height="62" fill="#fff" stroke="#e2e8f0" rx="7" opacity="0.95"/>
                <line x1="12" y1="22" x2="44" y2="22" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)"/>
                <text x="52" y="27" fontSize="12" fill="#2d3748" fontFamily="'Segoe UI', sans-serif">임계 경로 (TF = 0)</text>
                <line x1="12" y1="44" x2="44" y2="44" stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)"/>
                <text x="52" y="49" fontSize="12" fill="#2d3748" fontFamily="'Segoe UI', sans-serif">일반 경로 (TF &gt; 0)</text>
              </g>
            </svg>
          </div>

          {/* 계산 결과 테이블 */}
          <h3 style={h3}>계산 결과</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 14 }}>
            <thead>
              <tr style={{ background: '#4a90d9', color: '#fff' }}>
                {['작업','선행','DR','ES','EF','LS','LF','TF','임계 경로'].map((h,i,arr) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'center', borderRadius: i===0?'8px 0 0 0':i===arr.length-1?'0 8px 0 0':undefined }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NODES.map((n, i) => (
                <tr key={n.name} style={{ borderBottom: '1px solid #e2e8f0', background: n.critical ? '#fff5f5' : i%2===0?'#fff':'#f7fafc' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: n.critical?'#e53e3e':'#2d3748' }}>{n.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#718096' }}>{n.pred}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.dr}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.es}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.ef}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.ls}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.lf}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: n.tf===0?700:400, color: n.tf===0?'#e53e3e':'#2d3748' }}>{n.tf}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#e53e3e', fontWeight: 700 }}>{n.critical?'✓':''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ padding: '12px 18px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, fontSize: '0.92rem', color: '#c53030' }}>
            🔴 <strong>임계 경로: A → C → D</strong> &nbsp;|&nbsp; 전체 프로젝트 기간: <strong>9</strong>
          </div>

          {/* 계산 과정 설명 */}
          <h3 style={{ ...h3, marginTop: 28 }}>단계별 계산 과정</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#ebf8ff', borderRadius: 10, padding: 18, border: '1px solid #bee3f8', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.9 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 10 }}>① 전진 계산</div>
              <div>A: ES=0, EF = 0+2 = <strong>2</strong></div>
              <div>B: ES = EF(A) = 2, EF = 2+3 = <strong>5</strong></div>
              <div>C: ES = EF(A) = 2, EF = 2+5 = <strong>7</strong></div>
              <div>D: ES = max(EF(B), EF(C)) = max(5,7) = <strong>7</strong></div>
              <div style={{ marginTop: 6 }}>EF(D) = 7+2 = <strong>9</strong> → 전체 기간</div>
            </div>
            <div style={{ background: '#fff5f5', borderRadius: 10, padding: 18, border: '1px solid #fed7d7', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.9 }}>
              <div style={{ fontWeight: 700, color: '#c53030', marginBottom: 10 }}>② 후진 계산</div>
              <div>D: LF=9, LS = 9−2 = <strong>7</strong></div>
              <div>B: LF = LS(D) = 7, LS = 7−3 = <strong>4</strong></div>
              <div>C: LF = LS(D) = 7, LS = 7−5 = <strong>2</strong></div>
              <div>A: LF = min(LS(B), LS(C)) = min(4,2) = <strong>2</strong></div>
              <div style={{ marginTop: 6 }}>LS(A) = 2−2 = <strong>0</strong></div>
            </div>
          </div>
        </section>

        {/* ── Section 5: 임계 경로의 의미 ── */}
        <section style={{ ...sec, marginBottom: 0 }}>
          <h2 style={h2}>임계 경로의 의미와 활용</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { bg: '#fff5f5', border: '#fed7d7', title: '⚠️ 임계 작업이 지연되면',          desc: 'TF = 0인 임계 경로 위의 작업이 하루 지연되면 전체 프로젝트도 하루 지연됩니다. 절대 지연을 허용할 수 없는 작업입니다.' },
              { bg: '#f0fff4', border: '#c6f6d5', title: '✅ 비임계 작업은 유연하게 관리',   desc: '여유 시간(TF) 이내의 지연은 전체 일정에 영향을 주지 않으므로, 이 작업의 자원을 임계 경로 작업에 집중 투입할 수 있습니다.' },
              { bg: '#ebf8ff', border: '#bee3f8', title: '🎯 프로젝트 단축 방법',             desc: '전체 일정을 단축하려면 반드시 임계 경로 위의 작업 기간을 줄여야 합니다. 비임계 작업을 단축해도 전체 기간은 변하지 않습니다.' },
              { bg: '#faf5ff', border: '#e9d8fd', title: '🔄 임계 경로는 바뀔 수 있음',     desc: '작업 기간 변경이나 지연이 발생하면 임계 경로가 다른 경로로 이동할 수 있습니다. 프로젝트 진행 중에도 지속적인 모니터링이 필요합니다.' },
            ].map(c => (
              <div key={c.title} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#2d3748', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: '0.87rem', color: '#4a5568', lineHeight: 1.75 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
