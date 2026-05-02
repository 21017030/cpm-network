// ─────────────────────────────────────────────
// 선행 작업 다중 선택 컴포넌트
//
// 클릭하면 체크박스 드롭다운이 열리고, 선택된 작업은 태그로 표시된다.
// 드롭다운은 createPortal로 document.body에 렌더링하여
// 테이블 overflow:hidden 영역 밖에서도 잘려 보이지 않도록 한다.
// ─────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  options: string[];   // 선택 가능한 작업명 목록 (자기 자신 제외)
  selected: string[];  // 현재 선택된 작업명 목록
  onChange: (selected: string[]) => void;
}

export default function PredecessorSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef  = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  // 드롭다운의 위치와 크기를 트리거 요소 기준으로 고정(fixed) 좌표로 계산
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

    // autoFocus를 사용하면 브라우저가 포커스된 요소를 뷰포트에 맞추기 위해
    // 자동으로 스크롤을 이동시킨다. Portal로 body에 렌더링되므로
    // 드롭다운이 열릴 때마다 페이지가 스크롤되는 문제가 발생했다.
    // preventScroll: true 옵션으로 스크롤 이동 없이 포커스만 준다.
    requestAnimationFrame(() => searchRef.current?.focus({ preventScroll: true }));

    // capture: true 로 테이블 내부 스크롤 이벤트까지 감지하여 드롭다운 위치를 재계산
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // 트리거 또는 드롭다운 영역 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger  = triggerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 항목 체크/언체크 토글
  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((s) => s !== name)
        : [...selected, name]
    );
  };

  // 검색어로 필터링된 옵션 목록
  const filtered = options.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // 드롭다운 패널: body에 Portal로 렌더링
  const dropdown = open
    ? createPortal(
        <div ref={dropdownRef} className="predecessor-dropdown" style={dropdownStyle}>
          <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0' }}>
            <input
              ref={searchRef}
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
      {/* 트리거 영역: 클릭하면 드롭다운 열기/닫기 */}
      <div className="predecessor-trigger" onClick={() => setOpen((v) => !v)}>
        {selected.length === 0 ? (
          <span className="placeholder">선행 작업 선택</span>
        ) : (
          // 선택된 작업명을 태그로 나열
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
