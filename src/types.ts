export type Unit = 'hour' | 'day' | 'week';

export interface Activity {
  id: number;
  name: string;
  description: string;
  predecessors: string;
  duration: string;
}
