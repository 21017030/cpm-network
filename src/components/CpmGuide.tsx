// ─────────────────────────────────────────────
// CPM 개념 가이드 페이지 컴포넌트
//
// "CPM이란?" 링크를 클릭하면 표시되는 전체 화면 안내 페이지.
// 라우터 없이 App.tsx의 showGuide 상태로 전환되며,
// onBack 콜백으로 메인 페이지로 돌아간다.
//
// 구성 섹션:
//   1. CPM이란? — 개념 소개 + 3가지 핵심 활용
//   2. 네트워크 노드 구조 — 6칸 박스 설명 + 항목별 상세 아코디언
//   3. 계산 절차 — 전진/후진/여유시간 계산 방법
//   4. 계산 예시 — 4개 작업 예제의 입력·다이어그램·결과·단계별 풀이
//   5. 임계 경로의 의미와 활용
// ─────────────────────────────────────────────

import React, { useState } from 'react';

interface Props {
  onBack: () => void; // 메인 페이지로 돌아가는 콜백
}

// 예시 다이어그램에 사용할 노드 1개의 데이터 구조
type ExNode = {
  name: string;
  pred: string;   // 선행 작업 표시용 문자열 (예: "B, C")
  es: number;
  dr: number;
  ef: number;
  ls: number;
  tf: number;
  lf: number;
  critical: boolean;
};

// 계산 예시 섹션에 사용할 4개 작업 데이터.
// A→B, A→C, B+C→D 구조이며 임계 경로는 A→C→D (기간=9)
const NODES: ExNode[] = [
  { name: 'A', pred: '없음', es: 0, dr: 2, ef: 2, ls: 0, tf: 0, lf: 2, critical: true },
  { name: 'B', pred: 'A',    es: 2, dr: 3, ef: 5, ls: 4, tf: 2, lf: 7, critical: false },
  { name: 'C', pred: 'A',    es: 2, dr: 5, ef: 7, ls: 2, tf: 0, lf: 7, critical: true },
  { name: 'D', pred: 'B, C', es: 7, dr: 2, ef: 9, ls: 7, tf: 0, lf: 9, critical: true },
];

// ─── SVG 노드 렌더러 ─────────────────────────
// 가이드 페이지 SVG 다이어그램 안에서 CPM 노드 박스를 그린다.
// ReactFlow 컴포넌트와 달리 순수 SVG <g> 요소로 구성되며,
// x, y는 박스 좌상단 좌표, d는 노드 데이터.
// 노드 크기: W=150, H=90 / 3행(rowH=30): ES·DR·EF / 작업명 / LS·TF·LF
function NodeSvg({ x, y, d }: { x: number; y: number; d: ExNode }) {
  const W = 150, H = 90, rowH = 30, col = 50;
  const stroke = d.critical ? '#e53e3e' : '#4a90d9';
  const tc     = d.critical ? '#c53030' : '#2d3748';
  const bg     = d.critical ? '#fff5f5' : '#ebf8ff';
  const div    = d.critical ? '#fc8181' : '#90cdf4'; // 내부 구분선 색

  return (
    <g>
      {/* 박스 외곽 */}
      <rect x={x} y={y} width={W} height={H} fill={bg} stroke={stroke} strokeWidth={2} rx={4} />

      {/* 가로 구분선: 1행/2행 경계, 2행/3행 경계 */}
      <line x1={x}     y1={y + rowH}     x2={x + W} y2={y + rowH}     stroke={div} />
      <line x1={x}     y1={y + rowH * 2} x2={x + W} y2={y + rowH * 2} stroke={div} />

      {/* 세로 구분선: 1행(ES|DR|EF), 3행(LS|TF|LF) */}
      <line x1={x + col}     y1={y}           x2={x + col}     y2={y + rowH} stroke={div} />
      <line x1={x + col * 2} y1={y}           x2={x + col * 2} y2={y + rowH} stroke={div} />
      <line x1={x + col}     y1={y + rowH * 2} x2={x + col}     y2={y + H}   stroke={div} />
      <line x1={x + col * 2} y1={y + rowH * 2} x2={x + col * 2} y2={y + H}   stroke={div} />

      {/* 1행: ES / DR / EF */}
      <text x={x + 25}  y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">ES</text>
      <text x={x + 25}  y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.es}</text>
      <text x={x + 75}  y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">DR</text>
      <text x={x + 75}  y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.dr}</text>
      <text x={x + 125} y={y + 11} textAnchor="middle" fontSize="9"  fill="#718096">EF</text>
      <text x={x + 125} y={y + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.ef}</text>

      {/* 2행: 작업명 */}
      <text x={x + 75} y={y + rowH + 20} textAnchor="middle" fontSize="16" fontWeight="bold" fill={tc}>{d.name}</text>

      {/* 3행: LS / TF / LF */}
      <text x={x + 25}  y={y + rowH * 2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">LS</text>
      <text x={x + 25}  y={y + rowH * 2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.ls}</text>
      <text x={x + 75}  y={y + rowH * 2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">TF</text>
      <text x={x + 75}  y={y + rowH * 2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.tf}</text>
      <text x={x + 125} y={y + rowH * 2 + 11} textAnchor="middle" fontSize="9"  fill="#718096">LF</text>
      <text x={x + 125} y={y + rowH * 2 + 26} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tc}>{d.lf}</text>
    </g>
  );
}

// ─── 공통 스타일 상수 ────────────────────────
// 섹션·제목·본문·수식 박스에 반복 사용되는 인라인 스타일을 변수로 추출
const sec: React.CSSProperties = { marginBottom: 52 };
const h2: React.CSSProperties = {
  fontSize: '1.3rem', fontWeight: 700, color: '#2d3748',
  marginBottom: 18, paddingBottom: 10, borderBottom: '2px solid #ebf4ff',
};
const h3: React.CSSProperties = {
  fontSize: '1rem', fontWeight: 600, color: '#4a5568', marginTop: 20, marginBottom: 10,
};
const p: React.CSSProperties = {
  color: '#4a5568', lineHeight: 1.85, marginBottom: 12, fontSize: '0.96rem',
};
// 수식 표시용 monospace 박스 스타일
const fml: React.CSSProperties = {
  background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8,
  padding: '12px 18px', fontFamily: 'monospace', fontSize: '0.93rem',
  color: '#2d3748', marginBottom: 10,
};

// ─── 항목별 상세 설명 데이터 ─────────────────
// "개념이 헷갈린다면 상세 설명 펼치기" 아코디언에 표시할 각 필드의 설명.
// formula가 null이면 수식 박스를 렌더링하지 않는다.
const FIELD_DETAILS = [
  {
    abbr: 'ES', en: 'Earliest Start', summary: '최초 착수 가능 시점',
    detail: '이 작업을 가장 빨리 시작할 수 있는 시점입니다. 실제 시작 시점이 아니라, 모든 선행 작업이 완료되었을 때 시작 가능한 가장 이른 시점을 의미합니다. 선행 작업이 여러 개라면 그중 가장 늦게 끝나는 작업의 EF를 기준으로 결정됩니다. 시작 작업은 보통 ES = 0입니다.',
    formula: null,
  },
  {
    abbr: 'DR', en: 'Duration', summary: '작업 소요 기간',
    detail: '해당 작업을 완료하는 데 필요한 기간입니다. 사용자가 입력하는 기본 값이며, ES, EF, LS, LF, TF를 계산하는 기준이 됩니다. 단위는 프로젝트 성격에 따라 일, 주, 시간 등으로 정할 수 있습니다.',
    formula: null,
  },
  {
    abbr: 'EF', en: 'Earliest Finish', summary: '최초 완료 가능 시점',
    detail: '이 작업이 가장 빨리 완료될 수 있는 시점입니다. ES에 작업 소요 기간인 DR을 더해서 계산합니다. EF는 후속 작업의 ES를 결정할 때 사용됩니다.',
    formula: 'EF = ES + DR',
  },
  {
    abbr: 'LS', en: 'Latest Start', summary: '최종 착수 가능 시점',
    detail: '전체 프로젝트의 최소 완료 기간을 지연시키지 않으면서 이 작업을 시작할 수 있는 가장 늦은 시점입니다. 임계 작업은 LS와 ES가 같으며, LS보다 늦게 시작하면 전체 프로젝트 일정이 지연됩니다.',
    formula: 'LS = LF − DR',
  },
  {
    abbr: 'TF', en: 'Total Float', summary: '총 여유 시간',
    detail: '전체 프로젝트의 최소 완료 기간을 지연시키지 않고 해당 작업을 늦출 수 있는 최대 시간입니다. TF가 0이면 임계 작업이며, 이 작업이 지연되면 전체 프로젝트도 지연됩니다. TF가 0보다 크면 그 범위 안에서는 일정 조정이 가능합니다.',
    formula: 'TF = LS − ES  또는  LF − EF',
  },
  {
    abbr: 'LF', en: 'Latest Finish', summary: '최종 완료 가능 시점',
    detail: '전체 프로젝트의 최소 완료 기간을 지연시키지 않으면서 이 작업이 완료되어야 하는 가장 늦은 시점입니다. 후속 작업이 여러 개라면 그중 가장 빠르게 시작해야 하는 작업의 LS를 기준으로 결정됩니다. 종료 작업의 LF는 전체 프로젝트 최소 완료 기간과 같습니다.',
    formula: null,
  },
];

// ─── 메인 컴포넌트 ───────────────────────────
export default function CpmGuide({ onBack }: Props) {
  // "항목 상세 설명" 아코디언 열림 여부
  const [showFieldDetail, setShowFieldDetail] = useState(false);

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* guide-inner: padding을 CSS로 옮겨 모바일에서 좌우 여백을 줄임 */}
      <div className="guide-inner" style={{ maxWidth: 920, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>

        {/* 헤더: 뒤로 가기 버튼 + 페이지 제목 */}
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
            <p style={{ color: '#718096', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Critical Path Method
            </p>
          </div>
        </div>

        {/* ── 섹션 1: CPM이란? ── */}
        <section style={sec}>
          <h2 style={h2}>CPM이란?</h2>
          <p style={p}>
            <strong>CPM(임계 경로법, Critical Path Method)</strong>은 프로젝트를 구성하는 작업들의
            선행 관계를 네트워크 다이어그램으로 표현하고, <strong>프로젝트 최소 완료 기간을 결정하는 가장 긴 경로</strong>를
            찾아내는 일정 관리 기법입니다.
          </p>
          <p style={p}>
            여기서 말하는 임계 경로는 단순히 길이가 긴 경로가 아니라,
            해당 경로 위의 작업이 지연될 경우 전체 프로젝트 완료 시점까지 함께 지연되는 핵심 경로를 의미합니다.
          </p>

          {/* CPM의 3가지 핵심 활용 카드 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
            {[
              { icon: '📋', title: '최소 완료 기간 계산', desc: '프로젝트가 가장 빠르게 끝날 수 있는 기간을 계산합니다.' },
              { icon: '🔴', title: '임계 경로 식별', desc: '지연 시 전체 일정에 영향을 주는 핵심 작업을 파악합니다.' },
              { icon: '⏱️', title: '여유 시간 관리', desc: '각 작업의 여유 시간을 계산해 일정을 유연하게 조정합니다.' },
            ].map(c => (
              <div key={c.title} style={{ flex: '1 1 180px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '18px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2d3748', marginBottom: 5 }}>{c.title}</div>
                <div style={{ fontSize: '0.82rem', color: '#718096', lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 섹션 2: 네트워크 노드 구조 ── */}
        <section style={sec}>
          <h2 style={h2}>네트워크 노드 구조</h2>
          <p style={p}>
            각 작업은 6칸 구조의 박스로 표현됩니다. 위쪽은 가장 빠른 일정, 아래쪽은 가장 늦은 일정을 나타냅니다.
            임계 경로 위의 작업은 빨간색으로 강조됩니다.
          </p>

          <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap', marginTop: 24 }}>
            {/* 노드 구조 시각 예시 (HTML 박스) */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ border: '2px solid #4a90d9', borderRadius: 8, background: '#ebf8ff', width: 240, overflow: 'hidden', boxShadow: '0 2px 10px rgba(74,144,217,.18)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #90cdf4' }}>
                  {(['ES', 'DR', 'EF'] as const).map((lbl, i) => (
                    <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #90cdf4' : undefined }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>{['0', '5', '5'][i]}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #90cdf4', fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>
                  작업명
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  {(['LS', 'TF', 'LF'] as const).map((lbl, i) => (
                    <div key={lbl} style={{ padding: '8px 4px', textAlign: 'center', borderRight: i < 2 ? '1px solid #90cdf4' : undefined }}>
                      <div style={{ fontSize: 10, color: '#718096', marginBottom: 2 }}>{lbl}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6cb0' }}>{['0', '0', '5'][i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/*
             * 항목 설명 테이블: tableLayout fixed + colgroup으로 '의미' 열을 넓게 확보
             * guide-node-desc: PC에서는 min-width: 420px 유지, 모바일에서는 해제 (Bug #6 참고)
             */}
            <div className="guide-node-desc">
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed', minWidth: 300 }}>
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
                  {FIELD_DETAILS.map((f, i) => (
                    <tr key={f.abbr} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#4a90d9' }}>{f.abbr}</td>
                      <td style={{ padding: '10px 14px', color: '#718096', fontSize: '0.84rem' }}>{f.en}</td>
                      <td style={{ padding: '10px 14px', color: '#2d3748' }}>{f.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* 아코디언 토글 버튼: 각 항목의 상세 설명을 펼치거나 접는다 */}
          <button
            onClick={() => setShowFieldDetail(v => !v)}
            style={{
              marginTop: 20, width: '100%',
              background: showFieldDetail ? '#ebf8ff' : '#f7fafc',
              border: `1px solid ${showFieldDetail ? '#90cdf4' : '#e2e8f0'}`,
              borderRadius: 8, padding: '11px 18px', cursor: 'pointer',
              fontSize: '0.9rem', color: '#4a5568',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600,
            }}
          >
            <span>개념이 헷갈린다면 각 항목의 상세 설명을 펼쳐보세요</span>
            <span style={{ fontSize: '0.78rem', color: '#718096' }}>
              {showFieldDetail ? '▲ 접기' : '▼ 펼치기'}
            </span>
          </button>

          {/* 아코디언 상세 설명 패널: showFieldDetail이 true일 때만 렌더링 */}
          {showFieldDetail && (
            <div style={{ marginTop: 4, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              {FIELD_DETAILS.map((f, i) => (
                <div
                  key={f.abbr}
                  style={{
                    padding: '18px 22px',
                    borderBottom: i < FIELD_DETAILS.length - 1 ? '1px solid #e2e8f0' : undefined,
                    background: i % 2 === 0 ? '#fff' : '#f9fafb',
                  }}
                >
                  {/* 항목 헤더: 기호 / 영문명 / 한줄 요약 */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#4a90d9', minWidth: 32 }}>{f.abbr}</span>
                    <span style={{ fontSize: '0.83rem', color: '#718096' }}>{f.en}</span>
                    <span style={{ fontSize: '0.88rem', color: '#4a5568', fontWeight: 600 }}>— {f.summary}</span>
                  </div>
                  {/* 상세 설명 본문 */}
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.85, paddingLeft: 42 }}>
                    {f.detail}
                  </p>
                  {/* 수식이 있는 항목(EF, LS, TF)만 수식 박스 표시 */}
                  {f.formula && (
                    <div style={{ marginTop: 10, marginLeft: 42, display: 'inline-block', background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 6, padding: '5px 14px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#2b6cb0' }}>
                      {f.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 섹션 3: 계산 절차 ── */}
        <section style={sec}>
          <h2 style={h2}>계산 절차</h2>

          {/* 전진 계산 / 후진 계산 카드 2열 배치 — 모바일에서 1열로 전환 */}
          <div className="guide-grid-2col" style={{ gap: 20, marginBottom: 20 }}>
            <div style={{ background: '#ebf8ff', borderRadius: 10, padding: 22, border: '1px solid #bee3f8' }}>
              <h3 style={{ ...h3, marginTop: 0, color: '#2b6cb0' }}>① 전진 계산</h3>
              <p style={{ ...p, fontSize: '0.88rem' }}>
                프로젝트 시작 지점에서 종료 지점으로 이동하면서 각 작업의 가장 빠른 시작 시점과 완료 시점을 계산합니다.
              </p>
              <div style={{ ...fml, background: '#fff', border: '1px solid #bee3f8', fontSize: '0.88rem' }}>
                <div style={{ marginBottom: 5 }}>EF = ES + DR</div>
                <div>후속 작업의 ES = max(선행 작업들의 EF)</div>
              </div>
              <p style={{ ...p, fontSize: '0.84rem', marginBottom: 0 }}>
                여러 선행 작업이 있는 경우, 모든 선행 작업이 끝나야 시작할 수 있으므로 가장 늦게 끝나는 EF를 기준으로 ES가 결정됩니다.
              </p>
            </div>

            <div style={{ background: '#fff5f5', borderRadius: 10, padding: 22, border: '1px solid #fed7d7' }}>
              <h3 style={{ ...h3, marginTop: 0, color: '#c53030' }}>② 후진 계산</h3>
              <p style={{ ...p, fontSize: '0.88rem' }}>
                프로젝트 종료 지점에서 시작 지점으로 거슬러 올라가며 각 작업의 가장 늦은 시작 시점과 완료 시점을 계산합니다.
              </p>
              <div style={{ ...fml, background: '#fff', border: '1px solid #fed7d7', fontSize: '0.88rem' }}>
                <div style={{ marginBottom: 5 }}>LS = LF − DR</div>
                <div>선행 작업의 LF = min(후속 작업들의 LS)</div>
              </div>
              <p style={{ ...p, fontSize: '0.84rem', marginBottom: 0 }}>
                후속 작업이 여러 개라면, 그중 가장 빨리 시작해야 하는 작업을 기준으로 선행 작업의 LF가 결정됩니다.
              </p>
            </div>
          </div>

          {/* 여유 시간(TF) 계산 및 임계 작업 판별 */}
          <div style={{ background: '#f7fafc', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ ...h3, marginTop: 0 }}>③ 여유 시간 계산</h3>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ ...fml, margin: 0, fontSize: '1rem' }}>TF = LS − ES &nbsp;(또는 LF − EF)</div>
              <div style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.9 }}>
                <div>• TF = 0 → <strong style={{ color: '#e53e3e' }}>임계 작업</strong></div>
                <div>• TF &gt; 0 → 비임계 작업</div>
                <div>• TF 범위를 초과해 지연되면 전체 프로젝트가 지연됩니다.</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 섹션 4: 계산 예시 ── */}
        <section style={sec}>
          <h2 style={h2}>계산 예시</h2>
          <p style={p}>4개의 작업으로 구성된 간단한 프로젝트를 통해 CPM 계산 과정을 살펴봅니다.</p>

          {/* 입력 데이터 테이블: 내용 열을 45%로 고정하여 텍스트가 잘리지 않도록 함 */}
          <h3 style={h3}>입력 데이터</h3>
          <div style={{ overflowX: 'auto', marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed', minWidth: 360 }}>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '45%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#4a90d9', color: '#fff' }}>
                {['작업', '선행 작업', '소요 기간(DR)', '내용'].map((item, i) => (
                  <th key={item} style={{ padding: '9px 20px', textAlign: 'center', borderRadius: i === 0 ? '8px 0 0 0' : i === 3 ? '0 8px 0 0' : undefined }}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['A', '없음', '2', '프로젝트 준비'],
                ['B', 'A',    '3', '병렬 작업 1'],
                ['C', 'A',    '5', '병렬 작업 2'],
                ['D', 'B, C', '2', '최종 마무리'],
              ].map(([name, pred, dr, desc], i) => (
                <tr key={name} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={{ padding: '9px 20px', textAlign: 'center', fontWeight: 700 }}>{name}</td>
                  <td style={{ padding: '9px 20px', textAlign: 'center', color: '#718096' }}>{pred}</td>
                  <td style={{ padding: '9px 20px', textAlign: 'center' }}>{dr}</td>
                  <td style={{ padding: '9px 20px', color: '#4a5568' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* SVG 네트워크 다이어그램: viewBox 고정, width 100%로 반응형 */}
          <h3 style={h3}>네트워크 다이어그램</h3>
          <div style={{ background: '#f7fafc', borderRadius: 10, padding: '16px 8px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
            <svg viewBox="0 0 760 390" width="100%" style={{ display: 'block' }}>
              <defs>
                {/* 화살표 마커: 임계 경로(빨강) / 일반 경로(파랑) */}
                <marker id="g-arr-red"  viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#e53e3e" />
                </marker>
                <marker id="g-arr-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#4a90d9" />
                </marker>
              </defs>

              {/* 화살표 선: A→B(파랑), A→C(빨강/임계), B→D(파랑), C→D(빨강/임계) */}
              <line x1="180" y1="190" x2="304" y2="78"  stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)" />
              <line x1="180" y1="190" x2="304" y2="302" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)" />
              <line x1="456" y1="78"  x2="579" y2="190" stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)" />
              <line x1="456" y1="302" x2="579" y2="190" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)" />

              {/* 노드 박스: A(좌), B(우상), C(우하), D(우) */}
              <NodeSvg x={30}  y={145} d={NODES[0]} />
              <NodeSvg x={305} y={33}  d={NODES[1]} />
              <NodeSvg x={305} y={257} d={NODES[2]} />
              <NodeSvg x={580} y={145} d={NODES[3]} />

              {/* 범례 */}
              <g transform="translate(30, 20)">
                <rect x="0" y="0" width="210" height="62" fill="#fff" stroke="#e2e8f0" rx="7" opacity="0.95" />
                <line x1="12" y1="22" x2="44" y2="22" stroke="#e53e3e" strokeWidth="2.5" markerEnd="url(#g-arr-red)" />
                <text x="52" y="27" fontSize="12" fill="#2d3748">임계 경로 (TF = 0)</text>
                <line x1="12" y1="44" x2="44" y2="44" stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#g-arr-blue)" />
                <text x="52" y="49" fontSize="12" fill="#2d3748">일반 경로 (TF &gt; 0)</text>
              </g>
            </svg>
          </div>

          {/* 계산 결과 테이블: NODES 데이터를 순회하여 렌더링 */}
          <h3 style={h3}>계산 결과</h3>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 14, minWidth: 480 }}>
            <thead>
              <tr style={{ background: '#4a90d9', color: '#fff' }}>
                {['작업', '선행', 'DR', 'ES', 'EF', 'LS', 'LF', 'TF', '임계 경로'].map((item, i, arr) => (
                  <th key={item} style={{ padding: '10px 12px', textAlign: 'center', borderRadius: i === 0 ? '8px 0 0 0' : i === arr.length - 1 ? '0 8px 0 0' : undefined }}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NODES.map((n, i) => (
                // 임계 작업 행은 연한 빨강 배경으로 강조
                <tr key={n.name} style={{ borderBottom: '1px solid #e2e8f0', background: n.critical ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: n.critical ? '#e53e3e' : '#2d3748' }}>{n.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#718096' }}>{n.pred}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.dr}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.es}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.ef}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.ls}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{n.lf}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: n.tf === 0 ? 700 : 400, color: n.tf === 0 ? '#e53e3e' : '#2d3748' }}>{n.tf}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#e53e3e', fontWeight: 700 }}>{n.critical ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* 임계 경로 요약 배너 */}
          <div style={{ padding: '12px 18px', background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, fontSize: '0.92rem', color: '#c53030' }}>
            🔴 <strong>임계 경로: A → C → D</strong> &nbsp;|&nbsp; 최소 프로젝트 완료 기간: <strong>9</strong>
          </div>

          {/* 단계별 계산 과정: 전진/후진 2열로 나란히 표시 — 모바일에서 1열로 전환 */}
          <h3 style={{ ...h3, marginTop: 28 }}>단계별 계산 과정</h3>
          <div className="guide-grid-2col" style={{ gap: 16 }}>
            <div style={{ background: '#ebf8ff', borderRadius: 10, padding: 18, border: '1px solid #bee3f8', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.9 }}>
              <div style={{ fontWeight: 700, color: '#2b6cb0', marginBottom: 10 }}>① 전진 계산</div>
              <div>A: ES = 0, EF = 0 + 2 = <strong>2</strong></div>
              <div>B: ES = EF(A) = 2, EF = 2 + 3 = <strong>5</strong></div>
              <div>C: ES = EF(A) = 2, EF = 2 + 5 = <strong>7</strong></div>
              <div>D: ES = max(EF(B), EF(C)) = max(5, 7) = <strong>7</strong></div>
              <div style={{ marginTop: 6 }}>EF(D) = 7 + 2 = <strong>9</strong> → 최소 완료 기간</div>
            </div>

            <div style={{ background: '#fff5f5', borderRadius: 10, padding: 18, border: '1px solid #fed7d7', fontSize: '0.88rem', color: '#2d3748', lineHeight: 1.9 }}>
              <div style={{ fontWeight: 700, color: '#c53030', marginBottom: 10 }}>② 후진 계산</div>
              <div>D: LF = 9, LS = 9 − 2 = <strong>7</strong></div>
              <div>B: LF = LS(D) = 7, LS = 7 − 3 = <strong>4</strong></div>
              <div>C: LF = LS(D) = 7, LS = 7 − 5 = <strong>2</strong></div>
              <div>A: LF = min(LS(B), LS(C)) = min(4, 2) = <strong>2</strong></div>
              <div style={{ marginTop: 6 }}>LS(A) = 2 − 2 = <strong>0</strong></div>
            </div>
          </div>
        </section>

        {/* ── 섹션 5: 임계 경로의 의미와 활용 ── */}
        <section style={{ ...sec, marginBottom: 0 }}>
          <h2 style={h2}>임계 경로의 의미와 활용</h2>
          {/* 4개 카드 2열 배치 — 모바일에서 1열로 전환 */}
          <div className="guide-grid-2col" style={{ gap: 16 }}>
            {[
              { bg: '#fff5f5', border: '#fed7d7', title: '⚠️ 임계 작업이 지연되면',      desc: 'TF = 0인 임계 경로 위의 작업이 지연되면 전체 프로젝트의 최소 완료 기간도 함께 늘어납니다.' },
              { bg: '#f0fff4', border: '#c6f6d5', title: '✅ 비임계 작업은 유연하게 관리', desc: 'TF 범위 안에서의 지연은 전체 프로젝트 완료 시점에 영향을 주지 않으므로 일정 조정이 가능합니다.' },
              { bg: '#ebf8ff', border: '#bee3f8', title: '🎯 프로젝트 단축 방법',          desc: '전체 일정을 단축하려면 임계 경로 위의 작업 기간을 줄여야 합니다. 비임계 작업만 단축하면 전체 기간은 변하지 않을 수 있습니다.' },
              { bg: '#faf5ff', border: '#e9d8fd', title: '🔄 임계 경로는 바뀔 수 있음',   desc: '작업 기간 변경이나 지연이 발생하면 임계 경로가 다른 경로로 이동할 수 있으므로 진행 중에도 재계산이 필요합니다.' },
            ].map(c => (
              <div key={c.title} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#2d3748', marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: '0.87rem', color: '#4a5568', lineHeight: 1.75 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* 고정 스크롤 버튼: 페이지 우측 하단에 위/아래 이동 */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="맨 위로"
          className="scroll-btn"
        >
          ↑
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          title="맨 아래로"
          className="scroll-btn"
        >
          ↓
        </button>
      </div>
    </div>
  );
}
