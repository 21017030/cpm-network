// ─────────────────────────────────────────────
// 앱 전체에서 사용하는 기본 타입 정의
// ─────────────────────────────────────────────

// 소요 기간의 시간 단위: 일 / 주
export type Unit = 'day' | 'week';

// 작업 테이블 한 행을 나타내는 데이터 구조.
// duration은 입력 도중 빈 문자열("")이 될 수 있어 string으로 관리하고,
// CPM 계산 시 parseFloat으로 숫자로 변환한다.
export interface Activity {
  id: number;           // 각 행을 구분하는 고유 식별자 (삭제·추가 시 React key로 사용)
  name: string;         // 작업명 (예: A, B, C)
  description: string;  // 작업 설명 (예: 설계, 시공)
  predecessors: string[]; // 선행 작업 이름 목록 (예: ['A', 'B'])
  duration: string;     // 소요 기간 문자열
}
