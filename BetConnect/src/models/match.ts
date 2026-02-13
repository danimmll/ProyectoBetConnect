export interface MatchEvent {
  type: string;
  team: string;
  player: string;
  playerId?: number | null;
  playerAvatar?: string;
  minute: number;
  score?: string;
}

export interface Match {
  id: number;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  date?: string;
  time?: string;
  league?: string;
  status: 'pending' | 'live' | 'finished';
  jornada: number;
  events?: MatchEvent[];
}
