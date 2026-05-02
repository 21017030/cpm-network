import { useState } from 'react';
import ActivityTable from './components/ActivityTable';
import NetworkGraph from './components/NetworkGraph';
import { calculateCpm, CpmResult } from './cpm';
import { Activity, Unit } from './types';

let nextId = 4;

const initialActivities: Activity[] = [
  { id: 1, name: '', description: '', predecessors: '', duration: '' },
  { id: 2, name: '', description: '', predecessors: '', duration: '' },
  { id: 3, name: '', description: '', predecessors: '', duration: '' },
];

export default function App() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [unit, setUnit] = useState<Unit>('day');
  // CPM 계산 결과 (null이면 아직 계산 전)
  const [result, setResult] = useState<CpmResult | null>(null);

  const handleAdd = () => {
    setActivities((prev) => [
      ...prev,
      { id: nextId++, name: '', description: '', predecessors: '', duration: '' },
    ]);
  };

  const handleChange = (id: number, field: keyof Activity, value: string) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  const handleDelete = (id: number) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  };

  // 입력 데이터를 기반으로 CPM 계산 후 결과 저장
  const handleCalculate = () => {
    const cpmResult = calculateCpm(activities);
    setResult(cpmResult);
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
        onDelete={handleDelete}
        onUnitChange={setUnit}
      />

      <div className="actions">
        <button id="calculate-btn" onClick={handleCalculate}>그래프 생성</button>
      </div>

      {/* 계산 결과가 있을 때만 그래프와 요약 표시 */}
      {result && (
        <>
          <div className="result-summary">
            <span>전체 프로젝트 기간: <strong>{result.projectDuration}{unit === 'hour' ? '시간' : unit === 'day' ? '일' : '주'}</strong></span>
            <span>임계 경로: <strong style={{ color: '#e53e3e' }}>{result.nodes.filter((n) => n.isCritical).map((n) => n.name).join(' → ')}</strong></span>
          </div>
          <NetworkGraph result={result} unit={unit} />
        </>
      )}
    </div>
  );
}
