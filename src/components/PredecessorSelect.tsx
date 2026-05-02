import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function PredecessorSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    updatePosition();
    // capture: true 로 모든 스크롤 이벤트(테이블 내부 포함) 감지
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((s) => s !== name)
        : [...selected, name]
    );
  };

  const filtered = options.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const dropdown = open
    ? createPortal(
        <div ref={dropdownRef} className="predecessor-dropdown" style={dropdownStyle}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0' }}>
            <input
              autoFocus
              type="text"
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #cbd5e0',
                borderRadius: 4,
                padding: '5px 8px',
                fontSize: '0.88rem',
                outline: 'none',
                color: '#2d3748',
              }}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="dropdown-empty">
              {options.length === 0 ? '선택 가능한 작업 없음' : '검색 결과 없음'}
            </div>
          ) : (
            filtered.map((name) => (
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
