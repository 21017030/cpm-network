import { useState, useRef } from 'react';
import React from 'react';
import ActivityTable from './components/ActivityTable';
import NetworkGraph from './components/NetworkGraph';
import CpmGuide from './components/CpmGuide';
import { calculateCpm, CpmResult } from './cpm';
import { Activity, Unit } from './types';

let nextId = 14;

const scrollBtnStyle: React.CSSProperties = {
  background: '#4a90d9',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  width: 44,
  height: 44,
  fontSize: 20,
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const initialActivities: Activity[] = [
  { id: 1, name: '', description: '', predecessors: [], duration: '' },
  { id: 2, name: '', description: '', predecessors: [], duration: '' },
  { id: 3, name: '', description: '', predecessors: [], duration: '' },
];

const EXAMPLES: { name: string; activities: Activity[]; unit: Unit }[] = [
  {
    name: '쇼핑몰 개발 프로젝트',
    unit: 'week',
    activities: [
      { id: 1,  name: 'A', description: '프로젝트 요구사항 분석',   predecessors: [],         duration: '2' },
      { id: 2,  name: 'B', description: '사용자 계정 기능 개발',     predecessors: ['A'],      duration: '6' },
      { id: 3,  name: 'C', description: '상품 목록 조회 기능 개발',  predecessors: ['A'],      duration: '4' },
      { id: 4,  name: 'D', description: '데이터베이스 설계 및 구축', predecessors: ['B', 'C'], duration: '2' },
      { id: 5,  name: 'E', description: '결제 시스템 연동',          predecessors: ['D'],      duration: '4' },
      { id: 6,  name: 'F', description: '장바구니 기능 개발',        predecessors: ['D'],      duration: '3' },
      { id: 7,  name: 'G', description: '주문 처리 기능 개발',       predecessors: ['E'],      duration: '2' },
      { id: 8,  name: 'H', description: '배송 추적 기능 개발',       predecessors: ['E'],      duration: '4' },
      { id: 9,  name: 'I', description: '관리자 페이지 개발',        predecessors: ['F'],      duration: '2' },
      { id: 10, name: 'J', description: '할인 및 쿠폰 기능 개발',   predecessors: ['F'],      duration: '1' },
      { id: 11, name: 'K', description: '시스템 통합 테스트',        predecessors: ['G', 'H'], duration: '2' },
      { id: 12, name: 'L', description: '보안 점검 및 최적화',       predecessors: ['I', 'K'], duration: '2' },
      { id: 13, name: 'M', description: '최종 배포 및 운영 준비',    predecessors: ['J', 'L'], duration: '3' },
    ],
  },
  {
    name: '소프트웨어 개발 프로젝트',
    unit: 'week',
    activities: [
      { id: 1, name: 'A', description: '요구사항 정의',       predecessors: [], duration: '7' },
  { id: 2, name: 'B', description: '시장 분석',           predecessors: [], duration: '9' },
  { id: 3, name: 'C', description: '시스템 구조 설계',     predecessors: ['A'], duration: '12' },
  { id: 4, name: 'D', description: '데이터베이스 설계',   predecessors: ['A', 'B'], duration: '8' },
  { id: 5, name: 'E', description: '백엔드 구현',         predecessors: ['D'], duration: '9' },
  { id: 6, name: 'F', description: '프론트엔드 개발 및 연동', predecessors: ['C', 'E'], duration: '6' },
  { id: 7, name: 'G', description: '기능 테스트',         predecessors: ['E'], duration: '5' },
    ],
  },
  {
    name: '풀스택 서비스 개발 프로젝트',
    unit: 'day',
    activities: [
      { id: 1,  name: 'A', description: '요구사항 정의',         predecessors: [],           duration: '3' },
      { id: 2,  name: 'B', description: '시장 분석',             predecessors: [],           duration: '2' },
      { id: 3,  name: 'C', description: '프로젝트 계획 수립',    predecessors: ['A'],        duration: '2' },
      { id: 4,  name: 'D', description: '시스템 구조 설계',      predecessors: ['A'],        duration: '4' },
      { id: 5,  name: 'E', description: 'UI/UX 설계',            predecessors: ['A', 'B'],   duration: '3' },
      { id: 6,  name: 'F', description: '데이터베이스 설계',     predecessors: ['D'],        duration: '3' },
      { id: 7,  name: 'G', description: '기술 스택 선정',        predecessors: ['C'],        duration: '1' },
      { id: 8,  name: 'H', description: '개발 환경 구축',        predecessors: ['C', 'G'],   duration: '2' },
      { id: 9,  name: 'I', description: '백엔드 구조 설계',      predecessors: ['D', 'F'],   duration: '2' },
      { id: 10, name: 'J', description: '프론트엔드 구조 설계',  predecessors: ['D', 'E'],   duration: '2' },
      { id: 11, name: 'K', description: '백엔드 개발',           predecessors: ['I', 'H'],   duration: '6' },
      { id: 12, name: 'L', description: '프론트엔드 개발',       predecessors: ['J', 'H'],   duration: '5' },
      { id: 13, name: 'M', description: 'API 개발',              predecessors: ['K'],        duration: '3' },
      { id: 14, name: 'N', description: '화면 연동',             predecessors: ['L', 'M'],   duration: '2' },
      { id: 15, name: 'O', description: '단위 테스트',           predecessors: ['K', 'L'],   duration: '2' },
      { id: 16, name: 'P', description: '통합 테스트',           predecessors: ['N', 'O'],   duration: '3' },
      { id: 17, name: 'Q', description: '성능 테스트',           predecessors: ['P'],        duration: '2' },
      { id: 18, name: 'R', description: '보안 점검',             predecessors: ['P'],        duration: '1' },
      { id: 19, name: 'S', description: '배포 준비',             predecessors: ['Q', 'R'],   duration: '1' },
      { id: 20, name: 'T', description: '서비스 배포',           predecessors: ['S'],        duration: '1' },
    ],
  },
];

export default function App() {
  const [showGuide, setShowGuide] = useState(false);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [unit, setUnit] = useState<Unit>('day');
  const [result, setResult] = useState<CpmResult | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  if (showGuide) return <CpmGuide onBack={() => setShowGuide(false)} />;

  const handleAdd = () => {
    setActivities((prev) => [
      ...prev,
      { id: nextId++, name: '', description: '', predecessors: [], duration: '' },
    ]);
  };

  const handleChange = (id: number, field: keyof Omit<Activity, 'predecessors'>, value: string) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  const handlePredecessorsChange = (id: number, predecessors: string[]) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, predecessors } : act))
    );
  };

  const handleDelete = (id: number) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  };

  const handleCalculate = () => {
    const valid = activities.filter(a => a.name.trim() && a.duration !== '');
    if (valid.length === 0) {
      alert('최소 한 개 이상의 작업을 입력해 주세요.\n작업명과 소요 기간을 입력하면 그래프를 생성할 수 있습니다.');
      return;
    }
    setResult(calculateCpm(activities));
  };

  const handleLoadExample = (index: number) => {
    const ex = EXAMPLES[index];
    setActivities(ex.activities);
    setUnit(ex.unit);
    setResult(null);
  };

  const handleReset = () => {
    if (!window.confirm('모든 데이터를 초기화하시겠습니까?\n작업 목록과 그래프가 모두 삭제됩니다.')) return;
    nextId = 14;
    setActivities([
      { id: 11, name: '', description: '', predecessors: [], duration: '' },
      { id: 12, name: '', description: '', predecessors: [], duration: '' },
      { id: 13, name: '', description: '', predecessors: [], duration: '' },
    ]);
    setUnit('day');
    setResult(null);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>CPM 네트워크 생성기</h1>
          <p className="subtitle">작업 정보를 입력하고 임계 경로를 계산하세요.</p>
        </div>
        <button
          onClick={() => setShowGuide(true)}
          style={{ background: 'none', border: 'none', color: '#4a90d9', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', padding: '4px 0', marginTop: 6, whiteSpace: 'nowrap' }}
        >
          CPM이란? →
        </button>
      </div>

      <ActivityTable
        activities={activities}
        unit={unit}
        onAdd={handleAdd}
        onChange={handleChange}
        onPredecessorsChange={handlePredecessorsChange}
        onDelete={handleDelete}
        onUnitChange={setUnit}
        examples={EXAMPLES.map(e => e.name)}
        onLoadExample={handleLoadExample}
        onReset={handleReset}
      />

      <div className="actions">
        <button id="calculate-btn" onClick={handleCalculate}>그래프 생성</button>
      </div>

      {result && (
        <>
          <div ref={graphRef} className="result-summary">
            <span>최소 프로젝트 완료 기간: <strong>{result.projectDuration}{unit === 'day' ? '일' : '주'}</strong></span>
            <span>임계 경로: <strong style={{ color: '#e53e3e' }}>{result.nodes.filter((n) => n.isCritical).map((n) => n.name).join(' → ')}</strong></span>
          </div>
          <NetworkGraph result={result} />
        </>
      )}

      {/* 스크롤 버튼 — 항상 표시 */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="맨 위로"
          style={scrollBtnStyle}
        >
          ↑
        </button>
        <button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          title="맨 아래로"
          style={scrollBtnStyle}
        >
          ↓
        </button>
      </div>
    </div>
  );
}
