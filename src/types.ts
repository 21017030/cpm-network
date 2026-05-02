// 소요 기간의 시간 단위: 일 / 주
export type Unit = 'day' | 'week';

// 작업(Activity) 하나를 나타내는 데이터 구조
export interface Activity {
  id: number;        // 각 행을 구분하는 고유 식별자
  name: string;      // 작업명 (예: A, B, C)
  description: string;  // 작업 설명 (예: 설계, 시공)
  predecessors: string[]; // 선행 작업 목록
  duration: string;  // 소요 기간 (문자열로 관리 후 계산 시 숫자 변환)
}
