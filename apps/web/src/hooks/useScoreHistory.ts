import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api-client';

export interface ScoreHistoryPoint {
  date: string;
  totalScore: number;
}

export interface ScoreHistory {
  current: number | null;
  weekDelta: number;
  points: ScoreHistoryPoint[];
}

export function useScoreHistory() {
  return useQuery<ScoreHistory>({
    queryKey: ['score-history'],
    queryFn: () => api.get<ScoreHistory>('/score/history'),
    refetchInterval: 60_000,
  });
}