// ─────────────────────────────────────────────
// CPM(임계 경로법) 핵심 계산 로직
//
// 계산 흐름:
//   1. 입력 데이터 → 노드 맵 생성
//   2. 위상 정렬(선행 작업 순서 보장)
//   3. 전진 계산(ES, EF)
//   4. 후진 계산(LF, LS)
//   5. 여유 시간(TF) 및 임계 경로 판별
// ─────────────────────────────────────────────

import { Activity } from './types';

// 계산 결과로 생성되는 노드 1개의 구조
export interface CpmNode {
  id: string;
  name: string;
  description: string;
  duration: number;
  es: number;        // Earliest Start  — 최초 착수 가능 시점
  ef: number;        // Earliest Finish — 최초 완료 가능 시점
  ls: number;        // Latest Start    — 최종 착수 가능 시점
  lf: number;        // Latest Finish   — 최종 완료 가능 시점
  float: number;     // Total Float     — 총 여유 시간 (LS - ES)
  isCritical: boolean; // TF = 0 이면 임계 작업
}

// 두 노드를 잇는 화살표(엣지) 구조
export interface CpmEdge {
  from: string;
  to: string;
  isCritical: boolean; // 양쪽 노드가 모두 임계 작업일 때 true
}

// calculateCpm의 최종 반환 타입
export interface CpmResult {
  nodes: CpmNode[];
  edges: CpmEdge[];
  projectDuration: number; // 전체 프로젝트 최소 완료 기간
}

// ─── 메인 함수 ───────────────────────────────
// 사용자가 입력한 Activity 배열을 받아 CPM을 계산하고 결과를 반환한다.
export function calculateCpm(activities: Activity[]): CpmResult {
  // 이름과 기간이 모두 입력된 행만 유효 데이터로 사용
  const valid = activities.filter((a) => a.name.trim() && a.duration.trim());

  // ① 노드 맵 생성: 작업명을 key로, CpmNode 초기값을 value로 저장
  const nodeMap = new Map<string, CpmNode>();
  for (const act of valid) {
    nodeMap.set(act.name.trim(), {
      id: act.name.trim(),
      name: act.name.trim(),
      description: act.description.trim(),
      duration: parseFloat(act.duration),
      es: 0, ef: 0, ls: 0, lf: 0, float: 0,
      isCritical: false,
    });
  }

  // ② 선행 작업 관계 맵 생성
  // 존재하지 않는 작업명이 입력된 경우 필터링하여 무시
  const predecessorMap = new Map<string, string[]>();
  for (const act of valid) {
    const name = act.name.trim();
    const preds = act.predecessors.filter((p) => nodeMap.has(p));
    predecessorMap.set(name, preds);
  }

  // ③ 위상 정렬: 선행 작업이 항상 후행 작업보다 앞에 오도록 순서 결정
  const sorted = topologicalSort([...nodeMap.keys()], predecessorMap);

  // ④ 전진 계산 (Forward Pass): 앞에서 뒤로 ES, EF 계산
  //    ES = max(선행 작업들의 EF)  /  시작 작업은 ES = 0
  //    EF = ES + DR
  for (const id of sorted) {
    const node = nodeMap.get(id)!;
    const preds = predecessorMap.get(id) ?? [];
    node.es = preds.length === 0 ? 0 : Math.max(...preds.map((p) => nodeMap.get(p)!.ef));
    node.ef = node.es + node.duration;
  }

  // 프로젝트 최소 완료 기간 = 모든 종료 노드의 EF 중 최댓값
  const projectDuration = Math.max(...[...nodeMap.values()].map((n) => n.ef));

  // ⑤ 후진 계산 (Backward Pass): 뒤에서 앞으로 LF, LS, TF 계산
  //    LF = min(후속 작업들의 LS)  /  종료 작업은 LF = projectDuration
  //    LS = LF - DR
  //    TF = LS - ES
  for (const id of [...sorted].reverse()) {
    const node = nodeMap.get(id)!;
    const successors = sorted.filter((s) => (predecessorMap.get(s) ?? []).includes(id));
    node.lf    = successors.length === 0 ? projectDuration : Math.min(...successors.map((s) => nodeMap.get(s)!.ls));
    node.ls    = node.lf - node.duration;
    node.float = node.ls - node.es;
    node.isCritical = node.float === 0;
  }

  // ⑥ 엣지 생성: 선행 관계 맵을 순회하여 from→to 방향의 엣지 목록 생성
  const edges: CpmEdge[] = [];
  for (const [to, preds] of predecessorMap.entries()) {
    for (const from of preds) {
      edges.push({
        from,
        to,
        // 연결된 두 노드가 모두 임계 작업이면 이 엣지도 임계 경로에 해당
        isCritical: nodeMap.get(from)!.isCritical && nodeMap.get(to)!.isCritical,
      });
    }
  }

  return { nodes: [...nodeMap.values()], edges, projectDuration };
}

// ─── 위상 정렬 (DFS 방식) ────────────────────
// 선행 작업이 항상 후행 작업보다 앞에 위치하도록 노드 순서를 결정한다.
// 전진/후진 계산이 올바른 순서로 진행되기 위해 필요하다.
function topologicalSort(ids: string[], predecessorMap: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    // 선행 작업을 먼저 방문한 뒤 현재 노드를 결과에 추가 (후위 순회)
    for (const pred of predecessorMap.get(id) ?? []) {
      visit(pred);
    }
    result.push(id);
  }

  for (const id of ids) visit(id);
  return result;
}
