import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function PredecessorSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  // 드롭다운 위치 계산을 위해 트리거 요소 참조
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // 드롭다운 열릴 때 트리거 위치 기준으로 좌표 계산
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
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

  // 드롭다운을 document.body에 Portal로 렌더링 (테이블 overflow 영향 없음)
  const dropdown = open
    ? createPortal(
        <div className="predecessor-dropdown" style={dropdownStyle}>
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
        </div>,
        document.body
      )
    : null;

  return (
    <div className="predecessor-select" ref={triggerRef}>
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
      {dropdown}
    </div>
  );
}
