import { Activity } from './types';

export interface CpmNode {
  id: string;
  name: string;
  description: string;
  duration: number;
  es: number; // Earliest Start
  ef: number; // Earliest Finish
  ls: number; // Latest Start
  lf: number; // Latest Finish
  float: number; // 여유 시간
  isCritical: boolean;
}

export interface CpmEdge {
  from: string;
  to: string;
  isCritical: boolean;
}

export interface CpmResult {
  nodes: CpmNode[];
  edges: CpmEdge[];
  projectDuration: number;
}

export function calculateCpm(activities: Activity[]): CpmResult {
  const valid = activities.filter((a) => a.name.trim() && a.duration.trim());

  // 각 작업을 노드로 변환
  const nodeMap = new Map<string, CpmNode>();
  for (const act of valid) {
    nodeMap.set(act.name.trim(), {
      id: act.name.trim(),
      name: act.name.trim(),
      description: act.description.trim(),
      duration: parseFloat(act.duration),
      es: 0,
      ef: 0,
      ls: 0,
      lf: 0,
      float: 0,
      isCritical: false,
    });
  }

  // 선행 작업 관계 설정 (배열로 직접 사용)
  const predecessorMap = new Map<string, string[]>();
  for (const act of valid) {
    const name = act.name.trim();
    const preds = act.predecessors.filter((p) => nodeMap.has(p));
    predecessorMap.set(name, preds);
  }

  // 위상 정렬 (Topological Sort)
  const sorted = topologicalSort([...nodeMap.keys()], predecessorMap);

  // Forward Pass: ES, EF 계산
  for (const id of sorted) {
    const node = nodeMap.get(id)!;
    const preds = predecessorMap.get(id) ?? [];
    node.es = preds.length === 0 ? 0 : Math.max(...preds.map((p) => nodeMap.get(p)!.ef));
    node.ef = node.es + node.duration;
  }

  const projectDuration = Math.max(...[...nodeMap.values()].map((n) => n.ef));

  // Backward Pass: LS, LF 계산
  for (const id of [...sorted].reverse()) {
    const node = nodeMap.get(id)!;
    const successors = sorted.filter((s) => (predecessorMap.get(s) ?? []).includes(id));
    node.lf = successors.length === 0 ? projectDuration : Math.min(...successors.map((s) => nodeMap.get(s)!.ls));
    node.ls = node.lf - node.duration;
    node.float = node.ls - node.es;
    node.isCritical = node.float === 0;
  }

  // 엣지 생성
  const edges: CpmEdge[] = [];
  for (const [to, preds] of predecessorMap.entries()) {
    for (const from of preds) {
      edges.push({
        from,
        to,
        isCritical: nodeMap.get(from)!.isCritical && nodeMap.get(to)!.isCritical,
      });
    }
  }

  return { nodes: [...nodeMap.values()], edges, projectDuration };
}

// 위상 정렬: 선행 작업 순서대로 노드를 정렬
function topologicalSort(ids: string[], predecessorMap: Map<string, string[]>): string[] {
  const visited = new Set<string>();
  const result: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    for (const pred of predecessorMap.get(id) ?? []) {
      visit(pred);
    }
    result.push(id);
  }

  for (const id of ids) visit(id);
  return result;
}
