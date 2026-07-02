export interface LeaderboardEntry {
  session_id: string;
  name: string;
  materials_completed: number;
  total_score: number;
  avg_score: number;
  last_active_at: string;
}