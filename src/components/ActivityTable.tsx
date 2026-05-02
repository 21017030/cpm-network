import { Activity, Unit } from '../types';
import PredecessorSelect from './PredecessorSelect';

interface Props {
  activities: Activity[];
  unit: Unit;
  onAdd: () => void;
  onChange: (id: number, field: keyof Omit<Activity, 'predecessors'>, value: string) => void;
  onPredecessorsChange: (id: number, predecessors: string[]) => void;
  onDelete: (id: number) => void;
  onUnitChange: (unit: Unit) => void;
  onLoadExample: () => void;
}

const unitLabel: Record<Unit, string> = {
  day: '일',
  week: '주',
};

export default function ActivityTable({ activities, unit, onAdd, onChange, onPredecessorsChange, onDelete, onUnitChange, onLoadExample }: Props) {
  return (
    <div>
      <div className="unit-bar">
        <label htmlFor="global-unit">시간 단위</label>
        <select
          id="global-unit"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as Unit)}
        >
          <option value="day">일</option>
          <option value="week">주</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '11%' }}>작업</th>
              <th style={{ width: '38%' }}>작업 설명</th>
              <th style={{ width: '27%' }}>선행 작업</th>
              <th style={{ width: '16%' }}>소요 기간 ({unitLabel[unit]})</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
              // 현재 행 자신을 제외한 작업명 목록 (이름이 입력된 것만)
              const options = activities
                .filter((a) => a.id !== act.id && a.name.trim())
                .map((a) => a.name.trim());

              return (
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
                    {/* 체크박스 드롭다운으로 선행 작업 선택 */}
                    <PredecessorSelect
                      options={options}
                      selected={act.predecessors}
                      onChange={(preds) => onPredecessorsChange(act.id, preds)}
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
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button id="add-btn" onClick={onAdd}>+ 항목 추가</button>
        <button id="example-btn" onClick={onLoadExample}>예시 불러오기</button>
      </div>
    </div>
  );
}
