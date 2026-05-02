import { useState, useRef, useEffect } from 'react';

interface Props {
  options: string[];       // 선택 가능한 작업명 목록 (현재 행 제외)
  selected: string[];      // 현재 선택된 선행 작업 목록
  onChange: (selected: string[]) => void;
}

// 선행 작업을 체크박스 드롭다운으로 선택하는 컴포넌트
export default function PredecessorSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="predecessor-select" ref={ref}>
      {/* 선택된 항목 표시 & 드롭다운 토글 */}
      <div className="predecessor-trigger" onClick={() => setOpen((v) => !v)}>
        {selected.length === 0 ? (
          <span className="placeholder">선행 작업 선택</span>
        ) : (
          <div className="tags">
            {selected.map((s) => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        )}
        <span className="arrow">{open ? '▲' : '▼'}</span>
      </div>

      {/* 체크박스 드롭다운 */}
      {open && (
        <div className="predecessor-dropdown">
          {options.length === 0 ? (
            <div className="dropdown-empty">선택 가능한 작업 없음</div>
          ) : (
            options.map((name) => (
              <label key={name} className="dropdown-item">
                <input
                  type="checkbox"
                  checked={selected.includes(name)}
                  onChange={() => toggle(name)}
                />
                {name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
