export interface Standing {
  team?: string;
  teamName?: string;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  matchesPlayed: number;
  wins?: number;
  draws?: number;
  losses?: number;
  position?: number;
}
