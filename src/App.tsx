import { useState } from 'react';
import ActivityTable from './components/ActivityTable';
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
    </div>
  );
}
