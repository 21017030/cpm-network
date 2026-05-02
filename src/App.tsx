import { useState } from 'react';
import ActivityTable from './components/ActivityTable';
import { Activity, Unit } from './types';

// 새 행 추가 시 중복 없는 id를 부여하기 위한 카운터 (초기 3개 행 이후부터 시작)
let nextId = 4;

// 앱 초기 실행 시 기본으로 표시할 빈 작업 3개
const initialActivities: Activity[] = [
  { id: 1, name: '', description: '', predecessors: '', duration: '' },
  { id: 2, name: '', description: '', predecessors: '', duration: '' },
  { id: 3, name: '', description: '', predecessors: '', duration: '' },
];

export default function App() {
  // 전체 작업 목록 상태
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  // 전체 공통 시간 단위 상태 (기본값: 일)
  const [unit, setUnit] = useState<Unit>('day');

  // 새 빈 작업 행 추가
  const handleAdd = () => {
    setActivities((prev) => [
      ...prev,
      { id: nextId++, name: '', description: '', predecessors: '', duration: '' },
    ]);
  };

  // 특정 작업의 특정 필드 값 변경
  const handleChange = (id: number, field: keyof Activity, value: string) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  // 특정 작업 행 삭제
  const handleDelete = (id: number) => {
    setActivities((prev) => prev.filter((act) => act.id !== id));
  };

  return (
    <div className="container">
      <h1>CPM 네트워크</h1>
      <p className="subtitle">작업 정보를 입력하고 임계 경로를 계산하세요.</p>
      {/* 작업 입력 테이블 컴포넌트 */}
      <ActivityTable
        activities={activities}
        unit={unit}
        onAdd={handleAdd}
        onChange={handleChange}
        onDelete={handleDelete}
        onUnitChange={setUnit}
      />
    </div>
  );
}
