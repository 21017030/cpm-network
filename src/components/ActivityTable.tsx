import { Activity, Unit } from '../types';

// 부모(App)로부터 받는 props 타입 정의
interface Props {
  activities: Activity[];  // 현재 작업 목록
  unit: Unit;              // 선택된 시간 단위
  onAdd: () => void;       // 행 추가 핸들러
  onChange: (id: number, field: keyof Activity, value: string) => void; // 셀 값 변경 핸들러
  onDelete: (id: number) => void;   // 행 삭제 핸들러
  onUnitChange: (unit: Unit) => void; // 시간 단위 변경 핸들러
}

// 단위 코드를 한글 레이블로 변환
const unitLabel: Record<Unit, string> = {
  hour: '시간',
  day: '일',
  week: '주',
};

// 작업 입력 테이블 컴포넌트
// - 시간 단위 선택 (시간 / 일 / 주) — 전체 공통 적용
// - 작업별 입력 행 (작업명, 설명, 선행 작업, 소요 기간)
// - 행 추가 / 삭제 기능
export default function ActivityTable({ activities, unit, onAdd, onChange, onDelete, onUnitChange }: Props) {
  return (
    <div>
      {/* 전체 공통 시간 단위 선택 */}
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
              {/* 선택된 단위에 따라 헤더 텍스트 동적 변경 */}
              <th>소요 기간 ({unitLabel[unit]})</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {/* 작업 목록을 순회하며 각 행 렌더링 */}
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
                  {/* 선행 작업은 쉼표로 구분해서 입력 (예: A, B) */}
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
