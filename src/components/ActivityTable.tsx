import { Activity, Unit } from '../types';

interface Props {
  activities: Activity[];
  unit: Unit;
  onAdd: () => void;
  onChange: (id: number, field: keyof Activity, value: string) => void;
  onDelete: (id: number) => void;
  onUnitChange: (unit: Unit) => void;
}

const unitLabel: Record<Unit, string> = {
  hour: '시간',
  day: '일',
  week: '주',
};

export default function ActivityTable({ activities, unit, onAdd, onChange, onDelete, onUnitChange }: Props) {
  return (
    <div>
      <div className="unit-bar">
        <label htmlFor="global-unit">시간 단위</label>
        <select
          id="global-unit"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as Unit)}
        >
          <option value="hour">시간</option>
          <option value="day">일</option>
          <option value="week">주</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>작업</th>
              <th>작업 설명</th>
              <th>선행 작업</th>
              <th>소요 기간 ({unitLabel[unit]})</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id}>
                <td>
                  <input
                    type="text"
                    placeholder="예) A"
                    value={act.name}
                    onChange={(e) => onChange(act.id, 'name', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="예) 설계"
                    value={act.description}
                    onChange={(e) => onChange(act.id, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="예) A, B (없으면 비워두세요)"
                    value={act.predecessors}
                    onChange={(e) => onChange(act.id, 'predecessors', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    placeholder="예) 3"
                    min={0}
                    value={act.duration}
                    onChange={(e) => onChange(act.id, 'duration', e.target.value)}
                  />
                </td>
                <td>
                  <button className="delete-btn" title="삭제" onClick={() => onDelete(act.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button id="add-btn" onClick={onAdd}>+ 항목 추가</button>
      </div>
    </div>
  );
}
