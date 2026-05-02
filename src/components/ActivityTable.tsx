import { useState, useRef, useEffect } from 'react';
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
  examples: string[];
  onLoadExample: (index: number) => void;
  onReset: () => void;
}

const unitLabel: Record<Unit, string> = {
  day: '일',
  week: '주',
};

export default function ActivityTable({ activities, unit, onAdd, onChange, onPredecessorsChange, onDelete, onUnitChange, examples, onLoadExample, onReset }: Props) {
  const [showExamples, setShowExamples] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowExamples(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <th style={{ width: '16%' }}>작업</th>
              <th style={{ width: '38%' }}>작업 설명</th>
              <th style={{ width: '27%' }}>선행 작업</th>
              <th style={{ width: '11%' }}>소요 기간 ({unitLabel[unit]})</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => {
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

        {/* 예시 선택 드롭다운 */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button id="example-btn" onClick={() => setShowExamples(v => !v)}>
            예시 불러오기 {showExamples ? '▲' : '▼'}
          </button>
          {showExamples && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              background: '#fff',
              border: '1px solid #cbd5e0',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 100,
              minWidth: 220,
              overflow: 'hidden',
            }}>
              {examples.map((name, i) => (
                <div
                  key={i}
                  onClick={() => { onLoadExample(i); setShowExamples(false); }}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    color: '#2d3748',
                    borderBottom: i < examples.length - 1 ? '1px solid #e2e8f0' : undefined,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f7fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        <button id="reset-btn" onClick={onReset}>초기화</button>
      </div>
    </div>
  );
}
