import { useState, useRef } from 'react';
import ActivityTable from './components/ActivityTable';
import NetworkGraph from './components/NetworkGraph';
import { calculateCpm, CpmResult } from './cpm';
import { Activity, Unit } from './types';

let nextId = 14;

const initialActivities: Activity[] = [
  { id: 1, name: '', description: '', predecessors: [], duration: '' },
  { id: 2, name: '', description: '', predecessors: [], duration: '' },
  { id: 3, name: '', description: '', predecessors: [], duration: '' },
];

// 예시 데이터 (쇼핑몰 개발 프로젝트)
const exampleActivities: Activity[] = [
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
];

export default function App() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [unit, setUnit] = useState<Unit>('day');
  const [result, setResult] = useState<CpmResult | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);

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
    setResult(calculateCpm(activities));
  };

  // 예시 데이터 불러오기 (단위도 '주'로 변경)
  const handleLoadExample = () => {
    setActivities(exampleActivities);
    setUnit('week');
    setResult(null);
  };

  return (
    <div className="container">
      <h1>CPM 네트워크</h1>
      <p className="subtitle">작업 정보를 입력하고 임계 경로를 계산하세요.</p>

      <ActivityTable
        activities={activities}
        unit={unit}
        onAdd={handleAdd}
        onChange={handleChange}
        onPredecessorsChange={handlePredecessorsChange}
        onDelete={handleDelete}
        onUnitChange={setUnit}
        onLoadExample={handleLoadExample}
      />

      <div className="actions">
        <button id="calculate-btn" onClick={handleCalculate}>그래프 생성</button>
      </div>

      {result && (
        <>
          <div ref={graphRef} className="result-summary">
            <span>전체 프로젝트 기간: <strong>{result.projectDuration}{unit === 'day' ? '일' : '주'}</strong></span>
            <span>임계 경로: <strong style={{ color: '#e53e3e' }}>{result.nodes.filter((n) => n.isCritical).map((n) => n.name).join(' → ')}</strong></span>
          </div>
          <NetworkGraph result={result} />
          <button
            onClick={() => graphRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            title="그래프로 이동"
            style={{
              position: 'fixed',
              bottom: 28,
              right: 28,
              background: '#4a90d9',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '10px 18px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              zIndex: 1000,
            }}
          >
            그래프 ↓
          </button>
        </>
      )}
    </div>
  );
}
